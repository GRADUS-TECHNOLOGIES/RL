import {
    getDownloadURL,
    getStorage,
    ref,
    uploadBytesResumable,
} from 'firebase/storage';
import { app } from '../firebase';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
// Tiptap
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextStyle from '@tiptap/extension-text-style';
import TextAlign from '@tiptap/extension-text-align';
import Color from '@tiptap/extension-color';
import Emoji from '@tiptap/extension-emoji';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
// Componentes
import EditorToolbar from '../components/EditorToolbar';
import { sanitizeHtml } from '../utils/sanitize';
import { GlobalWorkerOptions } from 'pdfjs-dist';

GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

// ── Constantes ─────────────────────────────────────────────────────────────

const CATEGORIES = [
    { value: 'uncategorized', label: 'Sin categoría'           },
    { value: 'actualidad',    label: 'Actualidad urgente'      },
    { value: 'analisis',      label: 'Análisis legislativo'    },
    { value: 'derecho',       label: 'Derecho y constitución'  },
    { value: 'electoral',     label: 'Electoral'               },
    { value: 'entrevista',    label: 'Entrevista'              },
    { value: 'internacional', label: 'Política internacional'  },
    { value: 'investigacion', label: 'Investigación y datos'   },
    { value: 'opinion',       label: 'Opinión y debate'        },
    { value: 'politica',      label: 'Poder y política'        },
];

// ── Primitivos ─────────────────────────────────────────────────────────────

const SectionLabel = ({ label }) => (
    <div className="flex items-center gap-3 mb-4">
        <div className="w-[2px] h-4 bg-[#B076CE] flex-shrink-0" />
        <span className="text-[10px] font-black text-[#B076CE] uppercase tracking-[0.3em]">{label}</span>
        <div className="flex-1 h-px bg-gray-100" />
    </div>
);

const Chevron = () => (
    <svg className="w-3 h-3 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
);

const PanelHeader = ({ label, purple = false }) => (
    <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 bg-gray-50/50 flex-shrink-0">
        <div className={`w-[2px] h-4 flex-shrink-0 ${purple ? 'bg-[#B076CE]' : 'bg-gray-300'}`} />
        <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${purple ? 'text-[#B076CE]' : 'text-gray-400'}`}>
            {label}
        </span>
    </div>
);

const UploadProgress = ({ progress }) => (
    <div className="mt-2 h-[2px] bg-gray-100">
        <div
            className="h-[2px] bg-[#B076CE] transition-all duration-300"
            style={{ width: `${progress}%` }}
        />
    </div>
);

const Spinner = () => (
    <svg className="animate-spin w-6 h-6 text-[#B076CE]" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
);

// ── UpdatePost ─────────────────────────────────────────────────────────────

export default function UpdatePost() {
    const { postId }      = useParams();
    const { currentUser } = useSelector((state) => state.user);
    const navigate        = useNavigate();

    const [file, setFile]                           = useState(null);
    const [pdfFile, setPdfFile]                     = useState(null);
    const [imageUploadProgress, setImageUploadProgress] = useState(null);
    const [pdfUploadProgress, setPdfUploadProgress]     = useState(null);
    const [imageUploadError, setImageUploadError]       = useState(null);
    const [pdfUploadError, setPdfUploadError]           = useState(null);
    const [formData, setFormData]                   = useState({
        title: '', category: 'uncategorized', content: '', image: '', pdf: '', isMagazine: false,
    });
    const [isMagazineMode, setIsMagazineMode] = useState(false);
    const [publishError, setPublishError]     = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [loading, setLoading]               = useState(false);

    const setMode = (isMag) => {
        setIsMagazineMode(isMag);
        setFormData((prev) => ({ ...prev, isMagazine: isMag }));
    };

    const handleContentUpdate = useCallback(({ editor }) => {
        setFormData((prev) => ({ ...prev, content: editor.getHTML() }));
    }, []);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                bulletList:  { HTMLAttributes: { class: 'list-disc list-inside' } },
                orderedList: { HTMLAttributes: { class: 'list-decimal list-inside' } },
            }),
            Underline,
            TextStyle,
            Color.configure({ types: ['textStyle'] }),
            Link.configure({ openOnClick: false }),
            Emoji.configure({ allowInline: true }),
            Table.configure({ resizable: true }),
            TableRow, TableCell, TableHeader,
            Placeholder.configure({ placeholder: 'Comienza a escribir tu contenido aquí...' }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
        ],
        content:   formData.content,
        editable:  true,
        onUpdate:  handleContentUpdate,
        autofocus: 'end',
    });

    // ── Fetch post ────────────────────────────────────────────────────────

    useEffect(() => {
        document.title = 'Actualizar publicación – Revista Legislatura';

        const fetchPost = async () => {
            setLoading(true);
            try {
                const res  = await fetch(`/api/post/getposts?postId=${postId}`);
                const data = await res.json();
                if (!res.ok || !data.posts?.length) { setPublishError('Publicación no encontrada'); return; }

                const post = data.posts[0];
                setFormData({
                    title:     post.title,
                    category:  post.category,
                    content:   post.content,
                    image:     post.image,
                    pdf:       post.pdf || '',
                    isMagazine: !!post.pdf,
                    _id:       post._id,
                });
                setIsMagazineMode(!!post.pdf);
                if (editor) editor.commands.setContent(post.content);
            } catch {
                setPublishError('Error al cargar la publicación');
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [postId, editor]);

    // ── Upload helpers ────────────────────────────────────────────────────

    const uploadFile = (fileObj, setProgress, setError, onSuccess) => {
        if (!fileObj) { setError('Por favor selecciona un archivo'); return; }
        setError(null);
        setProgress(0);
        const storage    = getStorage(app);
        const storageRef = ref(storage, `${Date.now()}-${fileObj.name}`);
        const task       = uploadBytesResumable(storageRef, fileObj);
        task.on(
            'state_changed',
            (snap) => setProgress(((snap.bytesTransferred / snap.totalBytes) * 100).toFixed(0)),
            (err)  => { console.error(err); setError('Error al cargar el archivo'); setProgress(null); },
            ()     => getDownloadURL(task.snapshot.ref).then((url) => { setProgress(null); setError(null); onSuccess(url); }),
        );
    };

    const handleUploadImage = () =>
        uploadFile(file, setImageUploadProgress, setImageUploadError, (url) =>
            setFormData((prev) => ({ ...prev, image: url }))
        );

    const handleUploadPdf = () =>
        uploadFile(pdfFile, setPdfUploadProgress, setPdfUploadError, (url) =>
            setFormData((prev) => ({ ...prev, pdf: url }))
        );

    // ── Submit ────────────────────────────────────────────────────────────

    const handleSubmit = async (e) => {
        e.preventDefault();
        setPublishError(null);
        setSuccessMessage(null);

        if (!formData.title.trim()) { setPublishError('El título es obligatorio'); return; }
        if (isMagazineMode && !formData.pdf)    { setPublishError('El PDF es obligatorio para una revista'); return; }
        if (!isMagazineMode && !formData.image) { setPublishError('La imagen es obligatoria para un artículo'); return; }

        try {
            const res = await fetch(`/api/post/updatepost/${formData._id}/${currentUser._id}`, {
                method:  'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body:    JSON.stringify(formData),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Hubo un problema al actualizar');
            }
            const data = await res.json();
            setSuccessMessage('Publicación actualizada con éxito');
            setTimeout(() => navigate(`/post/${data.slug}`), 1500);
        } catch (err) {
            console.error('Error al actualizar:', err);
            setPublishError(err.message || 'No se pudo actualizar la publicación');
        }
    };

    // ── Loading state ─────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-3 bg-white">
                <Spinner />
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Cargando</p>
            </div>
        );
    }

    // ── JSX ───────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-white p-4 md:p-8">
            <div className="max-w-7xl mx-auto">

                {/* ── Encabezado ── */}
                <div className="mb-8 pb-6 border-b border-gray-100">
                    <SectionLabel label="Dashboard" />
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900">Actualizar publicación</h1>
                    <p className="text-sm text-gray-400 font-light mt-1">
                        Edita el contenido o los archivos de esta publicación
                    </p>
                </div>

                <form className="flex flex-col gap-6" onSubmit={handleSubmit}>

                    {/* ── Información básica ── */}
                    <div className="border border-gray-100 p-5">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
                            Información básica
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input
                                type="text"
                                id="title"
                                placeholder="Título de la publicación"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="md:col-span-2 border border-gray-200 px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-300 placeholder:font-light outline-none focus:border-[#B076CE] transition-colors bg-white"
                            />
                            <div className="relative">
                                <select
                                    id="category"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full appearance-none border border-gray-200 px-4 py-2.5 pr-8 text-sm text-gray-700 outline-none focus:border-[#B076CE] transition-colors bg-white cursor-pointer"
                                >
                                    {CATEGORIES.map(({ value, label }) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                    <Chevron />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Toggle de modo ── */}
                    <div className="flex flex-col gap-3">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                            Tipo de publicación
                        </p>
                        <div className="flex w-fit border border-gray-200">
                            <button
                                type="button"
                                onClick={() => setMode(false)}
                                className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-200 ${
                                    !isMagazineMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-400 hover:text-gray-900'
                                }`}
                            >
                                Artículo
                            </button>
                            <button
                                type="button"
                                onClick={() => setMode(true)}
                                className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] border-l border-gray-200 transition-all duration-200 ${
                                    isMagazineMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-400 hover:text-gray-900'
                                }`}
                            >
                                Revista
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 font-light">
                            {isMagazineMode
                                ? 'Modo revista: sube un nuevo PDF para reemplazar el actual.'
                                : 'Modo artículo: edita el contenido y actualiza la imagen de portada si es necesario.'}
                        </p>
                    </div>

                    {/* ── Modo Artículo ── */}
                    {!isMagazineMode && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[600px]">

                            {/* Panel: Editor */}
                            <div className="border border-gray-100 flex flex-col overflow-hidden">
                                <PanelHeader label="Editor" purple />

                                {/* Imagen de portada */}
                                <div className="p-5 border-b border-gray-100 flex-shrink-0">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">
                                        Imagen de portada
                                    </p>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1 border border-gray-200 hover:border-[#B076CE] transition-colors cursor-pointer overflow-hidden">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                            />
                                            <div className="px-3 py-2.5 flex items-center gap-2">
                                                <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <span className="text-xs text-gray-400 font-light truncate">
                                                    {file ? file.name : 'Seleccionar imagen nueva...'}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleUploadImage}
                                            disabled={!!imageUploadProgress}
                                            className="px-4 py-2 border border-gray-900 text-[10px] font-black text-gray-900 uppercase tracking-[0.15em] hover:bg-[#B076CE] hover:border-[#B076CE] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all whitespace-nowrap"
                                        >
                                            {imageUploadProgress ? `${imageUploadProgress}%` : 'Actualizar'}
                                        </button>
                                    </div>
                                    {imageUploadProgress && <UploadProgress progress={imageUploadProgress} />}
                                    {formData.image && !imageUploadProgress && (
                                        <p className="mt-2 text-[9px] font-black text-green-500 uppercase tracking-[0.2em]">Imagen cargada</p>
                                    )}
                                    {imageUploadError && (
                                        <p className="mt-2 text-[9px] font-black text-red-500 uppercase tracking-[0.2em]">{imageUploadError}</p>
                                    )}
                                </div>

                                {/* Editor TipTap */}
                                <div className="flex-1 overflow-hidden flex flex-col gap-3 p-4">
                                    <div className="flex-shrink-0">
                                        <EditorToolbar editor={editor} />
                                    </div>
                                    <div className="flex-1 overflow-y-auto border border-gray-200 focus-within:border-[#B076CE] transition-colors bg-white min-h-[200px]">
                                        <EditorContent editor={editor} className="ProseMirror h-full" />
                                    </div>
                                </div>
                            </div>

                            {/* Panel: Vista previa */}
                            <div className="border border-gray-100 flex flex-col overflow-hidden">
                                <PanelHeader label="Vista previa" />

                                <div className="flex-1 overflow-auto p-6">
                                    {formData.category !== 'uncategorized' && (
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-[2px] h-4 bg-[#B076CE]" />
                                            <span className="text-[10px] font-black text-[#B076CE] uppercase tracking-[0.3em]">
                                                {formData.category}
                                            </span>
                                        </div>
                                    )}

                                    <h1 className="text-2xl font-black text-gray-900 leading-tight mb-3">
                                        {formData.title || <span className="text-gray-300">Título de la publicación</span>}
                                    </h1>

                                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-5 pb-4 border-b border-gray-100">
                                        {new Date().toLocaleDateString('es-MX', {
                                            year: 'numeric', month: 'long', day: 'numeric',
                                        })}
                                    </p>

                                    {formData.image && (
                                        <img
                                            src={formData.image}
                                            alt="Vista previa"
                                            className="w-full h-48 object-cover mb-5"
                                        />
                                    )}

                                    <div
                                        className="prose prose-sm max-w-none post-content"
                                        dangerouslySetInnerHTML={{
                                            __html: sanitizeHtml(formData.content) ||
                                                '<p style="color:#d1d5db;font-size:0.875rem;font-weight:300">El contenido aparecerá aquí mientras editas...</p>',
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Modo Revista ── */}
                    {isMagazineMode && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                            {/* Panel: Upload PDF */}
                            <div className="border border-gray-100 flex flex-col overflow-hidden">
                                <PanelHeader label="Actualizar PDF" purple />

                                <div className="p-6 flex flex-col gap-4">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                        Nuevo archivo PDF de la revista
                                    </p>

                                    <div className="flex gap-2">
                                        <div className="relative flex-1 border border-gray-200 hover:border-[#B076CE] transition-colors cursor-pointer overflow-hidden">
                                            <input
                                                type="file"
                                                accept="application/pdf"
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                                            />
                                            <div className="px-3 py-2.5 flex items-center gap-2">
                                                <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                </svg>
                                                <span className="text-xs text-gray-400 font-light truncate">
                                                    {pdfFile ? pdfFile.name : 'Seleccionar nuevo PDF...'}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleUploadPdf}
                                            disabled={!!pdfUploadProgress}
                                            className="px-4 py-2 border border-gray-900 text-[10px] font-black text-gray-900 uppercase tracking-[0.15em] hover:bg-[#B076CE] hover:border-[#B076CE] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all whitespace-nowrap"
                                        >
                                            {pdfUploadProgress ? `${pdfUploadProgress}%` : 'Actualizar'}
                                        </button>
                                    </div>

                                    {pdfUploadProgress && <UploadProgress progress={pdfUploadProgress} />}
                                    {formData.pdf && !pdfUploadProgress && (
                                        <p className="text-[9px] font-black text-green-500 uppercase tracking-[0.2em]">PDF cargado correctamente</p>
                                    )}
                                    {pdfUploadError && (
                                        <p className="text-[9px] font-black text-red-500 uppercase tracking-[0.2em]">{pdfUploadError}</p>
                                    )}

                                    <div className="border border-gray-100 p-4 mt-2">
                                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-2">Notas</p>
                                        <ul className="text-xs text-gray-400 font-light space-y-1 leading-relaxed list-none">
                                            <li>Sube un nuevo PDF para reemplazar el actual.</li>
                                            <li>Si no seleccionas un nuevo PDF, se conservará el existente.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Panel: Vista previa PDF */}
                            <div className="border border-gray-100 flex flex-col overflow-hidden">
                                <PanelHeader label="Vista previa" />
                                {formData.pdf ? (
                                    <div className="p-4 flex-1" style={{ minHeight: '600px' }}>
                                        <embed
                                            src={formData.pdf}
                                            type="application/pdf"
                                            width="100%"
                                            height="100%"
                                            style={{ minHeight: '568px' }}
                                        />
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
                                        <div className="w-[2px] h-8 bg-gray-100 mb-4" />
                                        <p className="text-sm text-gray-300 font-light">
                                            Carga un PDF para ver la vista previa
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── Mensajes ── */}
                    {(publishError || successMessage) && (
                        <div className="space-y-3">
                            {publishError && (
                                <div className="flex items-center gap-3 px-4 py-3 border border-red-100 bg-red-50">
                                    <div className="w-[2px] h-4 bg-red-400 flex-shrink-0" />
                                    <p className="text-xs text-red-500 font-light">{publishError}</p>
                                </div>
                            )}
                            {successMessage && (
                                <div className="flex items-center gap-3 px-4 py-3 border border-green-200 bg-green-50">
                                    <div className="w-[2px] h-4 bg-green-500 flex-shrink-0" />
                                    <p className="text-xs text-green-600 font-light">{successMessage}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Actualizar ── */}
                    <button
                        type="submit"
                        className="w-full py-3.5 bg-gray-900 text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-[#B076CE] transition-colors duration-300"
                    >
                        Actualizar publicación
                    </button>
                </form>
            </div>
        </div>
    );
}
