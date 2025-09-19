import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';

// Configura el worker de pdfjs
GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

export default function PostCard({ post }) {
    const [pdfCover, setPdfCover] = useState(null);

    // Cargar la primera página del PDF como portada
    useEffect(() => {
        if (post?.pdf) {
            const loadPdfCover = async () => {
                try {
                    const pdf = await getDocument(post.pdf).promise;
                    const page = await pdf.getPage(1);
                    const viewport = page.getViewport({ scale: 0.5 });

                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;

                    await page.render({ canvasContext: context, viewport }).promise;
                    setPdfCover(canvas.toDataURL());
                } catch (error) {
                    console.error('Error al cargar la portada del PDF:', error);
                    setPdfCover(null);
                }
            };

            loadPdfCover();
        }
    }, [post?.pdf]);

    const imageUrl = post?.pdf ? pdfCover : post?.image;

    return (
        <div className="group relative flex flex-col border border-gray-200 hover:border-[#b076ce] rounded-sm overflow-hidden shadow hover:shadow-lg transition-all duration-300 bg-white w-full max-w-xs md:max-w-sm lg:max-w-md mx-auto">
            {/* Imagen */}
            <Link to={`/post/${post.slug}`} aria-label={`Ir al post ${post.title}`}>
                <div className="h-[240px] w-full overflow-hidden relative">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={post.title || 'Portada del post'}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full bg-gray-100 text-gray-500">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-16 w-16"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                />
                            </svg>
                            <span className="text-sm font-semibold">Cargando portada...</span>
                        </div>
                    )}

                    {/* Badge revista */}
                    {post?.pdf && (
                        <span className="absolute top-3 left-3 bg-[#b076ce] text-white text-xs font-bold px-2 py-1 rounded-md shadow">
                            REVISTA
                        </span>
                    )}
                </div>
            </Link>

            {/* Contenido */}
            <div className="p-4 flex flex-col flex-grow relative">
                {/* Categoría */}
                {post?.category && (
                    <span className="italic text-sm text-gray-500 mb-1">
                        {post.category}
                    </span>
                )}

                {/* Título */}
                <h3 className="font-semibold text-lg text-gray-800 line-clamp-2 mb-10">
                    {post.title}
                </h3>

                {/* Botón leer → aparece solo al hover */}
                <Link
                    to={`/post/${post.slug}`}
                    className="absolute bottom-[-60px] left-4 right-4 text-center px-4 py-2 text-sm font-medium border-2 border-black rounded-md bg-white text-black hover:bg-[#b076ce] hover:border-[#b076ce] hover:text-white transition-all duration-300 group-hover:bottom-4"
                    aria-label={post?.pdf ? 'Ver revista' : 'Leer artículo'}
                >
                    {post?.pdf ? 'Ver revista' : 'Leer artículo'}
                </Link>
            </div>
        </div>
    );
}
