import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';

GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

// ── Hook para portada PDF ──────────────────────────────────────────────────

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

        if (!pdfUrl) { setLoading(false); return; }

        const load = async () => {
            try {
                const pdf  = await getDocument(pdfUrl).promise;
                const page = await pdf.getPage(1);
                const vp   = page.getViewport({ scale: 0.4 });

                const canvas  = document.createElement('canvas');
                canvas.width  = vp.width;
                canvas.height = vp.height;
                await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;

                if (isMounted.current) { setCover(canvas.toDataURL()); setLoading(false); }
            } catch (err) {
                if (isMounted.current) { setError(err); setLoading(false); }
                console.error(`PDF cover error (${postId}):`, err);
            }
        };

        load();
        return () => { isMounted.current = false; };
    }, [pdfUrl, postId]);

    return { cover, loading, error };
};

// ── Fondo del slide ────────────────────────────────────────────────────────

const SlideBackground = ({ post }) => {
    const { cover, loading } = usePdfCover(post?.pdf, post?._id);
    const isPdf     = !!post?.pdf;
    const imageUrl  = isPdf ? cover : post?.image;

    if (loading && isPdf) {
        return <div className="absolute inset-0 bg-gradient-to-br from-[#B076CE]/20 to-gray-950 animate-pulse" />;
    }

    if (!imageUrl) {
        return <div className="absolute inset-0 bg-gradient-to-br from-[#B076CE]/25 to-gray-950" />;
    }

    return (
        <>
            {isPdf && <div className="absolute inset-0 bg-gray-950" />}
            <img
                src={imageUrl}
                alt=""
                aria-hidden="true"
                className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${
                    isPdf ? 'object-contain opacity-20' : 'object-cover'
                }`}
            />
        </>
    );
};

// ── Componente principal ───────────────────────────────────────────────────

export default function PostCarousel({ posts = [] }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isPlaying, setIsPlaying]     = useState(true);
    const [visible, setVisible]         = useState(true);
    const intervalRef                   = useRef();

    const changeTo = useCallback((newIndex) => {
        setVisible(false);
        setTimeout(() => {
            setActiveIndex(newIndex);
            setVisible(true);
        }, 220);
    }, []);

    const nextSlide = useCallback(() => {
        changeTo((activeIndex + 1) % posts.length);
    }, [activeIndex, posts.length, changeTo]);

    const prevSlide = useCallback(() => {
        changeTo((activeIndex - 1 + posts.length) % posts.length);
    }, [activeIndex, posts.length, changeTo]);

    useEffect(() => {
        clearInterval(intervalRef.current);
        if (isPlaying && posts.length > 1) {
            intervalRef.current = setInterval(nextSlide, 8000);
        }
        return () => clearInterval(intervalRef.current);
    }, [isPlaying, nextSlide, posts.length]);

    if (!posts || posts.length === 0) return null;

    const current = posts[activeIndex];

    return (
        <div
            className="relative w-full h-[380px] sm:h-[440px] md:h-[500px] overflow-hidden rounded-sm"
            onMouseEnter={() => setIsPlaying(false)}
            onMouseLeave={() => setIsPlaying(true)}
        >
            {/* ── Fondo ── */}
            <SlideBackground post={current} />

            {/* ── Gradiente overlay ── */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/96 via-black/30 to-black/10 pointer-events-none" />

            {/* ── Progress bar ── */}
            {posts.length > 1 && (
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/10 z-20">
                    <div
                        key={`pb-${activeIndex}`}
                        className="h-full bg-[#B076CE] carousel-progress"
                        style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}
                    />
                </div>
            )}

            {/* ── Contenido overlay ── */}
            <div
                className={`absolute inset-0 z-10 flex flex-col justify-end px-6 pb-7 md:px-10 md:pb-10 transition-opacity duration-[220ms] ${
                    visible ? 'opacity-100' : 'opacity-0'
                }`}
            >
                {/* Categoría + contador */}
                <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.3em] bg-[#B076CE] px-2.5 py-1 leading-none">
                        {current.category === 'uncategorized'
                            ? 'General'
                            : (current.category || 'Artículo')}
                    </span>
                    {posts.length > 1 && (
                        <span className="text-[11px] font-bold text-white/35 tracking-widest select-none tabular-nums">
                            {String(activeIndex + 1).padStart(2, '0')}
                            &thinsp;/&thinsp;
                            {String(posts.length).padStart(2, '0')}
                        </span>
                    )}
                </div>

                {/* Título */}
                <Link to={`/post/${current.slug}`} className="group">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.6rem] font-black text-white leading-tight mb-5 group-hover:text-[#B076CE] transition-colors duration-300 line-clamp-3 max-w-3xl">
                        {current.title}
                    </h2>
                </Link>

                {/* Autor + CTA */}
                <div className="flex items-center justify-between gap-4">
                    <p className="text-white/35 text-xs font-light truncate">
                        Por:&nbsp;{current.author || 'Revista Legislatura'}
                    </p>
                    <Link
                        to={`/post/${current.slug}`}
                        className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 bg-white text-gray-900 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#B076CE] hover:text-white transition-all duration-300"
                    >
                        {current.pdf ? 'Ver revista' : 'Leer más'}
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </div>
            </div>

            {/* ── Flechas de navegación ── */}
            {posts.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        aria-label="Artículo anterior"
                        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 flex items-center justify-center border border-white/15 text-white/60 hover:bg-[#B076CE] hover:border-[#B076CE] hover:text-white transition-all duration-200"
                    >
                        <FaChevronLeft size={11} />
                    </button>
                    <button
                        onClick={nextSlide}
                        aria-label="Artículo siguiente"
                        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 flex items-center justify-center border border-white/15 text-white/60 hover:bg-[#B076CE] hover:border-[#B076CE] hover:text-white transition-all duration-200"
                    >
                        <FaChevronRight size={11} />
                    </button>
                </>
            )}

            {/* ── Indicadores de línea ── */}
            {posts.length > 1 && (
                <div className="absolute bottom-7 md:bottom-10 right-6 md:right-10 z-20 flex items-center gap-1.5">
                    {posts.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => changeTo(idx)}
                            aria-label={`Ir al artículo ${idx + 1}`}
                            className={`h-[2px] transition-all duration-300 ${
                                idx === activeIndex
                                    ? 'w-8 bg-[#B076CE]'
                                    : 'w-3 bg-white/25 hover:bg-white/50'
                            }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
