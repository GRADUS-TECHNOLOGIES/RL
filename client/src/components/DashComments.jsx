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

function DeleteModal({ onConfirm, onClose }) {
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
                    <p className="text-sm text-gray-500 font-light mb-8 leading-relaxed">
                        Esta acción eliminará el comentario permanentemente. No se puede deshacer.
                    </p>
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

const TH_COLS = ['Fecha', 'Contenido', 'Likes', 'Post ID', 'User ID', 'Eliminar'];

// ── Componente principal ───────────────────────────────────────────────────

export default function DashComments() {
    const { currentUser }                         = useSelector((s) => s.user);
    const [comments, setComments]                 = useState([]);
    const [showMore, setShowMore]                 = useState(true);
    const [showModal, setShowModal]               = useState(false);
    const [commentIdToDelete, setCommentIdToDelete] = useState('');

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const res  = await fetch('/api/comment/getcomments');
                const data = await res.json();
                if (res.ok) {
                    setComments(data.comments);
                    setShowMore(data.comments.length >= 9);
                }
            } catch (err) {
                console.log(err.message);
            }
        };
        if (currentUser.isAdmin) fetchComments();
    }, [currentUser.isAdmin]);

    const handleShowMore = async () => {
        try {
            const res  = await fetch(`/api/comment/getcomments?startIndex=${comments.length}`);
            const data = await res.json();
            if (res.ok) {
                setComments((prev) => [...prev, ...data.comments]);
                setShowMore(data.comments.length >= 9);
            }
        } catch (err) {
            console.log(err.message);
        }
    };

    const handleDeleteComment = async () => {
        if (!commentIdToDelete) return;
        try {
            const res  = await fetch(`/api/comment/deleteComment/${commentIdToDelete}`, { method: 'DELETE' });
            const data = await res.json();
            if (res.ok) {
                setComments((prev) => prev.filter((c) => c._id !== commentIdToDelete));
                setShowModal(false);
                setCommentIdToDelete('');
            } else {
                console.log(data.message || 'Error al eliminar el comentario');
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
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 mt-4">Comentarios</h1>
                <p className="text-sm text-gray-400 font-light mt-1">
                    Moderación de comentarios de la comunidad
                </p>
            </div>

            {currentUser.isAdmin && comments.length > 0 ? (
                <>
                    <div className="border border-gray-100 overflow-x-auto">
                        <table className="w-full min-w-[660px]">
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
                                {comments.map((comment) => (
                                    <tr
                                        key={comment._id}
                                        className="border-b border-gray-50 last:border-0 hover:bg-[#B076CE]/[0.03] transition-colors"
                                    >
                                        {/* Fecha */}
                                        <td className="px-4 py-3 text-xs text-gray-400 font-light whitespace-nowrap">
                                            {new Date(comment.createdAt).toLocaleDateString('es-MX', {
                                                year: 'numeric', month: 'short', day: 'numeric',
                                            })}
                                        </td>

                                        {/* Contenido */}
                                        <td className="px-4 py-3 max-w-[260px]">
                                            <p className="text-xs text-gray-600 font-light line-clamp-2 leading-relaxed">
                                                {comment.content || '—'}
                                            </p>
                                        </td>

                                        {/* Likes */}
                                        <td className="px-4 py-3">
                                            <span className="text-xs font-black text-gray-700 tabular-nums">
                                                {comment.numberOfLikes ?? 0}
                                            </span>
                                        </td>

                                        {/* Post ID (abreviado) */}
                                        <td className="px-4 py-3">
                                            <span className="font-mono text-[10px] text-gray-300 tracking-tight">
                                                ···{comment.postId?.slice(-8) ?? '—'}
                                            </span>
                                        </td>

                                        {/* User ID (abreviado) */}
                                        <td className="px-4 py-3">
                                            <span className="font-mono text-[10px] text-gray-300 tracking-tight">
                                                ···{comment.userId?.slice(-8) ?? '—'}
                                            </span>
                                        </td>

                                        {/* Eliminar */}
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => {
                                                    setShowModal(true);
                                                    setCommentIdToDelete(comment._id);
                                                }}
                                                className="text-[9px] font-black text-red-300 hover:text-red-600 uppercase tracking-[0.2em] transition-colors"
                                            >
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {showMore && (
                        <button
                            onClick={handleShowMore}
                            className="w-full py-3 text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] hover:text-[#B076CE] transition-colors border-t border-gray-100"
                        >
                            Mostrar más →
                        </button>
                    )}
                </>
            ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-[2px] h-8 bg-gray-100 mb-4" />
                    <p className="text-sm text-gray-300 font-light">No hay comentarios aún</p>
                </div>
            )}

            {showModal && (
                <DeleteModal
                    onConfirm={handleDeleteComment}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    );
}
