import {
    Alert,
    Button,
    FileInput,
    Select,
    TextInput,
} from 'flowbite-react';
import {
    getDownloadURL,
    getStorage,
    ref,
    uploadBytesResumable,
} from 'firebase/storage';
import { app } from '../firebase';
import { useEffect, useState, useCallback } from 'react';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useNavigate } from 'react-router-dom';
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
import { GlobalWorkerOptions } from 'pdfjs-dist';

// Configura el worker de pdfjs (versión fija)
GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

export default function CreatePost() {
    useEffect(() => {
        document.title = 'Crear publicación - Revista Legislatura';
    });

    const [file, setFile] = useState(null);
    const [pdfFile, setPdfFile] = useState(null);
    const [imageUploadProgress, setImageUploadProgress] = useState(null);
    const [pdfUploadProgress, setPdfUploadProgress] = useState(null);
    const [imageUploadError, setImageUploadError] = useState(null);
    const [pdfUploadError, setPdfUploadError] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        category: 'uncategorized',
        content: '',
        image: '',
        pdf: '',
        isMagazine: false,
    });
    const [isMagazineMode, setIsMagazineMode] = useState(false);
    const [publishError, setPublishError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const navigate = useNavigate();

    const handleContentUpdate = useCallback(({ editor }) => {
        const content = editor.getHTML();
        setFormData((prev) => ({ ...prev, content }));
    }, []);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                bulletList: { HTMLAttributes: { class: 'list-disc list-inside' } },
                orderedList: { HTMLAttributes: { class: 'list-decimal list-inside' } },
            }),
            Underline,
            TextStyle,
            Color.configure({ types: ['textStyle'] }),
            Link.configure({ openOnClick: false }),
            Emoji.configure({ allowInline: true }),
            Table.configure({ resizable: true }),
            TableRow,
            TableCell,
            TableHeader,
            Placeholder.configure({ placeholder: 'Comienza a escribir tu contenido aquí...' }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
        ],
        content: formData.content,
        editable: true,
        onUpdate: handleContentUpdate,
        autofocus: 'end',
    });


    // Función para cargar la imagen
    const handleUploadImage = async () => {
        if (!file) {
            setImageUploadError('Por favor seleccione una imagen');
            return;
        }
        setImageUploadError(null);
        setImageUploadProgress(0);
        try {
            const storage = getStorage(app);
            const fileName = `${new Date().getTime()}-${file.name}`;
            const storageRef = ref(storage, fileName);
            const uploadTask = uploadBytesResumable(storageRef, file);
            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const progress =
                        (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setImageUploadProgress(progress.toFixed(0));
                },
                (error) => {
                    console.error('Upload failed:', error);
                    setImageUploadError('Failed to upload image');
                    setImageUploadProgress(null);
                },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        setImageUploadProgress(null);
                        setImageUploadError(null);
                        setFormData((prev) => ({ ...prev, image: downloadURL }));
                    });
                }
            );
        } catch (error) {
            console.error('Unexpected error:', error);
            setImageUploadError('An unexpected error occurred');
            setImageUploadProgress(null);
        }
    };

    // Función para cargar el PDF
    const handleUploadPdf = async () => {
        if (!pdfFile) {
            setPdfUploadError('Por favor seleccione un archivo PDF');
            return;
        }
        setPdfUploadError(null);
        setPdfUploadProgress(0);
        try {
            const storage = getStorage(app);
            const fileName = `${new Date().getTime()}-${pdfFile.name}`;
            const storageRef = ref(storage, fileName);
            const uploadTask = uploadBytesResumable(storageRef, pdfFile);
            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const progress =
                        (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setPdfUploadProgress(progress.toFixed(0));
                },
                (error) => {
                    console.error('PDF Upload failed:', error);
                    setPdfUploadError('Failed to upload PDF');
                    setPdfUploadProgress(null);
                },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        setPdfUploadProgress(null);
                        setPdfUploadError(null);
                        setFormData((prev) => ({ ...prev, pdf: downloadURL }));
                    });
                }
            );
        } catch (error) {
            console.error('Unexpected error:', error);
            setPdfUploadError('An unexpected error occurred');
            setPdfUploadProgress(null);
        }
    };

    // Manejo del envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        setPublishError(null);
        setSuccessMessage(null);

        // Validaciones básicas
        if (!formData.title.trim()) {
            setPublishError('El título es obligatorio');
            document.getElementById('title')?.focus();
            return;
        }

        if (isMagazineMode && !formData.pdf) {
            setPublishError('El archivo PDF es obligatorio');
            return;
        }

        if (!isMagazineMode && !formData.image) {
            setPublishError('La imagen es obligatoria');
            return;
        }

        try {
            const res = await fetch('/api/post/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
                credentials: 'include'
            });

            const data = await res.json();
            if (!res.ok) {
                setPublishError(data.message || 'Hubo un problema al publicar el post');
                return;
            }

            setSuccessMessage('¡Post creado con éxito!');
            setTimeout(() => {
                navigate(`/post/${data.slug}`);
            }, 1500);
        } catch (error) {
            setPublishError('No se pudo publicar el post');
            console.error('Error al publicar:', error);
        }
    };

    return (
        <div className='min-h-screen bg-white dark:bg-white p-4 md:p-8'>
            <div className='max-w-7xl mx-auto'>
                {/* Encabezado */}
                <div className='mb-8'>
                    <h1 className='text-4xl font-bold text-black dark:text-black mb-2'>Crear publicación</h1>
                    <p className='text-gray-600 dark:text-gray-400'>Redacta tu artículo o carga una revista con vista previa en tiempo real</p>
                </div>

                <form className='flex flex-col gap-6' onSubmit={handleSubmit}>
                    {/* Título y categoría */}
                    <div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700'>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <TextInput
                                type="text"
                                placeholder="Título del post"
                                id="title"
                                required
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData({ ...formData, title: e.target.value })
                                }
                                className="md:col-span-2"
                            />
                            <Select
                                id="category"
                                value={formData.category}
                                onChange={(e) =>
                                    setFormData({ ...formData, category: e.target.value })
                                }
                            >
                                <option value="uncategorized">Categoría</option>
                                <option value="actualidad">Actualidad urgente</option>
                                <option value="analisis">Análisis legislativo</option>
                                <option value="derecho">Derecho y constitución</option>
                                <option value="electoral">Electoral</option>
                                <option value="entrevista">Entrevista</option>
                                <option value="internacional">Política internacional</option>
                                <option value="investigacion">Investigación y datos</option>
                                <option value="opinion">Opinión y debate</option>
                                <option value="politica">Poder y política</option>
                            </Select>
                        </div>
                    </div>

                    {/* Botón para alternar entre modos */}
                    <div className='flex gap-4 justify-center'>
                        <Button
                            type="button"
                            onClick={() => {
                                setIsMagazineMode(!isMagazineMode);
                                setFormData((prev) => ({
                                    ...prev,
                                    isMagazine: !isMagazineMode,
                                }));
                            }}
                            className={`px-8 py-3 font-semibold rounded-lg transition-all duration-300 ${
                                !isMagazineMode
                                    ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg'
                                    : 'bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                            }`}
                        >
                            📝 Artículo
                        </Button>
                        <Button
                            type="button"
                            onClick={() => {
                                setIsMagazineMode(!isMagazineMode);
                                setFormData((prev) => ({
                                    ...prev,
                                    isMagazine: !isMagazineMode,
                                }));
                            }}
                            className={`px-8 py-3 font-semibold rounded-lg transition-all duration-300 ${
                                isMagazineMode
                                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-lg'
                                    : 'bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                            }`}
                        >
                            📚 Revista
                        </Button>
                    </div>

                    {/* Modo Artículo con Preview */}
                    {!isMagazineMode && (
                        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[600px]'>
                            {/* Editor (Izquierda) */}
                            <div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col'>
                                <div className='bg-[#B076CE] p-4 border-b border-black'>
                                    <h2 className='text-white font-semibold flex items-center gap-2'>
                                        ✏️ Editor
                                    </h2>
                                </div>

                                {/* Carga de imagen */}
                                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                                    <div className="flex flex-col gap-3">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Selecciona una imagen</label>
                                            <FileInput
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                                className="w-full"
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            onClick={handleUploadImage}
                                            disabled={!!imageUploadProgress}
                                            className="w-full bg-black hover:bg-[#B076CE] text-white font-semibold py-2 rounded-lg transition-all"
                                        >
                                            {imageUploadProgress ? (
                                                <div className="flex items-center gap-2 justify-center">
                                                    <span>Cargando {imageUploadProgress}%</span>
                                                </div>
                                            ) : (
                                                '⬆️ Cargar imagen'
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                {/* Editor TipTap */}
                                <div className="flex-1 overflow-hidden p-4 flex flex-col gap-3">
                                    <div className="flex-shrink-0">
                                        <EditorToolbar editor={editor} />
                                    </div>
                                    <div className="flex-1 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900">
                                        <EditorContent
                                            editor={editor}
                                            className="ProseMirror h-full"
                                        />
                                    </div>
                                </div>

                                {imageUploadError && <Alert color='failure' className='m-4'>{imageUploadError}</Alert>}
                            </div>

                            {/* Preview (Derecha) */}
                            <div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col'>
                                <div className='bg-black p-4 border-b border-[#B076CE]'>
                                    <h2 className='text-white font-semibold flex items-center gap-2'>
                                        👁️ Vista previa
                                    </h2>
                                </div>

                                <div className="flex-1 overflow-auto p-6">
                                    {/* Imagen */}
                                    {formData.image && (
                                        <div className="mb-6 rounded-lg overflow-hidden shadow-md border border-gray-200 dark:border-gray-700">
                                            <img
                                                src={formData.image}
                                                alt="Vista previa"
                                                className="w-full h-64 object-cover"
                                            />
                                        </div>
                                    )}

                                    {/* Título */}
                                    <h1 className='text-3xl font-bold text-gray-900 dark:text-white mb-3'>
                                        {formData.title || 'Título del post'}
                                    </h1>

                                    {/* Categoría y metadata */}
                                    <div className='flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700'>
                                        <span className='px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 text-xs font-semibold rounded-full capitalize'>
                                            {formData.category === 'uncategorized' ? 'Sin categoría' : formData.category}
                                        </span>
                                        <span className='text-sm text-gray-500 dark:text-gray-400'>
                                            {new Date().toLocaleDateString('es-ES')}
                                        </span>
                                    </div>

                                    {/* Contenido renderizado */}
                                    <div className='preview-content text-gray-700 dark:text-gray-300 leading-relaxed'>
                                        <div
                                            dangerouslySetInnerHTML={{ __html: formData.content || '<p className="text-gray-500">El contenido aparecerá aquí...</p>' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Modo Revista */}
                    {isMagazineMode && (
                        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                            {/* Carga de PDF (Izquierda) */}
                            <div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700'>
                                <h2 className='text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2'>
                                    📚 Cargar revista
                                </h2>
                                <div className="flex flex-col gap-4">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Selecciona un archivo PDF</label>
                                        <FileInput
                                            type="file"
                                            accept="application/pdf"
                                            onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                                            className="w-full"
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        onClick={handleUploadPdf}
                                        disabled={!!pdfUploadProgress}
                                        className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 rounded-lg transition-all"
                                    >
                                        {pdfUploadProgress ? (
                                            <div className="flex items-center gap-2 justify-center">
                                                <span>Cargando {pdfUploadProgress}%</span>
                                            </div>
                                        ) : (
                                            '⬆️ Cargar PDF'
                                        )}
                                    </Button>
                                    {pdfUploadError && <Alert color='failure'>{pdfUploadError}</Alert>}
                                </div>
                            </div>

                            {/* Preview del PDF (Derecha) */}
                            {formData.pdf && (
                                <div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700'>
                                    <div className='bg-gradient-to-r from-blue-600 to-blue-700 p-4 border-b border-blue-800'>
                                        <h2 className='text-white font-semibold'>👁️ Vista previa PDF</h2>
                                    </div>
                                    <div className="p-4" style={{ height: '600px' }}>
                                        <embed
                                            src={formData.pdf}
                                            type="application/pdf"
                                            width="100%"
                                            height="100%"
                                            className="rounded-lg"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Mensajes de error y éxito */}
                    <div className='space-y-3'>
                        {publishError && <Alert color='failure'>{publishError}</Alert>}
                        {successMessage && <Alert color='success'>{successMessage}</Alert>}
                    </div>

                    {/* Botón de publicar */}
                    <Button
                        type='submit'
                        className="w-full bg-[#B076CE] hover:bg-black text-white font-bold py-4 rounded-lg transition-all shadow-lg"
                    >
                        ✨ PUBLICAR
                    </Button>
                </form>
            </div>
        </div>
    );
}