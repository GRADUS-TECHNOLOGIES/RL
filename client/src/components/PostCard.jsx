import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';

// Configura el worker de pdfjs
GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

export default function PostCard({ post }) {
    const [pdfCover, setPdfCover] = useState(null);

    // Cargar la primera página del PDF como imagen
    useEffect(() => {
        if (post?.pdf) {
            const loadPdfCover = async () => {
                try {
                    const pdf = await getDocument(post.pdf).promise;
                    const page = await pdf.getPage(1);
                    const viewport = page.getViewport({ scale: 0.5 });

                    // Crear un canvas para renderizar la página
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;

                    await page.render({
                        canvasContext: context,
                        viewport: viewport,
                    }).promise;

                    // Convertir el canvas a una URL de imagen
                    setPdfCover(canvas.toDataURL());
                } catch (error) {
                    console.error('Error al cargar la portada del PDF:', error);
                    setPdfCover(null);
                }
            };

            loadPdfCover();
        }
    }, [post?.pdf]);

    return (
        <div className="group relative border border-black hover:border-2 h-[400px] overflow-hidden rounded-lg transition-all mx-auto w-full max-w-xs md:max-w-sm lg:max-w-md bg-white shadow-md hover:shadow-xl">
            {/* Imagen del post o portada de la revista */}
            <Link to={`/post/${post.slug}`}>
                <div className="h-[260px] w-full object-cover group-hover:h-[230px] transition-all duration-300">
                    {post.pdf ? (
                        // Portada para revistas (PDF)
                        pdfCover ? (
                            <img
                                src={pdfCover}
                                alt={`Portada de ${post.title}`}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full bg-gray-100 text-gray-500">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-20 w-20"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                    />
                                </svg>
                                <span className="text-sm font-semibold">Cargando revista...</span>
                            </div>
                        )
                    ) : (
                        // Imagen para artículos
                        <img
                            src={post.image}
                            alt={post.title || 'Post cover'}
                            className="h-full w-full object-cover"
                        />
                    )}
                </div>
            </Link>

            {/* Contenido de la tarjeta */}
            <div className="p-4 flex flex-col gap-2">
                {/* Título */}
                <p className="line-clamp-1 text-lg font-bold">{post.title}</p>
                {/* Categoría */}
                <span className="italic text-sm text-[#545454]">{post.category}</span>

                {/* Botón "Leer artículo" - aparece al hacer hover */}
                <Link
                    to={`/post/${post.slug}`}
                    className="absolute z-10 bottom-[-100px] left-0 right-0 m-2 border border-black bg-white text-black hover:bg-[#b076ce] hover:border-[#b076ce] hover:text-white text-center py-2 rounded-md rounded-tl-none transition-all duration-300 group-hover:bottom-2"
                >
                    {post.pdf ? 'Ver revista' : 'Leer artículo'}
                </Link>
            </div>
        </div>
    );
}