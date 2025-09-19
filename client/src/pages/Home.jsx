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
    <div className="w-full h-64 sm:h-80 md:h-96 lg:h-[420px] bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
        <div className="text-gray-400 text-lg">Cargando carrusel...</div>
    </div>
);

// ✅ Barra de logo y navegación
const LogoAndNav = () => (
    <section className="w-full flex flex-col items-center mt-2">
        {/* Logo como imagen */}
        <img
            src="/logoSingInUp.svg"   // <-- ajusta la ruta según donde tengas el archivo
            alt="Revista Legislatura Logo"
            className="w-auto h-20 sm:h-24 md:h-80"
        />

        {/* Línea negra con menú */}
        <nav className="w-full border-t-2 border-b-2 border-black">
            <ul className="flex justify-center gap-6 py-3 font-medium text-sm sm:text-base">
                <li>
                    <Link to="/" className="hover:underline">
                        Inicio
                    </Link>
                </li>
                <li>
                    <Link to="/about" className="hover:underline">
                        Conócenos
                    </Link>
                </li>
                <li>
                    <Link to="/services" className="hover:underline">
                        Servicios
                    </Link>
                </li>
                <li>
                    <Link to="/purpose" className="hover:underline">
                        Nosotros
                    </Link>
                </li>
            </ul>
        </nav>
    </section>
);

// ✅ Sección de bienvenida
const WelcomeSection = () => (
    <section className="flex flex-col gap-6 px-4 sm:px-6 md:px-10 max-w mx-auto py-10">
        <h1 className="text-black text-sm sm:text-base md:text-4xl text-center max-w-6xl mx-auto leading-relaxed">
            Bienvenid@ a la primera revista especializada en materia legislativa, electoral y política en México.
        </h1>
        <div className="flex justify-center">
            <Link
                to="/search"
                className="text-sm sm:text-base text-[#b076ce] font-bold hover:underline hover:text-[#9a5cb5] transition-colors"
                aria-label="Ver todos los artículos"
            >
                Ver todos los artículos
            </Link>
        </div>
        <div className="p-1 max-w-4xl mx-auto">
            <CallToAction />
        </div>
    </section>
);

// ✅ Sección de artículos recientes
const RecentArticlesSection = ({ posts }) => {
    if (posts.length === 0) {
        return (
            <section className="max-w-6xl mx-auto p-6 text-center">
                <p className="text-[#545454] text-lg">
                    No hay artículos disponibles en este momento.
                </p>
            </section>
        );
    }

    return (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
            {/* 🔥 Encabezado con título a la izquierda y link a la derecha */}
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">
                    Artículos recientes
                </h2>
                <Link
                    to="/search"
                    className="text-md text-black hover:underline hover:text-[#9a5cb5] font-medium transition-all"
                    aria-label="Ver todos los artículos"
                >
                    Más artículos
                </Link>
            </div>

            {/* 🔥 Grid de artículos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {posts.slice(0, 4).map((post) => (
                    <PostCard key={post._id} post={post} />
                ))}
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
        <main className="min-h-screen">
            {/* 🔥 Logo + Nav */}
            <LogoAndNav />

            {/* 🔥 Carrusel al inicio */}
            <section aria-labelledby="featured-posts-heading" className="relative">
                {loading ? (
                    <CarouselSkeleton />
                ) : error ? (
                    <div className="w-full h-64 sm:h-80 md:h-96 lg:h-[420px] flex items-center justify-center bg-gray-50">
                        <div className="text-center p-6 max-w-md">
                            <p className="text-red-500 mb-4">{error}</p>
                            <button
                                onClick={fetchPosts}
                                className="text-[#b076ce] font-medium hover:underline"
                            >
                                Reintentar cargar carrusel
                            </button>
                        </div>
                    </div>
                ) : (
                    <Suspense fallback={<CarouselSkeleton />}>
                        <PostCarousel posts={posts.slice(0, 5)} />
                    </Suspense>
                )}
            </section>

            {/* ✅ Bienvenida */}
            <WelcomeSection />

            {/* ✅ Artículos recientes */}
            {posts.length > 0 && <RecentArticlesSection posts={posts} />}

            {/* ✅ Gráfica de composición del Congreso */}
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
        </main>
    );
}