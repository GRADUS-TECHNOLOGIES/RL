import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Select, TextInput, ToggleSwitch } from 'flowbite-react';
import PostCard from '../components/PostCard';

export default function Search() {
    const location = useLocation();
    const navigate = useNavigate();

    const [sidebarData, setSidebarData] = useState({
        searchTerm: '',
        sort: 'desc',
        category: 'uncategorized',
        isMagazine: false,
    });

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showMore, setShowMore] = useState(false);

    useEffect(() => {
        document.title = 'Buscar - Revista Legislatura';
        const urlParams = new URLSearchParams(location.search);
        const searchTermFromUrl = urlParams.get('searchTerm') || '';
        const sortFromUrl = urlParams.get('sort') || 'desc';
        const categoryFromUrl = urlParams.get('category') || 'uncategorized';
        const isMagazineFromUrl = urlParams.get('isMagazine') === 'true';

        setSidebarData({
            searchTerm: searchTermFromUrl,
            sort: sortFromUrl,
            category: categoryFromUrl,
            isMagazine: isMagazineFromUrl,
        });

        fetchPosts(urlParams);
    }, [location.search]);

    const fetchPosts = async (urlParams) => {
        setLoading(true);
        try {
            if (sidebarData.isMagazine) {
                urlParams.set('isMagazine', 'true');
            } else {
                urlParams.delete('isMagazine');
            }

            const res = await fetch(`/api/post/getposts?${urlParams.toString()}`);
            if (!res.ok) throw new Error('No se encontraron resultados');

            const data = await res.json();
            const sortedPosts = data.posts?.sort((a, b) => {
                return sidebarData.sort === 'desc'
                    ? new Date(b.createdAt) - new Date(a.createdAt)
                    : new Date(a.createdAt) - new Date(b.createdAt);
            }) || [];

            setPosts(sortedPosts);
            setShowMore(sortedPosts.length === 9);
        } catch (error) {
            console.error(error.message);
            setPosts([]);
            setShowMore(false);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        // Manejo especial para ToggleSwitch
        if (typeof e === 'boolean') {
            setSidebarData((prev) => ({
                ...prev,
                isMagazine: e,
            }));
            return;
        }

        // Manejo normal para otros inputs
        const { id, value, type, checked } = e.target;
        setSidebarData((prev) => ({
            ...prev,
            [id]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const urlParams = new URLSearchParams();
        urlParams.set('searchTerm', sidebarData.searchTerm);
        urlParams.set('sort', sidebarData.sort);
        urlParams.set('category', sidebarData.category);

        if (sidebarData.isMagazine) {
            urlParams.set('isMagazine', 'true');
        }

        navigate(`/search?${urlParams.toString()}`);
    };

    const handleShowMore = async () => {
        const urlParams = new URLSearchParams(location.search);
        const startIndex = posts.length;
        urlParams.set('startIndex', startIndex);

        try {
            const res = await fetch(`/api/post/getposts?${urlParams.toString()}`);
            if (!res.ok) throw new Error('Error fetching more posts');

            const data = await res.json();
            const newPosts = data.posts || [];

            const sortedNewPosts = newPosts.sort((a, b) => {
                return sidebarData.sort === 'desc'
                    ? new Date(b.createdAt) - new Date(a.createdAt)
                    : new Date(a.createdAt) - new Date(b.createdAt);
            });

            setPosts((prev) => [...prev, ...sortedNewPosts]);
            setShowMore(newPosts.length >= 9);
        } catch (error) {
            console.error(error.message);
        }
    };

    return (
        <div className="flex flex-col md:flex-row min-h-screen">
            <div className="p-7 border-b md:border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 md:min-h-screen w-full md:w-auto">
                <h2 className="font-semibold text-lg mb-4">Filtrar contenido</h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <label htmlFor="searchTerm" className="whitespace-nowrap font-medium">
                            Término:
                        </label>
                        <TextInput
                            id="searchTerm"
                            type="text"
                            placeholder="Escribe algo..."
                            value={sidebarData.searchTerm}
                            onChange={handleChange}
                            className="w-full sm:flex-1"
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <label htmlFor="sort" className="whitespace-nowrap font-medium">
                            Orden:
                        </label>
                        <Select id="sort" value={sidebarData.sort} onChange={handleChange}>
                            <option value="desc">Más reciente</option>
                            <option value="asc">Más antiguo</option>
                        </Select>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <label htmlFor="category" className="whitespace-nowrap font-medium">
                            Categoría:
                        </label>
                        <Select id="category" value={sidebarData.category} onChange={handleChange}>
                            <option value="uncategorized">Categoría</option>
                            <option value="actualidad">Actualidad urgente</option>
                            <option value="analisis">Análisis legislativo</option>
                            <option value="derecho">Derecho y constitución</option>
                            <option value="electoral">Electoral</option>
                            <option value="entrevista">Entrevista</option>
                            <option value="internacional">Política internacional</option>
                            <option value="investigacion">Investigación y datos</option>
                            <option value="opinion">Opinión y debate</option>
                            <option value="politica">Poder y política</option>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2">
                        <ToggleSwitch
                            checked={sidebarData.isMagazine}
                            onChange={(checked) => handleChange(checked)}
                            label="Mostrar solo revistas (PDFs)"
                        />
                    </div>

                    <Button
                        outline
                        color="purple"
                        type="submit"
                        className="border-[#b076ce] text-[#b076ce] hover:bg-[#ddc8e3] hover:border-[#ddc8e3] hover:text-black transition-all duration-200"
                    >
                        Aplicar filtros
                    </Button>
                </form>
            </div>

            <div className="w-full p-5">
                <h1 className="text-2xl sm:text-3xl font-semibold border-b border-gray-200 dark:border-gray-700 pb-2">
                    Resultados de búsqueda:
                </h1>
                <div className="p-5 flex flex-wrap justify-center gap-6">
                    {!loading && posts.length === 0 && (
                        <p className="text-xl text-gray-500">No hay resultados.</p>
                    )}

                    {loading && (
                        <p className="text-xl text-gray-500">Cargando...</p>
                    )}

                    {!loading &&
                        posts.map((post) => <PostCard key={post._id} post={post} />)}

                    {showMore && (
                        <button
                            onClick={handleShowMore}
                            className="cursor-pointer text-[#b076ce] text-lg hover:underline hover:text-black w-full text-center py-3 transition-all duration-300"
                        >
                            Mostrar más
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}