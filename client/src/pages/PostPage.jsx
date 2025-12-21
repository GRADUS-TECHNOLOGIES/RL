import { useEffect, useState, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button, Spinner } from 'flowbite-react';
import { useSelector } from 'react-redux';

import CallToAction from '../components/CallToAction';
import CommentSection from '../components/CommentSection';
import PostCard from '../components/PostCard';

import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

export default function PostPage() {
    const { postSlug } = useParams();
    const { currentUser } = useSelector((state) => state.user);
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [post, setPost] = useState(null);
    const [recentPosts, setRecentPosts] = useState([]);
    const [pdfPages, setPdfPages] = useState([]);
    const [scale, setScale] = useState(1.0);
    const [loadedPages, setLoadedPages] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [visiblePages, setVisiblePages] = useState(5);
    const pdfContainerRef = useRef(null);

    const downloadPDF = async () => {
        try {
            const response = await fetch(post.pdf);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${post.title.replace(/\s+/g, '-')}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error descargando PDF:', error);
        }
    };

    useEffect(() => {
        const fetchPost = async () => {
            try {
                setLoading(true);
                const res = await fetch(`/api/post/getposts?slug=${postSlug}`);
                const data = await res.json();

                if (!res.ok || !data.posts || data.posts.length === 0) {
                    setError(true);
                    return;
                }

                setPost(data.posts[0]);
                setError(false);
            } catch (err) {
                console.error('Error fetching post:', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [postSlug]);

    useEffect(() => {
        const fetchRecentPosts = async () => {
            try {
                const res = await fetch('/api/post/getposts?limit=3');
                const data = await res.json();
                if (res.ok && Array.isArray(data.posts)) {
                    setRecentPosts(data.posts);
                } else {
                    setRecentPosts([]);
                }
            } catch (err) {
                console.error('Error fetching recent posts:', err.message);
                setRecentPosts([]);
            }
        };

        fetchRecentPosts();
    }, []);

    const renderPDF = async () => {
        if (!post?.pdf) return;
        try {
            setLoadedPages(0);
            const pdf = await getDocument(post.pdf).promise;
            setTotalPages(pdf.numPages);
            const pages = [];

            for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
                const page = await pdf.getPage(pageNumber);
                const viewport = page.getViewport({ scale: scale * 1.5 });

                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = viewport.width;
                canvas.height = viewport.height;

                await page.render({ canvasContext: context, viewport }).promise;

                pages.push({
                    dataUrl: canvas.toDataURL(),
                    width: viewport.width,
                    height: viewport.height,
                });
                setLoadedPages((prev) => prev + 1);
            }

            setPdfPages(pages);
        } catch (error) {
            console.error('Error rendering PDF:', error);
        }
    };

    useEffect(() => {
        if (post?.pdf) {
            renderPDF();
        }
    }, [post, scale]);

    useEffect(() => {
        if (pdfPages.length <= visiblePages || !pdfContainerRef.current) return;

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = pdfContainerRef.current;
            if (scrollTop + clientHeight >= scrollHeight - 100) {
                setVisiblePages((prev) => Math.min(pdfPages.length, prev + 3));
            }
        };

        const container = pdfContainerRef.current;
        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [pdfPages.length, visiblePages]);

    useEffect(() => {
        setVisiblePages(5);
    }, [scale]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Spinner size="xl" />
            </div>
        );
    }

    if (error || !post) {
        return <p className="text-center mt-10">Post no encontrado</p>;
    }

    return (
        <main className="min-h-screen bg-white dark:bg-gray-900 py-8">
            <div className="max-w-4xl mx-auto px-4 md:px-8">
                {/* Botón Editar (solo para admin) */}
                {currentUser?.isAdmin && (
                    <div className="flex justify-end mb-6">
                        <Button
                            onClick={() => navigate(`/update-post/${post._id}`)}
                            className="bg-[#B076CE] hover:bg-black text-white font-semibold px-6 py-2 rounded-lg transition-all"
                        >
                            ✏️ Editar Post
                        </Button>
                    </div>
                )}

                {/* Título */}
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 text-center leading-tight">
                    {post.title}
                </h1>

                {/* Categoría y metadata */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-4 mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
                    <Link to={`/search?category=${post.category}`}>
                        <span className="inline-block px-4 py-2 bg-[#B076CE] text-white text-sm font-semibold rounded-full hover:bg-black transition-all cursor-pointer">
                            {post.category === 'uncategorized' ? 'Sin categoría' : post.category}
                        </span>
                    </Link>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                        {new Date(post.createdAt).toLocaleDateString('es-ES', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </span>
                    {!post.pdf && (
                        <span className="text-gray-500 dark:text-gray-400 text-sm italic">
                            {(post.content?.length / 1000).toFixed(0)} mins de lectura
                        </span>
                    )}
                </div>

                {/* Imagen o PDF */}
                {post.pdf ? (
                    <div className="mb-12 bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                        {/* Encabezado del visor PDF */}
                        <div className="bg-[#B076CE] px-6 py-4 border-b border-purple-800 dark:border-purple-900">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">📚</span>
                                    <div>
                                        <h3 className="text-white font-bold text-lg">Revista</h3>
                                        <p className="text-purple-100 text-sm">{totalPages} página{totalPages !== 1 ? 's' : ''}</p>
                                    </div>
                                </div>
                                <Button
                                    onClick={downloadPDF}
                                    className="bg-white hover:bg-purple-50 text-[#B076CE] font-semibold px-4 py-2 rounded-lg transition-all shadow-lg"
                                >
                                    ⬇️ Descargar
                                </Button>
                            </div>
                        </div>

                        {/* Controles de zoom y progreso */}
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={() => setScale(prev => Math.max(0.5, prev - 0.1))} 
                                    className="px-3 py-2 bg-white dark:bg-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-500 transition text-sm font-semibold text-gray-700 dark:text-gray-300"
                                    disabled={scale <= 0.5}
                                    title="Reducir zoom"
                                >
                                    🔍−
                                </button>
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 px-3 py-2 bg-white dark:bg-gray-600 rounded-lg min-w-24 text-center">
                                    {(scale * 100).toFixed(0)}%
                                </span>
                                <button 
                                    onClick={() => setScale(prev => Math.min(2.0, prev + 0.1))} 
                                    className="px-3 py-2 bg-white dark:bg-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-500 transition text-sm font-semibold text-gray-700 dark:text-gray-300"
                                    disabled={scale >= 2.0}
                                    title="Aumentar zoom"
                                >
                                    🔍+
                                </button>
                            </div>

                            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                <span className="bg-white dark:bg-gray-600 px-3 py-2 rounded-lg">
                                    {loadedPages} de {totalPages} páginas cargadas
                                </span>
                            </div>
                        </div>

                        {/* Barra de progreso */}
                        {loadedPages < totalPages && (
                            <div className="w-full bg-gray-200 dark:bg-gray-600 h-1.5">
                                <div 
                                    className="bg-gradient-to-r from-[#B076CE] via-purple-600 to-purple-700 h-1.5 transition-all duration-300" 
                                    style={{ width: `${(loadedPages / totalPages) * 100}%` }}
                                />
                            </div>
                        )}

                        {/* Contenedor del PDF */}
                        <div 
                            ref={pdfContainerRef} 
                            className="pdf-container h-[850px] overflow-y-auto bg-gray-100 dark:bg-gray-900"
                        >
                            {pdfPages.length > 0 ? (
                                <div className="flex flex-col items-center p-6 sm:p-8">
                                    {pdfPages.slice(0, visiblePages).map((page, index) => (
                                        <div 
                                            key={index} 
                                            className="mb-8 last:mb-0 bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 hover:shadow-2xl transition-shadow duration-300"
                                            style={{ width: '100%', maxWidth: '820px' }}
                                        >
                                            <img 
                                                src={page.dataUrl} 
                                                alt={`Página ${index + 1}`} 
                                                className="w-full" 
                                                style={{ maxHeight: `${page.height}px` }}
                                            />
                                            <div className="text-center text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 py-3 font-semibold border-t border-gray-200 dark:border-gray-600">
                                                📄 Página {index + 1} de {pdfPages.length}
                                            </div>
                                        </div>
                                    ))}
                                    {visiblePages < pdfPages.length && (
                                        <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm font-medium animate-pulse">
                                            👇 Desplázate hacia abajo para cargar más páginas...
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center gap-4">
                                    <Spinner size="lg" className="text-[#B076CE]" />
                                    <span className="text-gray-600 dark:text-gray-400 font-medium">Cargando revista...</span>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="mb-12 rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
                        <img 
                            src={post.image} 
                            alt={post.title} 
                            className="w-full h-auto object-cover max-h-[500px]"
                        />
                    </div>
                )}

                {/* Contenido del post */}
                {!post.pdf && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 md:p-12 border border-gray-200 dark:border-gray-700 mb-12">
                        <article
                            className="prose prose-lg dark:prose-invert max-w-none post-content"
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />
                    </div>
                )}

                {/* Call to Action */}
                <div className="max-w-4xl mx-auto mb-12">
                    <CallToAction />
                </div>

                {/* Comentarios */}
                <div className="mb-12">
                    <CommentSection postId={post._id} />
                </div>

                {/* Posts recientes */}
                <div className="mt-16 pt-12 border-t border-gray-200 dark:border-gray-700">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                        Artículos recientes
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recentPosts.length > 0 ? (
                            recentPosts.map((recentPost) => (
                                <PostCard key={recentPost._id} post={recentPost} />
                            ))
                        ) : (
                            <p className="text-center text-gray-500 dark:text-gray-400 col-span-full py-8">
                                Sin posts recientes
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
