import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';

// Configura el worker de pdfjs
GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

// ✅ Hook para portada PDF
const usePdfCover = (pdfUrl, postId) => {
    const [cover, setCover] = useState(null);
    const [loading, setLoading] = useState(!!pdfUrl);
    const [error, setError] = useState(null);
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        setCover(null);
        setLoading(!!pdfUrl);
        setError(null);

        if (!pdfUrl) {
            setLoading(false);
            return;
        }

        const loadCover = async () => {
            try {
                const pdf = await getDocument(pdfUrl).promise;
                const page = await pdf.getPage(1);
                const viewport = page.getViewport({ scale: 0.3 });

                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = viewport.width;
                canvas.height = viewport.height;

                await page.render({
                    canvasContext: context,
                    viewport,
                }).promise;

                if (isMounted.current) {
                    setCover(canvas.toDataURL());
                    setLoading(false);
                }
            } catch (err) {
                if (isMounted.current) {
                    console.error(`Error loading PDF cover for post ${postId}:`, err);
                    setError(err);
                    setLoading(false);
                }
            }
        };

        loadCover();

        return () => {
            isMounted.current = false;
        };
    }, [pdfUrl, postId]);

    return { cover, loading, error };
};

// ✅ Componente de imagen
const PostImage = ({ post, onClick }) => {
    const { cover, loading, error } = usePdfCover(post.pdf, post._id);
    const imageUrl = post.pdf ? cover : post.image;

    if (loading) {
        return (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (error || (post.pdf && !cover)) {
        return (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-500 text-sm">
                No se pudo cargar
            </div>
        );
    }

    return (
        <img
            src={imageUrl}
            alt={post.title}
            className="w-full h-full object-cover cursor-pointer"
            onClick={onClick}
            loading="lazy"
        />
    );
};

// ✅ Carrusel con estilo "card"
export default function PostCarousel({ posts = [] }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const navigate = useNavigate();
    const intervalRef = useRef();

    const nextSlide = useCallback(() => {
        setActiveIndex((prev) => (prev + 1) % posts.length);
    }, [posts.length]);

    const prevSlide = useCallback(() => {
        setActiveIndex((prev) => (prev - 1 + posts.length) % posts.length);
    }, [posts.length]);

    const goToSlide = useCallback((index) => {
        setActiveIndex(index);
    }, []);

    // Auto-play
    useEffect(() => {
        if (isPlaying && posts.length > 1) {
            intervalRef.current = setInterval(nextSlide, 8000);
        } else {
            clearInterval(intervalRef.current);
        }
        return () => clearInterval(intervalRef.current);
    }, [isPlaying, activeIndex, posts.length, nextSlide]);

    if (!posts || posts.length === 0) return null;

    const currentPost = posts[activeIndex];

    return (
        <div
            className="relative w-full overflow-hidden"
            onMouseEnter={() => setIsPlaying(false)}
            onMouseLeave={() => setIsPlaying(true)}
        >
            <div className="flex flex-col md:flex-row h-auto md:h-[550px] bg-white rounded-lg shadow-lg overflow-hidden">
                
                {/* Imagen */}
                <div className="md:w-1/2 h-64 md:h-full">
                    <PostImage
                        post={currentPost}
                        onClick={() => navigate(`/post/${currentPost.slug}`)}
                    />
                </div>

                {/* Texto */}
                <div className="flex flex-col justify-between p-6 md:w-1/2">
                    <div>
                        <span className="text-lg uppercase text-[#a6a6a6] font-semibold tracking-wide">
                            {currentPost.category || "Política"}
                        </span>
                        <h2
                            className="mt-2 font-bold text-xl md:text-2xl lg:text-6xl text-black leading-tight cursor-pointer"
                            onClick={() => navigate(`/post/${currentPost.slug}`)}
                        >
                            {currentPost.title}
                        </h2>
                        <p className="text-sm text-[#545454] mt-6">
                            Por: {currentPost.author || "Revista Legislatura"}
                        </p>
                    </div>
                    <button
                        onClick={() => navigate(`/post/${currentPost.slug}`)}
                        className="self-start mt-4 px-4 py-2 border-2 bg-white text-black text-sm font-semibold rounded hover:bg-[#b076ce] hover:text-white hover:text-xl transition-all cursor-pointer"
                    >
                        LEER MÁS
                    </button>
                </div>
            </div>

            {/* Botones de navegación */}
            {posts.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60"
                    >
                        <FaChevronLeft size={20} />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60"
                    >
                        <FaChevronRight size={20} />
                    </button>
                </>
            )}

            {/* Indicadores */}
            {posts.length > 1 && (
                <div className="flex justify-center mt-4 space-x-2">
                    {posts.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => goToSlide(idx)}
                            className={`w-3 h-3 rounded-full ${idx === activeIndex ? "bg-[#b076ce]" : "bg-gray-300"}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}