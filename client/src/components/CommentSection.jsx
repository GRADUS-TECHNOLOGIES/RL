import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

import Comment from './Comment';

// ── Primitivos ─────────────────────────────────────────────────────────────

const SectionLabel = ({ label }) => (
    <div className="flex items-center gap-3 mb-4">
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

// ── CommentSection ─────────────────────────────────────────────────────────

export default function CommentSection({ postId }) {
    const { currentUser } = useSelector((state) => state.user);
    const navigate = useNavigate();

    const [comment, setComment]             = useState('');
    const [commentError, setCommentError]   = useState(null);
    const [comments, setComments]           = useState([]);
    const [showModal, setShowModal]         = useState(false);
    const [commentToDelete, setCommentToDelete] = useState(null);

    const MAX = 200;

    useEffect(() => {
        const getComments = async () => {
            try {
                const res = await fetch(`/api/comment/getPostComments/${postId}`);
                if (res.ok) setComments(await res.json());
            } catch (err) {
                console.log(err.message);
            }
        };
        getComments();
    }, [postId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!comment.trim() || comment.length > MAX) return;
        try {
            const res  = await fetch('/api/comment/create', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ content: comment, postId, userId: currentUser._id }),
            });
            const data = await res.json();
            if (res.ok) {
                setComment('');
                setCommentError(null);
                setComments([data, ...comments]);
            } else if (res.status === 401) {
                navigate('/sign-in');
            } else {
                setCommentError(data.message || 'Error al publicar el comentario');
            }
        } catch (err) {
            setCommentError(err.message);
        }
    };

    const handleLike = async (commentId) => {
        if (!currentUser) { navigate('/sign-in'); return; }
        try {
            const res = await fetch(`/api/comment/likeComment/${commentId}`, {
                method: 'PUT',
                credentials: 'include',
            });
            if (res.ok) {
                const data = await res.json();
                setComments(comments.map((c) =>
                    c._id === commentId
                        ? { ...c, likes: data.likes, numberOfLikes: data.likes.length }
                        : c
                ));
            } else if (res.status === 401) {
                navigate('/sign-in');
            }
        } catch (err) {
            console.log(err.message);
        }
    };

    const handleEdit = (comment, editedContent) => {
        setComments(comments.map((c) =>
            c._id === comment._id ? { ...c, content: editedContent } : c
        ));
    };

    const handleDelete = async (commentId) => {
        setShowModal(false);
        if (!currentUser) { navigate('/sign-in'); return; }
        try {
            const res = await fetch(`/api/comment/deleteComment/${commentId}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (res.ok) {
                setComments(comments.filter((c) => c._id !== commentId));
            } else if (res.status === 401) {
                navigate('/sign-in');
            }
        } catch (err) {
            console.log(err.message);
        }
    };

    return (
        <div className="border-t border-gray-100 pt-10">

            <SectionLabel label="Comunidad" />
            <h2 className="text-2xl font-black text-gray-900 mb-6">
                {comments.length > 0
                    ? `${comments.length} comentario${comments.length !== 1 ? 's' : ''}`
                    : 'Comentarios'}
            </h2>

            {/* ── Estado de sesión ── */}
            {currentUser ? (
                <div className="flex items-center gap-2 mb-5 text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">
                    <img
                        src={currentUser.profilePicture}
                        alt=""
                        className="w-5 h-5 rounded-full object-cover border border-gray-100"
                    />
                    <Link
                        to="/dashboard?tab=profile"
                        className="hover:text-[#B076CE] transition-colors"
                    >
                        @{currentUser.username}
                    </Link>
                </div>
            ) : (
                <div className="flex items-center gap-1.5 mb-6 text-sm text-gray-500 font-light">
                    <Link to="/sign-in" className="text-[#B076CE] font-black hover:underline">
                        Inicia sesión
                    </Link>
                    <span>para comentar en esta publicación.</span>
                </div>
            )}

            {/* ── Formulario de comentario ── */}
            {currentUser && (
                <form onSubmit={handleSubmit} className="mb-8">
                    <div className="border border-gray-200 focus-within:border-[#B076CE] transition-colors">
                        <textarea
                            placeholder="Escribe tu comentario..."
                            rows={3}
                            maxLength={MAX}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full px-4 pt-3 pb-2 text-sm text-gray-800 placeholder:text-gray-300 placeholder:font-light outline-none resize-none bg-white"
                        />
                        <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100 bg-gray-50/50">
                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">
                                {MAX - comment.length} caracteres
                            </span>
                            <button
                                type="submit"
                                disabled={!comment.trim()}
                                className="px-4 py-1.5 border border-gray-900 text-[10px] font-black text-gray-900 uppercase tracking-[0.2em] hover:bg-[#B076CE] hover:border-[#B076CE] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                            >
                                Publicar
                            </button>
                        </div>
                    </div>

                    {commentError && (
                        <div className="flex items-center gap-3 mt-3 px-4 py-3 border border-red-100 bg-red-50">
                            <div className="w-[2px] h-4 bg-red-400 flex-shrink-0" />
                            <p className="text-xs text-red-500 font-light">{commentError}</p>
                        </div>
                    )}
                </form>
            )}

            {/* ── Lista de comentarios ── */}
            {comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-[2px] h-8 bg-gray-100 mb-4" />
                    <p className="text-sm text-gray-300 font-light">Sé el primero en comentar</p>
                </div>
            ) : (
                <div className="divide-y divide-gray-50">
                    {comments.map((c) => (
                        <Comment
                            key={c._id}
                            comment={c}
                            onLike={handleLike}
                            onEdit={handleEdit}
                            onDelete={(id) => {
                                setShowModal(true);
                                setCommentToDelete(id);
                            }}
                        />
                    ))}
                </div>
            )}

            {showModal && (
                <DeleteModal
                    onConfirm={() => handleDelete(commentToDelete)}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    );
}
