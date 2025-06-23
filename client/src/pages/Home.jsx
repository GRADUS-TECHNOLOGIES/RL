import { Link } from 'react-router-dom';
import CallToAction from '../components/CallToAction';
import PostCarousel from '../components/PostCarousel';
import { useEffect, useState } from 'react';
import PostCard from '../components/PostCard';

export default function Home() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        document.title = 'Inicio - Revista Legislatura';
        const fetchPosts = async () => {
            try {
                setLoading(true);
                const res = await fetch('/api/post/getPosts');
                if (!res.ok) {
                    throw new Error('Failed to fetch posts');
                }
                const data = await res.json();

                // Ordenar posts por fecha descendente (más recientes primero)
                const sortedPosts = data.posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setPosts(sortedPosts);
                setError(null);
            } catch (err) {
                console.error('Error fetching posts:', err);
                setError('Hubo un problema al cargar los artículos.');
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    return (
        <div>
            {/* 🔥 Carrusel al inicio */}
            {loading ? (
                <div className="flex justify-center items-center h-96">
                    <p className="text-[#545454]">Cargando posts...</p>
                </div>
            ) : error ? (
                <div className="flex justify-center items-center h-96">
                    <p className="text-red-500">{error}</p>
                </div>
            ) : (
                <PostCarousel posts={posts.slice(0, 5)} />
            )}

            {/* Resto del contenido */}
            <div className='flex flex-col gap-6 p-10 px-3 max-w-6xl mx-auto'>
                <h1 className='text-3xl font-bold italic lg:text-6xl pt-10'>Revista Legislatura</h1>
                <p className='text-[#545454] text-xs sm:text-sm'>
                    Bienvenid@ a la primera revista especializada en materia legislativa, electoral y política en México
                </p>
                <Link to='/search' className='text-xs sm:text-sm text-[#b076ce] font-bold hover:underline'>
                    Ver todos los artículos
                </Link>

                <div className='p-1'>
                    <CallToAction />
                </div>
            </div>

            {/* Sección de Artículos Recientes */}
            <div className='max-w-6xl mx-auto p-3 flex flex-col gap-8 py-3'>
                {posts.length > 0 ? (
                    <div className='flex flex-col gap-6'>
                        <h2 className='text-2xl font-semibold text-center'>Artículos recientes</h2>
                        <div className='flex flex-wrap gap-3'>
                            {/* Mostrar solo los últimos 4 posts */}
                            {posts.slice(0, 4).map((post) => (
                                <PostCard key={post._id} post={post} />
                            ))}
                        </div>
                        <Link to={'/search'} className='text-lg text-[#b076ce] hover:underline text-center'>
                            Ver todos los artículos
                        </Link>
                    </div>
                ) : (
                    <p className='text-center text-[#545454]'>No hay artículos disponibles.</p>
                )}
            </div>
        </div>
    );
}