import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

// ── Primitivos ─────────────────────────────────────────────────────────────

const SectionLabel = ({ label }) => (
    <div className="flex items-center gap-3">
        <div className="w-[2px] h-4 bg-[#B076CE] flex-shrink-0" />
        <span className="text-[10px] font-black text-[#B076CE] uppercase tracking-[0.3em]">{label}</span>
        <div className="flex-1 h-px bg-gray-100" />
    </div>
);

function DeleteModal({ message, onConfirm, onClose }) {
    return (
        <div
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div className="bg-white w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-[2px] h-4 bg-red-500" />
                        <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em]">
                            Acción irreversible
                        </span>
                    </div>
                    <button onClick={onClose} className="text-gray-300 hover:text-gray-900 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="px-6 py-6">
                    <h3 className="text-2xl font-black text-gray-900 mb-2">¿Estás seguro?</h3>
                    <p className="text-sm text-gray-500 font-light mb-8 leading-relaxed">{message}</p>
                    <div className="flex gap-3">
                        <button
                            onClick={onConfirm}
                            className="flex-1 py-2.5 bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-700 transition-colors"
                        >
                            Sí, eliminar
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-[10px] font-black uppercase tracking-[0.2em] hover:border-gray-900 hover:text-gray-900 transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const TH_COLS = ['Fecha', 'Media', 'Título', 'Categoría', 'Tipo', 'Eliminar', 'Editar'];

// ── Componente principal ───────────────────────────────────────────────────

export default function DashPosts() {
    const { currentUser }               = useSelector((s) => s.user);
    const [userPosts, setUserPosts]     = useState([]);
    const [showMore, setShowMore]       = useState(true);
    const [showModal, setShowModal]     = useState(false);
    const [postIdToDelete, setPostIdToDelete] = useState('');

    const fetchPosts = async (startIndex = 0) => {
        try {
            const res  = await fetch(`/api/post/getposts?userId=${currentUser._id}&startIndex=${startIndex}`);
            const data = await res.json();
            if (res.ok) {
                setUserPosts((prev) => startIndex === 0 ? data.posts : [...prev, ...data.posts]);
                setShowMore(data.posts.length >= 9);
            }
        } catch (err) {
            console.error(err.message);
        }
    };

    useEffect(() => {
        if (currentUser?.isAdmin) {
            setUserPosts([]);
            fetchPosts();
        }
    }, [currentUser._id]);

    const handleDeletePost = async () => {
        try {
            const res  = await fetch(`/api/post/deletepost/${postIdToDelete}/${currentUser._id}`, { method: 'DELETE' });
            const data = await res.json();
            if (res.ok) {
                setUserPosts((prev) => prev.filter((p) => p._id !== postIdToDelete));
                setShowModal(false);
            } else {
                console.log(data.message || 'Error al eliminar');
            }
        } catch (err) {
            console.log(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-white p-6 md:p-8 w-full">

            {/* ── Encabezado ── */}
            <div className="mb-8 pb-6 border-b border-gray-100">
                <SectionLabel label="Dashboard" />
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 mt-4">Artículos</h1>
                <p className="text-sm text-gray-400 font-light mt-1">
                    Gestión de publicaciones y revistas
                </p>
            </div>

            {currentUser?.isAdmin && userPosts.length > 0 ? (
                <>
                    <div className="border border-gray-100 overflow-x-auto">
                        <table className="w-full min-w-[700px]">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/80">
                                    {TH_COLS.map((h) => (
                                        <th
                                            key={h}
                                            className="text-left text-[9px] font-black text-gray-400 uppercase tracking-[0.25em] px-4 py-2.5 whitespace-nowrap"
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {userPosts.map((post) => (
                                    <tr
                                        key={post._id}
                                        className="border-b border-gray-50 last:border-0 hover:bg-[#B076CE]/[0.03] transition-colors"
                                    >
                                        {/* Fecha */}
                                        <td className="px-4 py-3 text-xs text-gray-400 font-light whitespace-nowrap">
                                            {new Date(post.updatedAt).toLocaleDateString('es-MX', {
                                                year: 'numeric', month: 'short', day: 'numeric',
                                            })}
                                        </td>

                                        {/* Media */}
                                        <td className="px-4 py-3">
                                            {post.pdf ? (
                                                <div className="w-16 h-10 border border-red-100 bg-red-50 flex items-center justify-center">
                                                    <span className="text-[9px] font-black text-red-400 uppercase tracking-widest">
                                                        PDF
                                                    </span>
                                                </div>
                                            ) : (
                                                <Link to={`/post/${post.slug}`}>
                                                    <img
                                                        src={post.image}
                                                        alt={post.title}
                                                        className="w-16 h-10 object-cover border border-gray-100"
                                                    />
                                                </Link>
                                            )}
                                        </td>

                                        {/* Título */}
                                        <td className="px-4 py-3 max-w-[220px]">
                                            <Link
                                                to={`/post/${post.slug}`}
                                                className="text-xs font-semibold text-gray-800 hover:text-[#B076CE] transition-colors line-clamp-2 leading-snug"
                                            >
                                                {post.title}
                                            </Link>
                                        </td>

                                        {/* Categoría */}
                                        <td className="px-4 py-3">
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">
                                                {post.category || '—'}
                                            </span>
                                        </td>

                                        {/* Tipo */}
                                        <td className="px-4 py-3">
                                            <span className={`text-[9px] font-black uppercase tracking-widest border px-2 py-0.5 whitespace-nowrap ${
                                                post.pdf
                                                    ? 'border-red-100 text-red-400'
                                                    : 'border-gray-200 text-gray-400'
                                            }`}>
                                                {post.pdf ? 'Revista' : 'Artículo'}
                                            </span>
                                        </td>

                                        {/* Eliminar */}
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => { setShowModal(true); setPostIdToDelete(post._id); }}
                                                className="text-[9px] font-black text-red-300 hover:text-red-600 uppercase tracking-[0.2em] transition-colors"
                                            >
                                                Eliminar
                                            </button>
                                        </td>

                                        {/* Editar */}
                                        <td className="px-4 py-3">
                                            <Link
                                                to={`/update-post/${post._id}`}
                                                className="text-[9px] font-black text-[#B076CE] hover:text-gray-900 uppercase tracking-[0.2em] transition-colors"
                                            >
                                                Editar
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {showMore && (
                        <button
                            onClick={() => fetchPosts(userPosts.length)}
                            className="w-full mt-0 py-3 text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] hover:text-[#B076CE] transition-colors border-t border-gray-100"
                        >
                            Mostrar más →
                        </button>
                    )}
                </>
            ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-[2px] h-8 bg-gray-100 mb-4" />
                    <p className="text-sm text-gray-300 font-light">No hay publicaciones aún</p>
                </div>
            )}

            {showModal && (
                <DeleteModal
                    message="Esta acción eliminará el artículo permanentemente. No se puede deshacer."
                    onConfirm={handleDeletePost}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    );
}
