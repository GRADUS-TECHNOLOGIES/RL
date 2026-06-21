import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { FaCheck, FaTimes } from 'react-icons/fa';

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
                        Esta acción eliminará al usuario permanentemente. No se puede deshacer.
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

const TH_COLS = ['Fecha', 'Avatar', 'Usuario', 'Correo', 'Admin', 'Rol', 'Eliminar'];

// ── Componente principal ───────────────────────────────────────────────────

export default function DashUsers() {
    const { currentUser }                   = useSelector((s) => s.user);
    const [users, setUsers]                 = useState([]);
    const [showMore, setShowMore]           = useState(true);
    const [showModal, setShowModal]         = useState(false);
    const [userIdToDelete, setUserIdToDelete] = useState('');

    const fetchUsers = async (startIndex = 0) => {
        try {
            const res  = await fetch(`/api/user/getusers?startIndex=${startIndex}`);
            const data = await res.json();
            if (res.ok) {
                setUsers((prev) => startIndex === 0 ? data.users : [...prev, ...data.users]);
                setShowMore(data.users.length >= 9);
            }
        } catch (err) {
            console.error('Error al cargar usuarios:', err.message);
        }
    };

    useEffect(() => {
        if (currentUser?.isAdmin) fetchUsers();
    }, [currentUser?.isAdmin]);

    const handleToggleAdmin = async (userId, currentStatus) => {
        try {
            const res  = await fetch(`/api/user/updateUserRole/${userId}`, {
                method:  'PUT',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ isAdmin: !currentStatus }),
            });
            const data = await res.json();
            if (res.ok && data.user) {
                setUsers((prev) => prev.map((u) => u._id === userId ? data.user : u));
            } else {
                console.error(data.message || 'No se pudo actualizar el rol');
            }
        } catch (err) {
            console.error('Error al cambiar rol:', err.message);
        }
    };

    const handleDeleteUser = async () => {
        try {
            const res  = await fetch(`/api/user/delete/${userIdToDelete}`, { method: 'DELETE' });
            const data = await res.json();
            if (res.ok) {
                setUsers((prev) => prev.filter((u) => u._id !== userIdToDelete));
                setShowModal(false);
                setUserIdToDelete('');
            } else {
                console.error(data.message || 'Error al eliminar usuario');
            }
        } catch (err) {
            console.error('Error al eliminar usuario:', err.message);
        }
    };

    return (
        <div className="min-h-screen bg-white p-6 md:p-8 w-full">

            {/* ── Encabezado ── */}
            <div className="mb-8 pb-6 border-b border-gray-100">
                <SectionLabel label="Dashboard" />
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 mt-4">Usuarios</h1>
                <p className="text-sm text-gray-400 font-light mt-1">
                    Gestión de cuentas y roles de acceso
                </p>
            </div>

            {currentUser?.isAdmin && users.length > 0 ? (
                <>
                    <div className="border border-gray-100 overflow-x-auto">
                        <table className="w-full min-w-[680px]">
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
                                {users.map((user) => (
                                    <tr
                                        key={user._id}
                                        className="border-b border-gray-50 last:border-0 hover:bg-[#B076CE]/[0.03] transition-colors"
                                    >
                                        {/* Fecha */}
                                        <td className="px-4 py-3 text-xs text-gray-400 font-light whitespace-nowrap">
                                            {new Date(user.createdAt).toLocaleDateString('es-MX', {
                                                year: 'numeric', month: 'short', day: 'numeric',
                                            })}
                                        </td>

                                        {/* Avatar */}
                                        <td className="px-4 py-3">
                                            <img
                                                src={user.profilePicture}
                                                alt={user.username}
                                                className="w-8 h-8 rounded-full object-cover border border-gray-100"
                                            />
                                        </td>

                                        {/* Usuario */}
                                        <td className="px-4 py-3 text-xs font-semibold text-gray-800 whitespace-nowrap">
                                            {user.username}
                                        </td>

                                        {/* Correo */}
                                        <td className="px-4 py-3 text-xs text-gray-400 font-light max-w-[180px] truncate">
                                            {user.email}
                                        </td>

                                        {/* Admin */}
                                        <td className="px-4 py-3">
                                            {user.isAdmin ? (
                                                <span className="flex items-center gap-1.5 text-[9px] font-black text-[#B076CE] uppercase tracking-widest">
                                                    <FaCheck className="w-2.5 h-2.5" /> Sí
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 text-[9px] font-black text-gray-300 uppercase tracking-widest">
                                                    <FaTimes className="w-2.5 h-2.5" /> No
                                                </span>
                                            )}
                                        </td>

                                        {/* Toggle rol */}
                                        <td className="px-4 py-3">
                                            <label className="inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only"
                                                    checked={user.isAdmin}
                                                    onChange={() => handleToggleAdmin(user._id, user.isAdmin)}
                                                />
                                                <div className={`w-9 h-5 flex items-center p-0.5 transition-colors duration-300 ${
                                                    user.isAdmin ? 'bg-[#B076CE]' : 'bg-gray-200'
                                                }`}>
                                                    <div className={`bg-white w-4 h-4 shadow-sm transform transition-transform duration-300 ${
                                                        user.isAdmin ? 'translate-x-4' : 'translate-x-0'
                                                    }`} />
                                                </div>
                                            </label>
                                        </td>

                                        {/* Eliminar */}
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => { setShowModal(true); setUserIdToDelete(user._id); }}
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
                            onClick={() => fetchUsers(users.length)}
                            className="w-full py-3 text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] hover:text-[#B076CE] transition-colors border-t border-gray-100"
                        >
                            Mostrar más →
                        </button>
                    )}
                </>
            ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-[2px] h-8 bg-gray-100 mb-4" />
                    <p className="text-sm text-gray-300 font-light">No hay usuarios aún</p>
                </div>
            )}

            {showModal && (
                <DeleteModal
                    onConfirm={handleDeleteUser}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    );
}
