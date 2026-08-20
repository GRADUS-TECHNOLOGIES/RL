import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PostCard from '../components/PostCard';
import InstitutionalBanner from '../components/InstitutionalBanner';

// ── Primitivos ─────────────────────────────────────────────────────────────

const SectionLabel = ({ label }) => (
    <div className="flex items-center gap-3 mb-4">
        <div className="w-[2px] h-4 bg-[#B076CE] flex-shrink-0" />
        <span className="text-[10px] font-black text-[#B076CE] uppercase tracking-[0.3em]">{label}</span>
        <div className="flex-1 h-px bg-gray-100" />
    </div>
);

// Chevron para selects nativos
const Chevron = () => (
    <svg className="w-3 h-3 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
);

const CATEGORIES = [
    { value: 'uncategorized', label: 'Todas las categorías' },
    { value: 'actualidad',    label: 'Actualidad urgente'     },
    { value: 'analisis',      label: 'Análisis legislativo'   },
    { value: 'derecho',       label: 'Derecho y constitución' },
    { value: 'electoral',     label: 'Electoral'              },
    { value: 'entrevista',    label: 'Entrevista'             },
    { value: 'internacional', label: 'Política internacional' },
    { value: 'investigacion', label: 'Investigación y datos'  },
    { value: 'opinion',       label: 'Opinión y debate'       },
    { value: 'politica',      label: 'Poder y política'       },
];

// ── Skeletons de carga ─────────────────────────────────────────────────────

function SkeletonCard() {
    return (
        <div className="border border-gray-100 animate-pulse">
            <div className="h-[200px] bg-gray-100" />
            <div className="p-4 space-y-2">
                <div className="h-2 w-20 bg-gray-100" />
                <div className="h-4 w-full bg-gray-100" />
                <div className="h-4 w-3/4 bg-gray-100" />
            </div>
        </div>
    );
}

// ── Componente principal ───────────────────────────────────────────────────

export default function Search() {
    const location = useLocation();
    const navigate = useNavigate();

    const [sidebarData, setSidebarData] = useState({
        searchTerm: '',
        sort:       'desc',
        category:   'uncategorized',
        isMagazine: false,
    });
    const [posts,    setPosts]    = useState([]);
    const [loading,  setLoading]  = useState(false);
    const [showMore, setShowMore] = useState(false);

    useEffect(() => {
        document.title = 'Buscar – Revista Legislatura';
        const params = new URLSearchParams(location.search);
        setSidebarData({
            searchTerm: params.get('searchTerm') || '',
            sort:       params.get('sort')       || 'desc',
            category:   params.get('category')   || 'uncategorized',
            isMagazine: params.get('isMagazine') === 'true',
        });
        fetchPosts(params);
    }, [location.search]);

    const fetchPosts = async (params) => {
        setLoading(true);
        try {
            const res  = await fetch(`/api/post/getposts?${params.toString()}`);
            if (!res.ok) throw new Error('Sin resultados');
            const data = await res.json();
            const sorted = (data.posts ?? []).sort((a, b) =>
                (params.get('sort') === 'asc')
                    ? new Date(a.createdAt) - new Date(b.createdAt)
                    : new Date(b.createdAt) - new Date(a.createdAt)
            );
            setPosts(sorted);
            setShowMore(sorted.length === 9);
        } catch {
            setPosts([]);
            setShowMore(false);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { id, value } = e.target;
        setSidebarData((prev) => ({ ...prev, [id]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        params.set('searchTerm', sidebarData.searchTerm);
        params.set('sort',       sidebarData.sort);
        params.set('category',   sidebarData.category);
        if (sidebarData.isMagazine) params.set('isMagazine', 'true');
        navigate(`/search?${params.toString()}`);
    };

    const handleShowMore = async () => {
        const params = new URLSearchParams(location.search);
        params.set('startIndex', posts.length);
        try {
            const res  = await fetch(`/api/post/getposts?${params.toString()}`);
            if (!res.ok) return;
            const data = await res.json();
            const more = (data.posts ?? []).sort((a, b) =>
                sidebarData.sort === 'asc'
                    ? new Date(a.createdAt) - new Date(b.createdAt)
                    : new Date(b.createdAt) - new Date(a.createdAt)
            );
            setPosts((prev) => [...prev, ...more]);
            setShowMore(more.length >= 9);
        } catch (err) {
            console.error(err.message);
        }
    };

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-white">

            {/* ── Sidebar de filtros ── */}
            <aside className="w-full md:w-64 md:flex-shrink-0 border-b md:border-b-0 md:border-r border-gray-100 md:min-h-screen p-6 md:p-8">

                <SectionLabel label="Filtrar" />
                <h2 className="text-xl font-black text-gray-900 mb-6">Contenido</h2>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Término */}
                    <div>
                        <label
                            htmlFor="searchTerm"
                            className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1.5"
                        >
                            Término de búsqueda
                        </label>
                        <input
                            id="searchTerm"
                            type="text"
                            placeholder="Escribe algo..."
                            value={sidebarData.searchTerm}
                            onChange={handleChange}
                            className="w-full border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-300 placeholder:font-light outline-none focus:border-[#B076CE] transition-colors bg-white"
                        />
                    </div>

                    {/* Orden */}
                    <div>
                        <label
                            htmlFor="sort"
                            className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1.5"
                        >
                            Ordenar por
                        </label>
                        <div className="relative">
                            <select
                                id="sort"
                                value={sidebarData.sort}
                                onChange={handleChange}
                                className="w-full appearance-none border border-gray-200 px-3 py-2 pr-8 text-sm text-gray-700 outline-none focus:border-[#B076CE] transition-colors bg-white cursor-pointer"
                            >
                                <option value="desc">Más reciente</option>
                                <option value="asc">Más antiguo</option>
                            </select>
                            <div className="absolute inset-y-0 right-3 flex items-center">
                                <Chevron />
                            </div>
                        </div>
                    </div>

                    {/* Categoría */}
                    <div>
                        <label
                            htmlFor="category"
                            className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1.5"
                        >
                            Categoría
                        </label>
                        <div className="relative">
                            <select
                                id="category"
                                value={sidebarData.category}
                                onChange={handleChange}
                                className="w-full appearance-none border border-gray-200 px-3 py-2 pr-8 text-sm text-gray-700 outline-none focus:border-[#B076CE] transition-colors bg-white cursor-pointer"
                            >
                                {CATEGORIES.map(({ value, label }) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-3 flex items-center">
                                <Chevron />
                            </div>
                        </div>
                    </div>

                    {/* Toggle solo revistas */}
                    <div>
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div
                                onClick={() => setSidebarData((p) => ({ ...p, isMagazine: !p.isMagazine }))}
                                className={`relative w-9 h-5 flex items-center p-0.5 flex-shrink-0 transition-colors duration-300 ${
                                    sidebarData.isMagazine ? 'bg-[#B076CE]' : 'bg-gray-200'
                                }`}
                            >
                                <div className={`bg-white w-4 h-4 shadow-sm transform transition-transform duration-300 ${
                                    sidebarData.isMagazine ? 'translate-x-4' : 'translate-x-0'
                                }`} />
                            </div>
                            <span className="text-sm text-gray-600 font-light group-hover:text-gray-900 transition-colors">
                                Solo revistas (PDFs)
                            </span>
                        </label>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="w-full py-2.5 border border-gray-900 text-gray-900 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#B076CE] hover:border-[#B076CE] hover:text-white transition-all duration-300"
                    >
                        Aplicar filtros
                    </button>
                </form>
            </aside>

            {/* ── Resultados ── */}
            <main className="flex-1 p-6 md:p-8">

                {/* Encabezado */}
                <div className="mb-8 pb-6 border-b border-gray-100">
                    <SectionLabel label="Búsqueda" />
                    <div className="flex items-end justify-between">
                        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mt-4 leading-tight">
                            Resultados
                        </h1>
                        {!loading && posts.length > 0 && (
                            <p className="text-sm text-gray-400 font-light mb-1">
                                {posts.length} {posts.length === 1 ? 'resultado' : 'resultados'}
                            </p>
                        )}
                    </div>
                </div>

                {/* Grid de resultados */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : posts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-[2px] h-8 bg-gray-100 mb-4" />
                        <p className="text-sm text-gray-300 font-light">
                            No se encontraron resultados para tu búsqueda
                        </p>
                        <p className="text-xs text-gray-200 font-light mt-1">
                            Intenta con otros términos o ajusta los filtros
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {posts.map((post) => (
                                <PostCard key={post._id} post={post} />
                            ))}
                        </div>

                        <div className="mt-10">
                            <InstitutionalBanner />
                        </div>

                        {showMore && (
                            <button
                                onClick={handleShowMore}
                                className="w-full mt-8 py-3 text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] hover:text-[#B076CE] transition-colors border-t border-gray-100"
                            >
                                Mostrar más →
                            </button>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
