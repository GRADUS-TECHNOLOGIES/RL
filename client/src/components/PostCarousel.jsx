import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';

// Configura el worker de pdfjs
GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

export default function PostCarousel({ posts }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [pdfCovers, setPdfCovers] = useState({});
    const navigate = useNavigate();

    const nextSlide = () => {
        setActiveIndex((prev) => (prev + 1) % posts.length);
    };

    const prevSlide = () => {
        setActiveIndex((prev) => (prev - 1 + posts.length) % posts.length);
    };

    // Cargar portadas de PDFs
    useEffect(() => {
        const loadPdfCovers = async () => {
            const covers = {};
            for (const post of posts.filter(p => p.pdf)) {
                try {
                    const pdf = await getDocument(post.pdf).promise;
                    const page = await pdf.getPage(1);
                    const viewport = page.getViewport({ scale: 0.3 });

                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;

                    await page.render({
                        canvasContext: context,
                        viewport: viewport,
                    }).promise;

                    covers[post._id] = canvas.toDataURL();
                } catch (error) {
                    console.error(`Error loading PDF cover for post ${post._id}:`, error);
                    covers[post._id] = null;
                }
            }
            setPdfCovers(covers);
        };

        loadPdfCovers();
    }, [posts]);

    // Auto-play con control de hover
    useEffect(() => {
        let interval;
        if (isPlaying && posts.length > 0) {
            interval = setInterval(nextSlide, 4000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, activeIndex, posts.length]);

    if (!posts || posts.length === 0) return null;

    const currentPost = posts[activeIndex];
    const imageUrl = currentPost.pdf ? pdfCovers[currentPost._id] || currentPost.image : currentPost.image;

    return (
        <div
            className="relative w-full overflow-hidden"
            onMouseEnter={() => setIsPlaying(false)}
            onMouseLeave={() => setIsPlaying(true)}
        >
            {/* Contenedor de imagen */}
            <div className="relative h-80 md:h-160 rounded-none md:rounded-none overflow-hidden group">
                {currentPost.pdf && !pdfCovers[currentPost._id] ? (
                    <div className="w-full h-full bg-gray-200 flex flex-col items-center justify-center">
                        <div className="text-gray-500 text-center p-4">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-16 w-16 mx-auto mb-2"
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
                            <p className="text-sm font-medium">Cargando revista...</p>
                        </div>
                    </div>
                ) : (
                    <img
                        src={imageUrl}
                        alt={currentPost.title}
                        className="w-335 h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-98 cursor-pointer"
                        onClick={() => navigate(`/post/${currentPost.slug}`)}
                    />
                )}

                {/* Overlay de texto con color personalizado */}
                <div
                    className="absolute right-0 top-0 bottom-0 flex flex-col justify-center px-4 py-3 sm:px-6 sm:py-4 max-w-xs sm:max-w-md md:max-w-lg"
                    style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        width: '40%',
                    }}
                >
                    <h2 className="font-semibold text-base sm:text-3xl text-white text-left line-clamp-3">
                        {currentPost.title}
                    </h2>
                    <p className="italic text-xs sm:text-sm text-white text-center">
                        {currentPost.subtitle}
                    </p>
                    {currentPost.pdf && (
                        <span className="text-xs text-purple-300 mt-2">REVISTA</span>
                    )}
                </div>

                {/* Botones de navegación */}
                <button
                    onClick={prevSlide}
                    aria-label="Previous post"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full transition-colors"
                >
                    <FaChevronLeft size={20} />
                </button>
                <button
                    onClick={nextSlide}
                    aria-label="Next post"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full transition-colors"
                >
                    <FaChevronRight size={20} />
                </button>
            </div>

            {/* Indicadores de posición */}
            <div className="flex justify-center mt-4 space-x-2">
                {posts.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setActiveIndex(idx)}
                        aria-label={`Go to slide ${idx + 1}`}
                        className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 transition-all`}
                        style={{
                            backgroundColor: idx === activeIndex ? '#b076ce' : 'white',
                            borderColor: idx === activeIndex ? '#b076ce' : '#000',
                        }}
                    />
                ))}
            </div>
        </div>
    );
}