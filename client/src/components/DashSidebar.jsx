import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    HiUser, HiArrowSmRight, HiDocumentText,
    HiOutlineUserGroup, HiAnnotation, HiChartPie,
} from 'react-icons/hi';
import { signoutSuccess } from '../redux/user/userSlice';
import { useDispatch, useSelector } from 'react-redux';

// ── Definición de ítems de navegación ─────────────────────────────────────

const NAV_ITEMS = [
    { tab: 'dash',     Icon: HiChartPie,         label: 'Tablero',     adminOnly: true  },
    { tab: 'profile',  Icon: HiUser,              label: 'Perfil',      adminOnly: false },
    { tab: 'posts',    Icon: HiDocumentText,      label: 'Artículos',   adminOnly: true  },
    { tab: 'users',    Icon: HiOutlineUserGroup,  label: 'Usuarios',    adminOnly: true  },
    { tab: 'comments', Icon: HiAnnotation,        label: 'Comentarios', adminOnly: true  },
];

// ── Componente ─────────────────────────────────────────────────────────────

export default function DashSidebar() {
    const location                = useLocation();
    const dispatch                = useDispatch();
    const { currentUser }         = useSelector((s) => s.user);
    const [tab, setTab]           = useState('');

    useEffect(() => {
        const params     = new URLSearchParams(location.search);
        const tabFromUrl = params.get('tab');
        if (tabFromUrl) setTab(tabFromUrl);
    }, [location.search]);

    const handleSignout = async () => {
        try {
            const res  = await fetch('/api/user/signout', { method: 'POST' });
            const data = await res.json();
            if (res.ok) dispatch(signoutSuccess());
            else console.log(data.message);
        } catch (err) {
            console.log(err.message);
        }
    };

    const visibleItems = NAV_ITEMS.filter(
        ({ adminOnly }) => !adminOnly || currentUser.isAdmin
    );

    return (
        <aside className="bg-white border-b md:border-b-0 md:border-r border-gray-100 flex flex-col md:min-h-screen">

            {/* ── Info del usuario ── */}
            <div className="px-5 py-5 border-b border-gray-100">
                {/* Doble línea editorial */}
                <div className="space-y-[2px] mb-5">
                    <div className="h-[2px] bg-gray-900" />
                    <div className="h-[1px] bg-[#B076CE]" />
                </div>

                <div className="flex items-center gap-3">
                    <img
                        src={currentUser.profilePicture}
                        alt={currentUser.username}
                        className="w-9 h-9 rounded-full object-cover border border-gray-100 flex-shrink-0"
                    />
                    <div className="min-w-0">
                        <p className="text-[11px] font-black text-gray-900 uppercase tracking-wide truncate leading-tight">
                            {currentUser.username}
                        </p>
                        <span className={`text-[9px] font-black uppercase tracking-widest ${
                            currentUser.isAdmin ? 'text-[#B076CE]' : 'text-gray-400'
                        }`}>
                            {currentUser.isAdmin ? 'Administrador' : 'Usuario'}
                        </span>
                    </div>
                </div>
            </div>

            {/* ── Navegación ── */}
            <nav className="flex-1 px-3 py-4">
                <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em] px-3 mb-2">
                    Navegación
                </p>

                <div className="space-y-0.5">
                    {visibleItems.map(({ tab: itemTab, Icon, label }) => {
                        const isActive = tab === itemTab;
                        return (
                            <Link
                                key={itemTab}
                                to={`/dashboard?tab=${itemTab}`}
                                className={`relative flex items-center gap-3 px-3 py-2.5 text-[10px] font-black uppercase tracking-wide transition-all duration-150 group ${
                                    isActive
                                        ? 'text-[#B076CE] bg-[#B076CE]/5'
                                        : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                            >
                                {/* Acento lateral izquierdo */}
                                <div className={`absolute left-0 top-0 bottom-0 w-[2px] transition-all duration-150 ${
                                    isActive
                                        ? 'bg-[#B076CE]'
                                        : 'bg-transparent group-hover:bg-gray-200'
                                }`} />
                                <Icon className="w-4 h-4 flex-shrink-0" />
                                {label}
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* ── Cerrar sesión ── */}
            <div className="border-t border-gray-100 px-3 py-3">
                <button
                    onClick={handleSignout}
                    className="relative w-full flex items-center gap-3 px-3 py-2.5 text-[10px] font-black uppercase tracking-wide text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-150 group"
                >
                    <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-transparent group-hover:bg-red-300 transition-all duration-150" />
                    <HiArrowSmRight className="w-4 h-4 flex-shrink-0" />
                    Cerrar sesión
                </button>
            </div>
        </aside>
    );
}
