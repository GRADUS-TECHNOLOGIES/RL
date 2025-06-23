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
        <main className="p-3 flex flex-col max-w-6xl mx-auto min-h-screen">
            {/* Botón Editar (solo para admin y dueño del post) */}
            {currentUser?.isAdmin && (
                <div className="flex justify-end max-w-6xl mx-auto px-3">
                    <Button
                        onClick={() => navigate(`/update-post/${post._id}`)}
                        className="mt-2 bg-purple-600 hover:bg-purple-700 transition"
                    >
                        Editar Post
                    </Button>
                </div>
            )}

            <h1 className="text-3xl mt-10 p-3 text-center font-serif max-w-6xl mx-auto lg:text-4xl">
                {post.title}
            </h1>

            <Link to={`/search?category=${post.category}`} className="self-center mt-5">
                <Button pill size="xs" className="bg-white text-[#b076ce] border-2 hover:text-white hover:bg-[#b076ce] transition-colors duration-300">
                    {post.category}
                </Button>
            </Link>

            {post.pdf ? (
                <div className="mt-10 p-3 max-w-4xl mx-auto w-full bg-gray-100 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-2 p-2 bg-white rounded-t-lg border-b">
                        <div className="flex items-center space-x-2">
                            <button onClick={() => setScale(prev => Math.max(0.5, prev - 0.1))} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition" disabled={scale <= 0.5}>-</button>
                            <span className="text-sm">Zoom: {(scale * 100).toFixed(0)}%</span>
                            <button onClick={() => setScale(prev => Math.min(2.0, prev + 0.1))} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition" disabled={scale >= 2.0}>+</button>
                        </div>
                        <span className="text-sm text-gray-600">{loadedPages} de {totalPages} páginas cargadas</span>
                    </div>

                    {loadedPages < totalPages && (
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${(loadedPages / totalPages) * 100}%` }}></div>
                        </div>
                    )}

                    <div ref={pdfContainerRef} className="pdf-container h-[800px] overflow-y-auto bg-white" style={{ boxShadow: 'inset 0 0 8px rgba(0,0,0,0.1)' }}>
                        {pdfPages.length > 0 ? (
                            <div className="flex flex-col items-center p-4">
                                {pdfPages.slice(0, visiblePages).map((page, index) => (
                                    <div key={index} className="mb-6 last:mb-0 shadow-lg" style={{ width: '100%', maxWidth: '800px' }}>
                                        <img src={page.dataUrl} alt={`Página ${index + 1}`} className="mx-auto border border-gray-200" style={{ width: `${page.width}px`, height: `${page.height}px` }} />
                                        <div className="text-center text-sm text-gray-500 mt-1 bg-gray-50 py-1">Página {index + 1} de {pdfPages.length}</div>
                                    </div>
                                ))}
                                {visiblePages < pdfPages.length && (
                                    <div className="text-center py-4 text-gray-500">Desplázate hacia abajo para cargar más páginas...</div>
                                )}
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center">
                                <Spinner size="xl" />
                                <span className="ml-2">Cargando PDF...</span>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <img src={post.image} alt={post.title} className="mt-10 p-3 max-h-[600px] w-full object-cover" />
            )}

            <div className="flex justify-between p-3 border-b border-[#b076ce] mx-auto w-full max-w-2xl text-xs">
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                {!post.pdf && <span className="italic">{(post.content?.length / 1000).toFixed(0)} mins de lectura</span>}
            </div>

            {!post.pdf && (
                <div className="p-3 max-w-2xl mx-auto w-full post-content" dangerouslySetInnerHTML={{ __html: post.content }} />
            )}

            <div className="max-w-4xl mx-auto w-full">
                <CallToAction />
            </div>

            <CommentSection postId={post._id} />

            <div className="flex flex-col justify-center items-center mb-5">
                <h1 className="text-xl mt-5">Artículos recientes</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-5 justify-center w-full">
                    {recentPosts.length > 0 ? (
                        recentPosts.map((post) => <PostCard key={post._id} post={post} />)
                    ) : (
                        <p>Sin post recientes.</p>
                    )}
                </div>
            </div>
        </main>
    );
}
