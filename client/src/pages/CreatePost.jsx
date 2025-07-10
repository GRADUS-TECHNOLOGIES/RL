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
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextStyle from '@tiptap/extension-text-style';
import TextAlign from '@tiptap/extension-text-align';
import Color from '@tiptap/extension-color';
import Emoji from '@tiptap/extension-emoji';
import Blockquote from '@tiptap/extension-blockquote';
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

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            TextStyle,
            Color.configure({ types: ['textStyle'] }),
            BulletList,
            OrderedList,
            ListItem,
            Link.configure({ openOnClick: false }),
            Emoji.configure({ allowInline: true }),
            Blockquote,
            Table.configure({ resizable: true }),
            TableRow,
            TableCell,
            TableHeader,
            Placeholder.configure({ placeholder: 'Escribe algo...' }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
        ],
        content: formData.content || '',
        editable: !isMagazineMode,
        onUpdate: useCallback(({ editor }) => {
            const content = editor.getHTML();
            setFormData((prev) => ({ ...prev, content }));
        }, []),
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
        <div className='p-3 max-w-3xl mx-auto min-h-screen'>
            <h1 className='text-center text-3xl my-7 font-semibold'>Crear publicación</h1>
            <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
                {/* Título y categoría */}
                <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
                    <TextInput
                        type="text"
                        placeholder="Título del post"
                        id="title"
                        required
                        value={formData.title}
                        onChange={(e) =>
                            setFormData({ ...formData, title: e.target.value })
                        }
                        className="w-full sm:flex-1"
                    />
                    <Select
                        id="category"
                        value={formData.category}
                        onChange={(e) =>
                            setFormData({ ...formData, category: e.target.value })
                        }
                        className="w-full sm:w-48"
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

                {/* Botón para alternar entre modos */}
                <Button
                    type="button"
                    onClick={() => {
                        setIsMagazineMode(!isMagazineMode);
                        setFormData((prev) => ({
                            ...prev,
                            isMagazine: !isMagazineMode,
                        }));
                    }}
                    className="w-full bg-white text-black border border-black hover:bg-[#b076ce] hover:text-white hover:border-[#b076ce] transition-all duration-300"
                >
                    {isMagazineMode ? 'Cambiar a Artículo' : 'Cambiar a Revista'}
                </Button>

                {/* Carga de imagen (solo en modo artículo) */}
                {!isMagazineMode && (
                    <div className="border-2 border-dashed border-[#b076ce] p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <FileInput
                                type="file"
                                accept="image/*"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                helperText="Selecciona una imagen para tu post"
                                className="w-full md:w-2/3"
                            />
                            <Button
                                type="button"
                                color="purple"
                                onClick={handleUploadImage}
                                disabled={!!imageUploadProgress}
                                className="w-full md:w-auto bg-[#b076ce] hover:bg-black hover:text-[#b076ce] transition-all duration-300"
                            >
                                {imageUploadProgress ? (
                                    <div className="flex items-center gap-2">
                                        <span>Cargando...</span>
                                        <div className="w-16 h-16 relative">
                                            <CircularProgressbar
                                                value={imageUploadProgress}
                                                text={`${imageUploadProgress}%`}
                                                styles={{
                                                    path: { stroke: '#b076ce' },
                                                    text: { fill: '#b076ce' },
                                                }}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    'Cargar imagen'
                                )}
                            </Button>
                        </div>

                        {/* Vista previa de la imagen */}
                        {formData.image && (
                            <div className="relative mt-4 w-full h-72 overflow-hidden rounded-lg shadow-md">
                                <img
                                    src={formData.image}
                                    alt="Vista previa del post"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Editor de texto (solo en modo artículo) */}
                {!isMagazineMode && (
                    <div className="tiptap-wrapper mt-4">
                        <EditorToolbar editor={editor} />
                        <EditorContent
                            editor={editor}
                            className="ProseMirror mt-2 p-4 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                        />
                    </div>
                )}

                {/* Carga de PDF (solo en modo revista) */}
                {isMagazineMode && (
                    <div className="border-2 border-dashed border-[#b076ce] p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
                        <FileInput
                            type="file"
                            accept="application/pdf"
                            onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                            helperText="Selecciona un archivo PDF para la revista"
                            className="w-full"
                        />
                        <Button
                            type="button"
                            onClick={handleUploadPdf}
                            disabled={!!pdfUploadProgress}
                            className="mt-4 w-full bg-[#b076ce] hover:bg-black hover:text-[#b076ce] transition-all duration-300"
                        >
                            {pdfUploadProgress ? (
                                <div className="flex items-center gap-2">
                                    <span>Cargando...</span>
                                    <div className="w-16 h-16 relative">
                                        <CircularProgressbar
                                            value={pdfUploadProgress}
                                            text={`${pdfUploadProgress}%`}
                                            styles={{
                                                path: { stroke: '#b076ce' },
                                                text: { fill: '#b076ce' },
                                            }}
                                        />
                                    </div>
                                </div>
                            ) : (
                                'Cargar PDF'
                            )}
                        </Button>

                        {/* Vista previa del PDF */}
                        {formData.pdf && (
                            <div className="mt-4">
                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                    <span>Vista previa del PDF:</span>
                                </div>
                                <div
                                    className="border rounded-lg overflow-hidden"
                                    style={{ height: '500px' }}
                                >
                                    <embed
                                        src={formData.pdf}
                                        type="application/pdf"
                                        width="100%"
                                        height="100%"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Mensajes de error y éxito */}
                {imageUploadError && <Alert color='failure'>{imageUploadError}</Alert>}
                {pdfUploadError && <Alert color='failure'>{pdfUploadError}</Alert>}
                {publishError && <Alert color='failure'>{publishError}</Alert>}
                {successMessage && <Alert color='success'>{successMessage}</Alert>}

                {/* Botón de publicar */}
                <Button
                    type='submit'
                    className="w-full bg-[#b076ce] text-white border-[#b076ce] hover:bg-black hover:border-black hover:text-[#b076ce] transition-all duration-300"
                >
                    PUBLICAR
                </Button>
            </form>
        </div>
    );
}