import moment from 'moment';
import { useState, useEffect } from 'react';
import { FaThumbsUp } from 'react-icons/fa';
import { useSelector } from 'react-redux';

export default function Comment({ comment, onLike, onEdit, onDelete }) {
    const [user, setUser]                   = useState({});
    const [isEditing, setIsEditing]         = useState(false);
    const [editedContent, setEditedContent] = useState(comment.content);
    const { currentUser } = useSelector((state) => state.user);

    useEffect(() => {
        const getUser = async () => {
            try {
                const res  = await fetch(`/api/user/${comment.userId}`);
                const data = await res.json();
                if (res.ok) setUser(data);
            } catch (err) {
                console.log(err.message);
            }
        };
        getUser();
    }, [comment]);

    const handleSave = async () => {
        try {
            const res = await fetch(`/api/comment/editComment/${comment._id}`, {
                method:  'PUT',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ content: editedContent }),
            });
            if (res.ok) {
                setIsEditing(false);
                onEdit(comment, editedContent);
            }
        } catch (err) {
            console.log(err.message);
        }
    };

    const isLiked   = currentUser && comment.likes?.includes(currentUser._id);
    const canModify = currentUser && (currentUser._id === comment.userId || currentUser.isAdmin);

    return (
        <div className="flex gap-3 py-4">
            <img
                src={user.profilePicture}
                alt={user.username}
                className="w-8 h-8 rounded-full object-cover border border-gray-100 flex-shrink-0 mt-0.5"
            />
            <div className="flex-1 min-w-0">

                {/* Header */}
                <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-black text-gray-700 uppercase tracking-[0.1em] truncate">
                        @{user.username || 'usuario'}
                    </span>
                    <span className="text-[9px] text-gray-300 font-light flex-shrink-0">
                        {moment(comment.createdAt).fromNow()}
                    </span>
                </div>

                {/* Edición */}
                {isEditing ? (
                    <div className="border border-gray-200 focus-within:border-[#B076CE] transition-colors">
                        <textarea
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                            rows={3}
                            maxLength={200}
                            className="w-full px-3 pt-2.5 pb-1.5 text-sm text-gray-800 outline-none resize-none bg-white"
                        />
                        <div className="flex justify-end gap-2 px-3 py-2 border-t border-gray-100 bg-gray-50/50">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-3 py-1 border border-gray-200 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] hover:border-gray-900 hover:text-gray-900 transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-3 py-1 border border-gray-900 text-[10px] font-black text-gray-900 uppercase tracking-[0.2em] hover:bg-[#B076CE] hover:border-[#B076CE] hover:text-white transition-all"
                            >
                                Guardar
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <p className="text-sm text-gray-600 font-light leading-relaxed mb-2">
                            {comment.content}
                        </p>

                        {/* Acciones */}
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => onLike(comment._id)}
                                className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.15em] transition-colors ${
                                    isLiked
                                        ? 'text-[#B076CE]'
                                        : 'text-gray-300 hover:text-[#B076CE]'
                                }`}
                            >
                                <FaThumbsUp className="w-3 h-3" />
                                {comment.numberOfLikes > 0 && (
                                    <span>{comment.numberOfLikes}</span>
                                )}
                            </button>

                            {canModify && (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsEditing(true);
                                            setEditedContent(comment.content);
                                        }}
                                        className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] hover:text-gray-700 transition-colors"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onDelete(comment._id)}
                                        className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] hover:text-red-500 transition-colors"
                                    >
                                        Eliminar
                                    </button>
                                </>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
