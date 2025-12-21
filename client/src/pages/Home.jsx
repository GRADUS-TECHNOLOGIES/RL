import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState, useCallback, Suspense, lazy } from 'react';
import CallToAction from '../components/CallToAction';
import PostCard from '../components/PostCard';
import CongressCompositionChart from '../components/PieChart';

// ✅ Carga diferida del carrusel
const PostCarousel = lazy(() => import('../components/PostCarousel'));

// Hook para título
const useDocumentTitle = (title) => {
    useEffect(() => {
        document.title = title;
    }, [title]);
};

// Skeletons
const CarouselSkeleton = () => (
    <div className="w-full h-64 sm:h-80 md:h-96 lg:h-[420px] bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse rounded-lg flex items-center justify-center">
        <div className="text-gray-400 text-lg font-light">Cargando destacados...</div>
    </div>
);

// Hero con logo estilo revista
const HeroSection = () => (
    <section className="w-full bg-gradient-to-b from-white to-gray-50 border-b-4 border-[#B076CE] py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                {/* Logo */}
                <div className="flex-shrink-0">
                    <img
                        src="/logoSingInUp.svg"
                        alt="Revista Legislatura Logo"
                        className="w-auto h-16 sm:h-20 md:h-28 hover:scale-105 transition-transform duration-300"
                    />
                </div>

                {/* Tagline estilo revista */}
                <div className="flex-1 text-center md:text-left">
                    <p className="text-xs md:text-sm font-semibold text-[#B076CE] uppercase tracking-widest">
                        Análisis Legislativo • Política • Electoral
                    </p>
                    <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mt-2 leading-tight">
                        Revista <span className="text-[#B076CE]">Legislatura</span>
                    </h1>
                    <p className="text-gray-600 text-lg mt-3 font-light">
                        Tu fuente confiable de información legislativa, análisis político y noticias de impacto en México.
                    </p>
                </div>
            </div>
        </div>
    </section>
);

// ✅ Sección de bienvenida mejorada
const WelcomeSection = () => (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {/* Columna izquierda - Contenido principal */}
            <div className="md:col-span-2 border-l-4 border-[#B076CE] pl-6">
                <h2 className="text-sm font-bold text-[#B076CE] uppercase tracking-widest mb-3">
                    Bienvenido
                </h2>
                <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                    La primera revista especializada en materia legislativa y política en México
                </h3>
                <p className="text-gray-700 text-lg leading-relaxed mb-6 font-light">
                    Descubre análisis profundos, investigaciones de datos y reportajes exclusivos sobre la actividad legislativa, 
                    política electoral y decisiones que impactan al país.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                        to="/search"
                        className="px-6 py-3 bg-[#B076CE] text-white font-semibold rounded-lg hover:bg-purple-700 transition-all duration-300 text-center"
                    >
                        Explorar artículos
                    </Link>
                    <Link
                        to="/about"
                        className="px-6 py-3 border-2 border-[#B076CE] text-[#B076CE] font-semibold rounded-lg hover:bg-[#B076CE]/10 transition-all duration-300 text-center"
                    >
                        Conocer más
                    </Link>
                </div>
            </div>

            {/* Columna derecha - Estadísticas estilo revista */}
            <div className="space-y-4">
                <div className="bg-gradient-to-br from-[#B076CE]/10 to-purple-100/20 p-6 rounded-lg border border-[#B076CE]/20">
                    <p className="text-sm font-semibold text-[#B076CE] uppercase">Contenido disponible</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">+500</p>
                    <p className="text-gray-600 text-sm mt-1">Artículos y análisis</p>
                </div>
                <div className="bg-gradient-to-br from-purple-100/20 to-pink-100/20 p-6 rounded-lg border border-purple-200/20">
                    <p className="text-sm font-semibold text-purple-700 uppercase">Actualización</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">Diaria</p>
                    <p className="text-gray-600 text-sm mt-1">Noticias en tiempo real</p>
                </div>
            </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12">
            <CallToAction />
        </div>
    </section>
);

// ✅ Sección de artículos recientes estilo revista
const RecentArticlesSection = ({ posts }) => {
    if (posts.length === 0) {
        return (
            <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 text-center">
                <p className="text-gray-600 text-lg font-light">
                    No hay artículos disponibles en este momento.
                </p>
            </section>
        );
    }

    return (
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 border-t-2 border-gray-200">
            {/* Encabezado de sección estilo periódico */}
            <div className="mb-12 pb-6 border-b-4 border-[#B076CE]">
                <div className="flex items-baseline justify-between">
                    <div>
                        <p className="text-xs font-bold text-[#B076CE] uppercase tracking-widest mb-2">
                            Lo más reciente
                        </p>
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                            Artículos destacados
                        </h2>
                    </div>
                    <Link
                        to="/search"
                        className="text-[#B076CE] hover:text-purple-700 font-semibold text-sm uppercase tracking-wider transition-colors"
                    >
                        Ver todos →
                    </Link>
                </div>
            </div>

            {/* Grid de artículos con destaque del primero */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Artículo destacado (primero) - Más grande en desktop */}
                {posts.length > 0 && (
                    <div className="lg:col-span-2 lg:row-span-2">
                        <Link to={`/post/${posts[0].slug}`} className="group block h-full">
                            <div className="h-full bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300">
                                {posts[0].image && (
                                    <div className="relative overflow-hidden h-64 md:h-80">
                                        <img
                                            src={posts[0].image}
                                            alt={posts[0].title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                    </div>
                                )}
                                <div className="p-6">
                                    <span className="inline-block px-3 py-1 bg-[#B076CE] text-white text-xs font-bold rounded-full mb-4">
                                        {posts[0].category === 'uncategorized' ? 'General' : posts[0].category}
                                    </span>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-[#B076CE] transition-colors line-clamp-2">
                                        {posts[0].title}
                                    </h3>
                                    <p className="text-gray-600 text-sm font-light">
                                        {new Date(posts[0].createdAt).toLocaleDateString('es-ES', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    </div>
                )}

                {/* Artículos secundarios - Grid en columna */}
                <div className="lg:col-span-2 space-y-5">
                    {posts.slice(1, 5).map((post, index) => (
                        <Link key={post._id} to={`/post/${post.slug}`} className="group">
                            <div className="flex gap-4 pb-4 border-b border-gray-100 hover:border-[#B076CE]/50 transition-colors">
                                {/* Número estilo periódico */}
                                <div className="text-5xl font-black text-gray-200 group-hover:text-[#B076CE]/20 transition-colors flex-shrink-0">
                                    {index + 2 < 10 ? `0${index + 2}` : index + 2}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className="text-xs font-bold text-[#B076CE] uppercase tracking-widest">
                                        {post.category === 'uncategorized' ? 'General' : post.category}
                                    </span>
                                    <h4 className="text-lg font-bold text-gray-900 mt-1 group-hover:text-[#B076CE] transition-colors line-clamp-2">
                                        {post.title}
                                    </h4>
                                    <p className="text-gray-600 text-xs mt-2 font-light">
                                        {new Date(post.createdAt).toLocaleDateString('es-ES', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};


export default function Home() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const location = useLocation();

    useDocumentTitle('Inicio - Revista Legislatura');

    const fetchPosts = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/post/getPosts');
            if (!res.ok) {
                throw new Error('Failed to fetch posts');
            }
            const data = await res.json();

            const sortedPosts = data.posts.sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
            setPosts(sortedPosts);
            setError(null);
        } catch (err) {
            console.error('Error fetching posts:', err);
            setError('Hubo un problema al cargar los artículos. Por favor, inténtalo más tarde.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    return (
        <main className="min-h-screen bg-white">
            {/* 🎯 Hero estilo revista */}
            <HeroSection />

            {/* 🎯 Carrusel al inicio */}
            <section aria-labelledby="featured-posts-heading" className="relative max-w-7xl mx-auto px-4 md:px-8 py-12">
                <p className="text-xs font-bold text-[#B076CE] uppercase tracking-widest mb-4">
                    Destacado de hoy
                </p>
                {loading ? (
                    <CarouselSkeleton />
                ) : error ? (
                    <div className="w-full h-64 sm:h-80 md:h-96 lg:h-[420px] flex items-center justify-center bg-gray-50 rounded-lg">
                        <div className="text-center p-6 max-w-md">
                            <p className="text-red-500 mb-4 font-light">{error}</p>
                            <button
                                onClick={fetchPosts}
                                className="px-4 py-2 bg-[#B076CE] text-white font-semibold rounded-lg hover:bg-purple-700 transition-all"
                            >
                                Reintentar
                            </button>
                        </div>
                    </div>
                ) : (
                    <Suspense fallback={<CarouselSkeleton />}>
                        <PostCarousel posts={posts.slice(0, 5)} />
                    </Suspense>
                )}
            </section>

            {/* ✅ Bienvenida estilo revista */}
            <WelcomeSection />

            {/* ✅ Artículos recientes */}
            {posts.length > 0 && <RecentArticlesSection posts={posts} />}

            {/* ✅ Gráfica de composición del Congreso */}
            <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 border-t-2 border-gray-200">
                <div className="mb-8 pb-6 border-b-4 border-[#B076CE]">
                    <p className="text-xs font-bold text-[#B076CE] uppercase tracking-widest mb-2">
                        Análisis
                    </p>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                        Composición del Congreso
                    </h2>
                </div>
                <CongressCompositionChart
                    senators={[
                        { party: 'MORENA', count: 67 },
                        { party: 'PAN', count: 21 },
                        { party: 'PVEM', count: 14 },
                        { party: 'PRI', count: 13 },
                        { party: 'PT', count: 6 },
                        { party: 'MC', count: 6 },
                        { party: 'SP', count: 1 },
                    ]}
                    deputies={[
                        { party: 'MORENA', count: 253 },
                        { party: 'PAN', count: 71 },
                        { party: 'PVEM', count: 62 },
                        { party: 'PT', count: 49 },
                        { party: 'PRI', count: 37 },
                        { party: 'MC', count: 27 },
                        { party: 'SP', count: 1 },
                    ]}
                    title="Composición Actual del Congreso"
                />
            </section>

            {/* Footer espaciador */}
            <div className="h-8"></div>
        </main>
    );
}