import { useEffect, useState, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import CallToAction from '../components/CallToAction';
import InstitutionalBanner from '../components/InstitutionalBanner';
import CommentSection from '../components/CommentSection';
import PostCard from '../components/PostCard';
import { sanitizeHtml } from '../utils/sanitize';

import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

// ── Primitivos ─────────────────────────────────────────────────────────────

const SectionLabel = ({ label }) => (
    <div className="flex items-center gap-3 mb-4">
        <div className="w-[2px] h-4 bg-[#B076CE] flex-shrink-0" />
        <span className="text-[10px] font-black text-[#B076CE] uppercase tracking-[0.3em]">{label}</span>
        <div className="flex-1 h-px bg-gray-100" />
    </div>
);

const Spinner = () => (
    <svg className="animate-spin w-6 h-6 text-[#B076CE]" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
);

// ── PostPage ───────────────────────────────────────────────────────────────

export default function PostPage() {
    const { postSlug } = useParams();
    const { currentUser } = useSelector((state) => state.user);
    const navigate = useNavigate();

    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState(false);
    const [post, setPost]             = useState(null);
    const [recentPosts, setRecentPosts] = useState([]);

    // PDF state
    const [pdfPages, setPdfPages]       = useState([]);
    const [scale, setScale]             = useState(1.0);
    const [loadedPages, setLoadedPages] = useState(0);
    const [totalPages, setTotalPages]   = useState(0);
    const [visiblePages, setVisiblePages] = useState(5);
    const pdfContainerRef = useRef(null);

    // ── Fetch post
    useEffect(() => {
        const fetchPost = async () => {
            try {
                setLoading(true);
                const res  = await fetch(`/api/post/getposts?slug=${postSlug}`);
                const data = await res.json();
                if (!res.ok || !data.posts?.length) { setError(true); return; }
                setPost(data.posts[0]);
                setError(false);
            } catch {
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [postSlug]);

    // ── Fetch recent posts
    useEffect(() => {
        const fetchRecent = async () => {
            try {
                const res  = await fetch('/api/post/getposts?limit=3');
                const data = await res.json();
                setRecentPosts(res.ok ? (data.posts ?? []) : []);
            } catch {
                setRecentPosts([]);
            }
        };
        fetchRecent();
    }, []);

    // ── Render PDF
    const renderPDF = async () => {
        if (!post?.pdf) return;
        try {
            setLoadedPages(0);
            setPdfPages([]);
            const pdf = await getDocument(post.pdf).promise;
            setTotalPages(pdf.numPages);
            const pages = [];
            for (let i = 1; i <= pdf.numPages; i++) {
                const page     = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: scale * 1.5 });
                const canvas   = document.createElement('canvas');
                const ctx      = canvas.getContext('2d', { willReadFrequently: true });
                canvas.width   = viewport.width;
                canvas.height  = viewport.height;
                await page.render({ canvasContext: ctx, viewport }).promise;
                pages.push({ dataUrl: canvas.toDataURL(), height: viewport.height });
                setLoadedPages((prev) => prev + 1);
            }
            setPdfPages(pages);
        } catch (err) {
            console.error('Error rendering PDF:', err);
        }
    };

    useEffect(() => {
        if (post?.pdf) renderPDF();
    }, [post, scale]);

    // ── Lazy-load pages on scroll
    useEffect(() => {
        if (pdfPages.length <= visiblePages || !pdfContainerRef.current) return;
        const el = pdfContainerRef.current;
        const onScroll = () => {
            if (el.scrollTop + el.clientHeight >= el.scrollHeight - 100)
                setVisiblePages((p) => Math.min(pdfPages.length, p + 3));
        };
        el.addEventListener('scroll', onScroll);
        return () => el.removeEventListener('scroll', onScroll);
    }, [pdfPages.length, visiblePages]);

    useEffect(() => { setVisiblePages(5); }, [scale]);

    // ── Download PDF
    const downloadPDF = async () => {
        try {
            const blob = await (await fetch(post.pdf)).blob();
            const url  = URL.createObjectURL(blob);
            const a    = document.createElement('a');
            a.href     = url;
            a.download = `${post.title.replace(/\s+/g, '-')}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Error descargando PDF:', err);
        }
    };

    // ── Loading / error states
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-3 bg-white">
                <Spinner />
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Cargando</p>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-3 bg-white">
                <div className="w-[2px] h-8 bg-gray-100" />
                <p className="text-sm text-gray-400 font-light">Publicación no encontrada</p>
                <Link
                    to="/"
                    className="text-[10px] font-black text-[#B076CE] uppercase tracking-[0.3em] hover:underline mt-2"
                >
                    Volver al inicio
                </Link>
            </div>
        );
    }

    const isPdf       = Boolean(post.pdf);
    const readingMins = !isPdf && post.content
        ? Math.max(1, Math.round(post.content.length / 1000))
        : null;

    return (
        <main className="min-h-screen bg-white">
            <div className="max-w-4xl mx-auto px-4 md:px-8 py-10">

                {/* ── Admin: botón editar ── */}
                {currentUser?.isAdmin && (
                    <div className="flex justify-end mb-8">
                        <button
                            onClick={() => navigate(`/update-post/${post._id}`)}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] hover:border-[#B076CE] hover:text-[#B076CE] transition-all duration-200"
                        >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Editar publicación
                        </button>
                    </div>
                )}

                {/* ── Encabezado editorial ── */}
                <div className="mb-8 pb-8 border-b border-gray-100">
                    <SectionLabel
                        label={
                            post.category && post.category !== 'uncategorized'
                                ? post.category
                                : isPdf ? 'Revista' : 'Artículo'
                        }
                    />

                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-5">
                        {post.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-4 text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">
                        <span>
                            {new Date(post.createdAt).toLocaleDateString('es-MX', {
                                year: 'numeric', month: 'long', day: 'numeric',
                            })}
                        </span>
                        {readingMins && (
                            <>
                                <span className="w-px h-3 bg-gray-200 inline-block" />
                                <span>{readingMins} min de lectura</span>
                            </>
                        )}
                        {isPdf && totalPages > 0 && (
                            <>
                                <span className="w-px h-3 bg-gray-200 inline-block" />
                                <span>{totalPages} páginas</span>
                            </>
                        )}
                    </div>
                </div>

                {/* ── Imagen hero (artículos) ── */}
                {!isPdf && post.image && (
                    <div className="mb-10 overflow-hidden">
                        <img
                            src={post.image}
                            alt={post.title}
                            className="w-full max-h-[500px] object-cover"
                        />
                    </div>
                )}

                {/* ── Visor PDF ── */}
                {isPdf && (
                    <div className="mb-12 border border-gray-100">

                        {/* Barra superior */}
                        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50/50">
                            <div className="flex items-center gap-3">
                                <div className="w-[2px] h-4 bg-[#B076CE]" />
                                <div>
                                    <p className="text-[10px] font-black text-[#B076CE] uppercase tracking-[0.3em]">
                                        Revista
                                    </p>
                                    {totalPages > 0 && (
                                        <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">
                                            {totalPages} páginas
                                        </p>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={downloadPDF}
                                className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] hover:border-[#B076CE] hover:text-[#B076CE] transition-all duration-200"
                            >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Descargar
                            </button>
                        </div>

                        {/* Controles de zoom */}
                        <div className="flex items-center justify-between px-5 py-2.5 border-b border-gray-100 bg-gray-50/30">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setScale((p) => Math.max(0.5, parseFloat((p - 0.1).toFixed(1))))}
                                    disabled={scale <= 0.5}
                                    className="w-7 h-7 flex items-center justify-center border border-gray-200 text-sm font-black text-gray-600 hover:border-[#B076CE] hover:text-[#B076CE] disabled:opacity-30 transition-all"
                                >
                                    −
                                </button>
                                <span className="text-[10px] font-black text-gray-700 uppercase tracking-[0.2em] min-w-[42px] text-center">
                                    {(scale * 100).toFixed(0)}%
                                </span>
                                <button
                                    onClick={() => setScale((p) => Math.min(2.0, parseFloat((p + 0.1).toFixed(1))))}
                                    disabled={scale >= 2.0}
                                    className="w-7 h-7 flex items-center justify-center border border-gray-200 text-sm font-black text-gray-600 hover:border-[#B076CE] hover:text-[#B076CE] disabled:opacity-30 transition-all"
                                >
                                    +
                                </button>
                            </div>
                            {loadedPages < totalPages && totalPages > 0 && (
                                <span className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">
                                    {loadedPages} / {totalPages} páginas
                                </span>
                            )}
                        </div>

                        {/* Barra de progreso */}
                        {loadedPages < totalPages && totalPages > 0 && (
                            <div className="h-[2px] bg-gray-100">
                                <div
                                    className="h-[2px] bg-[#B076CE] transition-all duration-300"
                                    style={{ width: `${(loadedPages / totalPages) * 100}%` }}
                                />
                            </div>
                        )}

                        {/* Páginas PDF */}
                        <div ref={pdfContainerRef} className="h-[850px] overflow-y-auto bg-gray-50">
                            {pdfPages.length > 0 ? (
                                <div className="flex flex-col items-center py-6 px-4 gap-4">
                                    {pdfPages.slice(0, visiblePages).map((page, i) => (
                                        <div key={i} className="w-full max-w-[820px] border border-gray-200">
                                            <img
                                                src={page.dataUrl}
                                                alt={`Página ${i + 1}`}
                                                className="w-full"
                                                style={{ maxHeight: `${page.height}px` }}
                                            />
                                            <div className="border-t border-gray-100 py-2 text-center text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">
                                                {i + 1} / {pdfPages.length}
                                            </div>
                                        </div>
                                    ))}
                                    {visiblePages < pdfPages.length && (
                                        <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em] py-4">
                                            Desplázate para ver más páginas
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center gap-3">
                                    <Spinner />
                                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">
                                        Cargando revista
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Contenido del artículo ── */}
                {!isPdf && (
                    <article
                        className="prose prose-lg max-w-none mb-12 post-content"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
                    />
                )}

                {/* ── Call to Action ── */}
                <div className="mb-12">
                    <CallToAction />
                </div>

                {/* ── Comentarios ── */}
                <div className="mb-12">
                    <CommentSection postId={post._id} />
                </div>

                {/* ── Banner institucional ── */}
                <div className="mb-12">
                    <InstitutionalBanner />
                </div>

                {/* ── Posts recientes ── */}
                <div className="pt-10 border-t border-gray-100">
                    <SectionLabel label="Más contenido" />
                    <h2 className="text-2xl font-black text-gray-900 mb-6">Artículos recientes</h2>
                    {recentPosts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {recentPosts.map((p) => (
                                <PostCard key={p._id} post={p} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-[2px] h-8 bg-gray-100 mb-4" />
                            <p className="text-sm text-gray-300 font-light">Sin publicaciones recientes</p>
                        </div>
                    )}
                </div>

            </div>
        </main>
    );
}
