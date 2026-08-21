import { Link } from 'react-router-dom';
import { useEffect, useState, useCallback, Suspense, lazy } from 'react';
import CallToAction from '../components/CallToAction';
import InstitutionalBanner from '../components/InstitutionalBanner';
import PostCard from '../components/PostCard';
import CongressCompositionChart from '../components/PieChart';

const PostCarousel = lazy(() => import('../components/PostCarousel'));

const useDocumentTitle = (title) => {
    useEffect(() => {
        document.title = title;
    }, [title]);
};

// ── Skeletons ──────────────────────────────────────────────────────────────

const CarouselSkeleton = () => (
    <div className="w-full h-64 sm:h-80 md:h-96 lg:h-[420px] bg-gray-100 animate-pulse rounded-sm flex items-center justify-center">
        <div className="space-y-3 text-center w-full max-w-sm px-6">
            <div className="h-2.5 bg-gray-200 rounded w-24 mx-auto"></div>
            <div className="h-5 bg-gray-200 rounded w-full mx-auto"></div>
            <div className="h-5 bg-gray-200 rounded w-4/5 mx-auto"></div>
            <div className="h-2.5 bg-gray-200 rounded w-32 mx-auto"></div>
        </div>
    </div>
);

const ArticlesSkeleton = () => (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 animate-pulse">
        <div className="lg:col-span-3 h-80 md:h-[500px] bg-gray-100 rounded-sm"></div>
        <div className="lg:col-span-2 divide-y divide-gray-100">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-3 py-4">
                    <div className="w-10 h-8 bg-gray-100 rounded flex-shrink-0"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-2.5 bg-gray-100 rounded w-20"></div>
                        <div className="h-3.5 bg-gray-100 rounded w-full"></div>
                        <div className="h-3.5 bg-gray-100 rounded w-4/5"></div>
                        <div className="h-2 bg-gray-100 rounded w-24 mt-1"></div>
                    </div>
                    <div className="w-14 h-14 bg-gray-100 rounded flex-shrink-0"></div>
                </div>
            ))}
        </div>
    </div>
);

// ── Primitivos editoriales ─────────────────────────────────────────────────

const SectionLabel = ({ label, action }) => (
    <div className="flex items-center gap-3 mb-5">
        <span className="text-[10px] font-black text-[#B076CE] uppercase tracking-[0.3em] flex-shrink-0">
            {label}
        </span>
        <div className="flex-1 h-px bg-gray-200"></div>
        {action && (
            <Link
                to={action.href}
                className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-[#B076CE] transition-colors font-bold uppercase tracking-wider flex-shrink-0"
            >
                {action.text}
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
            </Link>
        )}
    </div>
);

// ── Cabecera editorial ─────────────────────────────────────────────────────

const TopBar = () => (
    <div className="bg-gray-900 text-white py-2 px-4 border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <p className="text-[11px] text-gray-300 font-light capitalize">
                {new Date().toLocaleDateString('es-ES', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                })}
            </p>
            <div className="hidden md:flex items-center gap-3 text-[10px] text-gray-500 uppercase tracking-widest font-medium">
                <span>Análisis Legislativo</span>
                <span className="text-gray-700">·</span>
                <span>Política Electoral</span>
                <span className="text-gray-700">·</span>
                <span>México</span>
            </div>
            <Link
                to="/search?isMagazine=true"
                className="text-[10px] text-[#B076CE] hover:text-purple-300 transition-colors font-bold uppercase tracking-widest"
            >
                Revistas →
            </Link>
        </div>
    </div>
);

const Masthead = () => (
    <header className="bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-7 pb-0">
            {/* Doble línea superior estilo periódico */}
            <div className="mb-5 space-y-[3px]">
                <div className="h-[3px] bg-gray-900 w-full"></div>
                <div className="h-[2px] bg-[#B076CE] w-full"></div>
            </div>

            {/* Cabecera en tres columnas */}
            <div className="grid grid-cols-3 gap-4 pb-5 border-b-2 border-gray-900">
                {/* Izquierda: edición */}
                <div className="flex flex-col justify-between">
                    <div>
                        <p className="text-[10px] text-gray-500 font-semibold tracking-widest uppercase">
                            {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                        </p>
                        <p className="text-[10px] text-gray-400 font-light mt-0.5 hidden sm:block">
                            Publicación especializada
                        </p>
                    </div>
                    <div className="hidden md:flex items-center gap-2 mt-3">
                        <div className="w-2 h-2 rounded-full bg-[#B076CE]"></div>
                        <span className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">México</span>
                    </div>
                </div>

                {/* Centro: logotipo + título */}
                <div className="flex flex-col items-center text-center">
                    <img
                        src="/logoSingInUp.svg"
                        alt="Revista Legislatura"
                        className="h-10 sm:h-12 md:h-14 w-auto mb-2"
                    />
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-none tracking-tight">
                        Revista
                    </h1>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#B076CE] leading-none tracking-tight">
                        Legislatura
                    </h1>
                </div>

                {/* Derecha: especialidades */}
                <div className="flex flex-col justify-between items-end text-right">
                    <div className="space-y-0.5">
                        <p className="text-[10px] text-gray-500 font-semibold tracking-widest uppercase mb-1">
                            Especializada en
                        </p>
                        {['Análisis legislativo', 'Política electoral', 'Noticias de impacto'].map((t) => (
                            <p key={t} className="text-[10px] text-gray-500 font-light hidden sm:block">{t}</p>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                        <div className="w-8 h-px bg-[#B076CE]"></div>
                        <span className="text-[10px] text-[#B076CE] font-black uppercase tracking-widest">IMEPOL</span>
                    </div>
                </div>
            </div>
        </div>
    </header>
);

// ── Tarjeta artículo destacado ─────────────────────────────────────────────

const FeaturedCard = ({ post }) => (
    <Link to={`/post/${post.slug}`} className="group block h-full">
        <article className="relative h-full rounded-sm overflow-hidden bg-gray-900 min-h-[320px]">
            {post.image ? (
                <img
                    src={post.image}
                    alt={post.title}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover opacity-65 group-hover:opacity-55 group-hover:scale-105 transition-all duration-700"
                />
            ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#B076CE]/40 to-purple-900/80"></div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent"></div>

            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="px-2 py-0.5 bg-[#B076CE] text-white text-[10px] font-black uppercase tracking-widest">
                        {post.category === 'uncategorized' ? 'General' : post.category}
                    </span>
                    <span className="text-gray-400 text-[11px] font-light">
                        {new Date(post.publishDate || post.createdAt).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                        })}
                    </span>
                </div>
                <h3 className="text-white text-xl md:text-2xl lg:text-3xl font-black leading-tight mb-4 group-hover:text-[#B076CE] transition-colors duration-300 line-clamp-3">
                    {post.title}
                </h3>
                <div className="flex items-center gap-2 text-white/50 text-sm font-semibold group-hover:text-[#B076CE] transition-colors">
                    <span>Leer artículo</span>
                    <svg
                        className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </div>
            </div>
        </article>
    </Link>
);

// ── Artículo lateral numerado ──────────────────────────────────────────────

const SideArticle = ({ post, index }) => (
    <Link to={`/post/${post.slug}`} className="group block">
        <article className="flex gap-3 py-3.5 border-b border-gray-100 last:border-0 transition-all">
            <span className="text-3xl font-black text-gray-100 group-hover:text-[#B076CE]/20 transition-colors leading-none mt-0.5 w-9 text-right flex-shrink-0 select-none tabular-nums">
                {String(index).padStart(2, '0')}
            </span>
            <div className="flex-1 min-w-0">
                <span className="text-[10px] font-black text-[#B076CE] uppercase tracking-widest block mb-0.5">
                    {post.category === 'uncategorized' ? 'General' : post.category}
                </span>
                <h4 className="text-sm font-bold text-gray-900 group-hover:text-[#B076CE] transition-colors line-clamp-2 leading-snug">
                    {post.title}
                </h4>
                <p className="text-[11px] text-gray-400 mt-1 font-light">
                    {new Date(post.publishDate || post.createdAt).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                    })}
                </p>
            </div>
            {post.image && (
                <div className="w-14 h-14 flex-shrink-0 rounded-sm overflow-hidden bg-gray-100">
                    <img
                        src={post.image}
                        alt=""
                        aria-hidden="true"
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                </div>
            )}
        </article>
    </Link>
);

// ── Grid editorial principal ───────────────────────────────────────────────

const EditorialGrid = ({ posts, loading }) => {
    if (loading) return <ArticlesSkeleton />;

    if (!posts || posts.length === 0) {
        return (
            <p className="text-center text-gray-400 py-16 font-light text-sm">
                No hay artículos disponibles en este momento.
            </p>
        );
    }

    const featured = posts[0];
    const sidebar = posts.slice(1, 6);
    const bottom = posts.slice(6, 9);

    return (
        <div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-10">
                {/* Artículo destacado: 3/5 */}
                <div className="lg:col-span-3 h-80 md:h-96 lg:h-[500px]">
                    <FeaturedCard post={featured} />
                </div>
                {/* Lista lateral: 2/5 */}
                <div className="lg:col-span-2">
                    {sidebar.map((post, i) => (
                        <SideArticle key={post._id} post={post} index={i + 2} />
                    ))}
                </div>
            </div>

            {bottom.length > 0 && (
                <div className="mt-10 pt-8 border-t border-gray-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {bottom.map((post) => (
                            <PostCard key={post._id} post={post} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// ── Sección de estadísticas ────────────────────────────────────────────────

const StatsGrid = () => {
    const stats = [
        { value: '+500', label: 'Artículos', sub: 'Análisis y reportajes' },
        { value: 'Diaria', label: 'Actualización', sub: 'Noticias en tiempo real' },
        { value: '6+', label: 'Categorías', sub: 'Temáticas especializadas' },
        { value: '2019', label: 'Fundación', sub: 'Años de trayectoria' },
    ];

    return (
        <div className="grid grid-cols-2 gap-3">
            {stats.map((s) => (
                <div
                    key={s.label}
                    className="bg-white border border-gray-100 hover:border-[#B076CE]/40 p-5 transition-all duration-300 hover:shadow-sm group cursor-default"
                >
                    <p className="text-2xl md:text-3xl font-black text-gray-900 group-hover:text-[#B076CE] transition-colors">
                        {s.value}
                    </p>
                    <p className="text-[10px] font-black text-[#B076CE] uppercase tracking-widest mt-1">{s.label}</p>
                    <p className="text-gray-400 text-[11px] mt-0.5 font-light">{s.sub}</p>
                </div>
            ))}
        </div>
    );
};

// ── Componente principal ───────────────────────────────────────────────────

export default function Home() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useDocumentTitle('Inicio - Revista Legislatura');

    const fetchPosts = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/post/getPosts');
            if (!res.ok) throw new Error('Failed to fetch posts');
            const data = await res.json();
            setPosts(
                data.posts.sort((a, b) =>
                    new Date(b.publishDate || b.createdAt) - new Date(a.publishDate || a.createdAt)
                )
            );
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
        <main className="min-h-screen bg-white font-['Montserrat',sans-serif]">

            {/* ── Barra superior ── */}
            <TopBar />

            {/* ── Cabecera editorial ── */}
            <Masthead />

            {/* ── Carrusel destacado ── */}
            <section className="max-w-7xl mx-auto px-4 md:px-8 py-8">
                <SectionLabel label="Destacado de hoy" />
                {loading ? (
                    <CarouselSkeleton />
                ) : error ? (
                    <div className="w-full h-64 sm:h-80 md:h-96 flex items-center justify-center bg-gray-50 border border-gray-100 rounded-sm">
                        <div className="text-center p-6 max-w-sm">
                            <p className="text-red-400 mb-4 font-light text-sm">{error}</p>
                            <button
                                onClick={fetchPosts}
                                className="px-4 py-2 bg-[#B076CE] text-white text-sm font-bold rounded-sm hover:bg-purple-700 transition-colors"
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

            {/* ── Bienvenida + estadísticas ── */}
            <section className="border-y border-gray-200 bg-gray-50/60">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-14">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                        {/* Texto */}
                        <div>
                            <SectionLabel label="Bienvenido" />
                            <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-5">
                                La primera revista especializada<br />
                                en materia{' '}
                                <span className="text-[#B076CE]">legislativa</span>{' '}
                                en México
                            </h2>
                            <p className="text-gray-600 text-base font-light leading-relaxed mb-7 max-w-lg">
                                Análisis profundos, investigaciones de datos y reportajes exclusivos sobre la actividad
                                legislativa, política electoral y decisiones que impactan al país.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Link
                                    to="/search"
                                    className="px-5 py-2.5 bg-gray-900 text-white text-sm font-bold tracking-wide hover:bg-[#B076CE] transition-colors duration-300 text-center rounded-sm"
                                >
                                    Explorar artículos
                                </Link>
                                <Link
                                    to="/about"
                                    className="px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold tracking-wide hover:border-[#B076CE] hover:text-[#B076CE] transition-colors duration-300 text-center rounded-sm"
                                >
                                    Conocer más
                                </Link>
                            </div>
                        </div>

                        {/* Stats */}
                        <StatsGrid />
                    </div>

                    <div className="mt-10 pt-8 border-t border-gray-200">
                        <CallToAction />
                    </div>
                </div>
            </section>

            {/* ── Grid editorial de artículos ── */}
            <section className="max-w-7xl mx-auto px-4 md:px-8 py-14">
                <SectionLabel
                    label="Lo más reciente"
                    action={!loading ? { href: '/search', text: 'Ver todos los artículos' } : undefined}
                />
                <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-8 leading-tight">
                    Artículos Destacados
                </h2>
                <EditorialGrid posts={posts} loading={loading} />
            </section>

            {/* ── Banner institucional ── */}
            <section className="max-w-7xl mx-auto px-4 md:px-8 pb-14">
                <InstitutionalBanner />
            </section>

            {/* ── Composición del Congreso ── */}
            <section className="bg-gray-50 border-t border-gray-200 py-14">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <SectionLabel label="Análisis" />
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-8 leading-tight">
                        Composición del Congreso
                    </h2>
                    <CongressCompositionChart
                        senators={[
                            { party: 'MORENA', count: 67 },
                            { party: 'PAN',    count: 21 },
                            { party: 'PVEM',   count: 14 },
                            { party: 'PRI',    count: 13 },
                            { party: 'PT',     count: 6  },
                            { party: 'MC',     count: 6  },
                            { party: 'SP',     count: 1  },
                        ]}
                        deputies={[
                            { party: 'MORENA', count: 253 },
                            { party: 'PAN',    count: 71  },
                            { party: 'PVEM',   count: 62  },
                            { party: 'PT',     count: 49  },
                            { party: 'PRI',    count: 37  },
                            { party: 'MC',     count: 27  },
                            { party: 'SP',     count: 1   },
                        ]}
                        title="Composición Actual del Congreso"
                    />
                </div>
            </section>

            <div className="h-8"></div>
        </main>
    );
}
