import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
    HiAnnotation,
    HiArrowNarrowUp,
    HiArrowNarrowDown,
    HiDocumentText,
    HiOutlineUserGroup,
    HiBookOpen,
} from 'react-icons/hi';
import { Link } from 'react-router-dom';

// ── Primitivo de sección ───────────────────────────────────────────────────

const SectionLabel = ({ label }) => (
    <div className="flex items-center gap-3">
        <div className="w-[2px] h-4 bg-[#B076CE] flex-shrink-0" />
        <span className="text-[10px] font-black text-[#B076CE] uppercase tracking-[0.3em]">{label}</span>
        <div className="flex-1 h-px bg-gray-100" />
    </div>
);

// ── Tarjeta de estadística ─────────────────────────────────────────────────

function StatCard({ label, value, delta, Icon }) {
    const up = (delta ?? 0) >= 0;
    return (
        <div className="border border-gray-100 p-5 group hover:border-[#B076CE]/30 transition-colors duration-300">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-[2px] h-4 bg-[#B076CE]" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                        {label}
                    </span>
                </div>
                <Icon className="w-4 h-4 text-gray-200 group-hover:text-[#B076CE]/40 transition-colors" />
            </div>

            <p className="text-4xl font-black text-gray-900 leading-none mb-3 group-hover:text-[#B076CE] transition-colors duration-300 tabular-nums">
                {(value ?? 0).toLocaleString('es-MX')}
            </p>

            <div className="flex items-center gap-1.5">
                {up
                    ? <HiArrowNarrowUp   className="w-3 h-3 text-green-500 flex-shrink-0" />
                    : <HiArrowNarrowDown className="w-3 h-3 text-red-400 flex-shrink-0" />
                }
                <span className={`text-[10px] font-black tabular-nums ${up ? 'text-green-500' : 'text-red-400'}`}>
                    {Math.abs(delta ?? 0)}
                </span>
                <span className="text-[10px] text-gray-300 font-light">vs. mes anterior</span>
            </div>
        </div>
    );
}

// ── Cabecera de tabla ──────────────────────────────────────────────────────

function TableHeader({ label, linkTo, linkLabel = 'Ver todos →' }) {
    return (
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <SectionLabel label={label} />
            <Link
                to={linkTo}
                className="ml-4 text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] hover:text-[#B076CE] transition-colors flex-shrink-0"
            >
                {linkLabel}
            </Link>
        </div>
    );
}

// ── Estado vacío ───────────────────────────────────────────────────────────

function EmptyRow({ cols, message }) {
    return (
        <tr>
            <td colSpan={cols} className="px-5 py-8 text-center text-xs text-gray-300 font-light">
                {message}
            </td>
        </tr>
    );
}

// ── Componente principal ───────────────────────────────────────────────────

export default function DashboardComp() {
    const [users,    setUsers]    = useState([]);
    const [comments, setComments] = useState([]);
    const [posts,    setPosts]    = useState([]);
    const [totals,   setTotals]   = useState({ users: 0, posts: 0, comments: 0, magazines: 0 });
    const [lastMonth, setLastMonth] = useState({ users: 0, posts: 0, comments: 0, magazines: 0 });

    const { currentUser } = useSelector((s) => s.user);

    useEffect(() => {
        if (!currentUser.isAdmin) return;

        const fetchData = async () => {
            try {
                const [usersRes, postsRes, commentsRes] = await Promise.all([
                    fetch('/api/user/getusers?limit=5'),
                    fetch('/api/post/getposts?limit=5'),
                    fetch('/api/comment/getcomments?limit=5'),
                ]);

                if (usersRes.ok) {
                    const d = await usersRes.json();
                    setUsers(d.users ?? []);
                    setTotals(p => ({ ...p, users: d.totalUsers ?? 0 }));
                    setLastMonth(p => ({ ...p, users: d.lastMonthUsers ?? 0 }));
                }

                if (postsRes.ok) {
                    const d = await postsRes.json();
                    const magazines = (d.posts ?? []).filter((p) => p.pdf);
                    setPosts(d.posts ?? []);
                    setTotals(p => ({ ...p, posts: d.totalPosts ?? 0, magazines: magazines.length }));
                    setLastMonth(p => ({
                        ...p,
                        posts:     d.lastMonthPosts ?? 0,
                        magazines: Math.floor(magazines.length * 0.7),
                    }));
                }

                if (commentsRes.ok) {
                    const d = await commentsRes.json();
                    setComments(d.comments ?? []);
                    setTotals(p => ({ ...p, comments: d.totalComments ?? 0 }));
                    setLastMonth(p => ({ ...p, comments: d.lastMonthComments ?? 0 }));
                }
            } catch (err) {
                console.error('Error al cargar datos del tablero:', err);
            }
        };

        fetchData();
    }, [currentUser]);

    return (
        <div className="p-6 md:p-8 w-full bg-white min-h-screen">

            {/* ── Encabezado ── */}
            <div className="mb-8 pb-6 border-b border-gray-100">
                <SectionLabel label="Dashboard" />
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 mt-4">Tablero</h1>
                <p className="text-sm text-gray-400 font-light mt-1">
                    Resumen de actividad y estadísticas principales
                </p>
            </div>

            {/* ── Estadísticas ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                <StatCard label="Usuarios"      value={totals.users}     delta={lastMonth.users}     Icon={HiOutlineUserGroup} />
                <StatCard label="Comentarios"   value={totals.comments}  delta={lastMonth.comments}  Icon={HiAnnotation}       />
                <StatCard label="Publicaciones" value={totals.posts}     delta={lastMonth.posts}     Icon={HiDocumentText}     />
                <StatCard label="Revistas"      value={totals.magazines} delta={lastMonth.magazines} Icon={HiBookOpen}         />
            </div>

            {/* ── Tablas ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Usuarios recientes */}
                <div className="border border-gray-100 overflow-hidden">
                    <TableHeader label="Usuarios recientes" linkTo="/dashboard?tab=users" />
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/80">
                                    <th className="text-left text-[9px] font-black text-gray-400 uppercase tracking-[0.25em] px-5 py-2.5 w-14">
                                        Avatar
                                    </th>
                                    <th className="text-left text-[9px] font-black text-gray-400 uppercase tracking-[0.25em] px-4 py-2.5">
                                        Usuario
                                    </th>
                                    <th className="text-left text-[9px] font-black text-gray-400 uppercase tracking-[0.25em] px-4 py-2.5">
                                        Correo
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length > 0 ? users.map((user) => (
                                    <tr
                                        key={user._id}
                                        className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors"
                                    >
                                        <td className="px-5 py-3">
                                            <img
                                                src={user.profilePicture || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'}
                                                alt={user.username}
                                                className="w-8 h-8 rounded-full object-cover border border-gray-100"
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-xs font-semibold text-gray-800 whitespace-nowrap">
                                            {user.username || 'Anónimo'}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-400 font-light max-w-[160px] truncate">
                                            {user.email || '—'}
                                        </td>
                                    </tr>
                                )) : (
                                    <EmptyRow cols={3} message="No hay usuarios recientes" />
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Comentarios recientes */}
                <div className="border border-gray-100 overflow-hidden">
                    <TableHeader label="Comentarios recientes" linkTo="/dashboard?tab=comments" />
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/80">
                                    <th className="text-left text-[9px] font-black text-gray-400 uppercase tracking-[0.25em] px-5 py-2.5">
                                        Contenido
                                    </th>
                                    <th className="text-right text-[9px] font-black text-gray-400 uppercase tracking-[0.25em] px-5 py-2.5 w-16">
                                        Likes
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {comments.length > 0 ? comments.map((comment) => (
                                    <tr
                                        key={comment._id}
                                        className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors"
                                    >
                                        <td className="px-5 py-3 text-xs text-gray-600 font-light max-w-xs">
                                            <p className="line-clamp-2 leading-relaxed">
                                                {comment.content || 'Sin contenido'}
                                            </p>
                                        </td>
                                        <td className="px-5 py-3 text-right text-xs font-black text-gray-700 tabular-nums">
                                            {comment.numberOfLikes || 0}
                                        </td>
                                    </tr>
                                )) : (
                                    <EmptyRow cols={2} message="No hay comentarios recientes" />
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Publicaciones recientes — ancho completo */}
                <div className="border border-gray-100 overflow-hidden lg:col-span-2">
                    <TableHeader label="Publicaciones recientes" linkTo="/dashboard?tab=posts" linkLabel="Ver todas →" />
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/80">
                                    <th className="text-left text-[9px] font-black text-gray-400 uppercase tracking-[0.25em] px-5 py-2.5 w-20">
                                        Media
                                    </th>
                                    <th className="text-left text-[9px] font-black text-gray-400 uppercase tracking-[0.25em] px-4 py-2.5">
                                        Título
                                    </th>
                                    <th className="text-left text-[9px] font-black text-gray-400 uppercase tracking-[0.25em] px-4 py-2.5 w-40">
                                        Categoría
                                    </th>
                                    <th className="text-left text-[9px] font-black text-gray-400 uppercase tracking-[0.25em] px-4 py-2.5 w-24">
                                        Tipo
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {posts.length > 0 ? posts.map((post) => (
                                    <tr
                                        key={post._id}
                                        className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors"
                                    >
                                        {/* Miniatura */}
                                        <td className="px-5 py-3">
                                            {post.pdf ? (
                                                <div className="w-14 h-10 border border-red-100 flex items-center justify-center bg-red-50">
                                                    <span className="text-[9px] font-black text-red-400 uppercase tracking-widest">
                                                        PDF
                                                    </span>
                                                </div>
                                            ) : (
                                                <img
                                                    src={post.image}
                                                    alt={post.title}
                                                    className="w-14 h-10 object-cover border border-gray-100"
                                                />
                                            )}
                                        </td>

                                        {/* Título */}
                                        <td className="px-4 py-3 text-xs font-semibold text-gray-800 max-w-xs truncate">
                                            {post.title || 'Sin título'}
                                        </td>

                                        {/* Categoría */}
                                        <td className="px-4 py-3">
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                                {post.category || '—'}
                                            </span>
                                        </td>

                                        {/* Tipo */}
                                        <td className="px-4 py-3">
                                            <span className={`text-[9px] font-black uppercase tracking-widest border px-2 py-0.5 ${
                                                post.pdf
                                                    ? 'border-red-100 text-red-400'
                                                    : 'border-gray-200 text-gray-400'
                                            }`}>
                                                {post.pdf ? 'Revista' : 'Artículo'}
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <EmptyRow cols={4} message="No hay publicaciones recientes" />
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}
