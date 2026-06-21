import {
    Dropdown,
    Avatar,
    DropdownHeader,
    DropdownItem,
    DropdownDivider,
} from 'flowbite-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AiOutlineSearch, AiOutlineClose, AiOutlineMenu } from 'react-icons/ai';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState, useCallback } from 'react';
import { signoutSuccess } from '../redux/user/userSlice';

// ── Datos de navegación ────────────────────────────────────────────────────

const navLinks = [
    { to: '/',        label: 'Inicio'    },
    { to: '/about',   label: 'Conócenos' },
    { to: '/purpose', label: 'Propósito' },
    { to: '/services',label: 'Servicios' },
];

// ── Dropdown de usuario ────────────────────────────────────────────────────

const UserDropdown = ({ currentUser, onSignout }) => (
    <Dropdown
        arrowIcon={false}
        inline
        label={
            <Avatar
                alt="Usuario"
                img={
                    currentUser.profilePicture ||
                    'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'
                }
                rounded
                size="sm"
                className="cursor-pointer ring-2 ring-transparent hover:ring-[#B076CE] transition-all duration-200"
            />
        }
    >
        <DropdownHeader>
            <span className="block text-sm font-bold text-gray-900">{currentUser.username}</span>
            <span className="block text-xs text-gray-500 truncate">{currentUser.email}</span>
        </DropdownHeader>
        <Link to="/dashboard?tab=profile">
            <DropdownItem>Perfil</DropdownItem>
        </Link>
        <DropdownDivider />
        <DropdownItem onClick={onSignout}>Cerrar sesión</DropdownItem>
    </Dropdown>
);

// ── Componente principal ───────────────────────────────────────────────────

export default function Header() {
    const location     = useLocation();
    const navigate     = useNavigate();
    const dispatch     = useDispatch();
    const { currentUser } = useSelector((state) => state.user);

    const [searchTerm,      setSearchTerm]      = useState('');
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [isMenuOpen,      setIsMenuOpen]      = useState(false);
    const [scrolled,        setScrolled]        = useState(false);

    // Efecto sombra en scroll
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Sincronizar searchTerm con URL
    useEffect(() => {
        const p = new URLSearchParams(location.search);
        setSearchTerm(p.get('searchTerm') || '');
    }, [location.search]);

    // Cerrar menú al cambiar ruta
    useEffect(() => {
        setIsMenuOpen(false);
        setIsSearchVisible(false);
    }, [location.pathname]);

    const handleSignout = useCallback(async () => {
        try {
            const res  = await fetch('/api/user/signout', { method: 'POST' });
            const data = await res.json();
            if (!res.ok) { console.error('Error al cerrar sesión:', data.message); return; }
            dispatch(signoutSuccess());
            navigate('/sign-in');
        } catch (err) {
            console.error('Error inesperado:', err.message);
        }
    }, [dispatch, navigate]);

    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;
        const params = new URLSearchParams(location.search);
        params.set('searchTerm', searchTerm.trim());
        navigate(`/search?${params.toString()}`);
        setIsSearchVisible(false);
        setIsMenuOpen(false);
    }, [searchTerm, location.search, navigate]);

    const isActive = (path) => location.pathname === path;

    return (
        <header
            className={`sticky top-0 z-50 bg-white transition-all duration-300 ${
                scrolled ? 'border-b border-gray-200 shadow-sm' : 'border-b border-gray-100'
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="flex items-center justify-between h-14 md:h-[60px]">

                    {/* ── Logo ── */}
                    <Link to="/" className="flex-shrink-0">
                        <img
                            src="/logoNavbar.svg"
                            alt="Revista Legislatura"
                            className="h-8 md:h-9 w-auto"
                        />
                    </Link>

                    {/* ── Navegación desktop ── */}
                    <nav className="hidden md:flex items-center h-full">
                        {navLinks.map(({ to, label }) => (
                            <Link
                                key={to}
                                to={to}
                                className={`relative h-full flex items-center px-4 text-[13px] font-semibold tracking-wide transition-colors duration-200 group ${
                                    isActive(to)
                                        ? 'text-[#B076CE]'
                                        : 'text-gray-600 hover:text-[#B076CE]'
                                }`}
                            >
                                {label}
                                {/* Indicador inferior */}
                                <span
                                    className={`absolute bottom-0 left-3 right-3 h-[2px] bg-[#B076CE] transition-all duration-200 ${
                                        isActive(to)
                                            ? 'opacity-100'
                                            : 'opacity-0 group-hover:opacity-30'
                                    }`}
                                />
                            </Link>
                        ))}
                    </nav>

                    {/* ── Acciones desktop + móvil ── */}
                    <div className="flex items-center gap-1">

                        {/* Búsqueda desktop */}
                        <div className="hidden md:flex items-center">
                            {isSearchVisible ? (
                                <form
                                    onSubmit={handleSubmit}
                                    className="flex items-center gap-2 border-b border-gray-800 pb-0.5 mr-2"
                                >
                                    <input
                                        type="text"
                                        placeholder="Buscar..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        autoFocus
                                        className="bg-transparent border-none outline-none text-[13px] text-gray-900 placeholder-gray-400 font-light w-44"
                                    />
                                    <button
                                        type="submit"
                                        aria-label="Buscar"
                                        className="text-gray-500 hover:text-[#B076CE] transition-colors"
                                    >
                                        <AiOutlineSearch size={16} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsSearchVisible(false)}
                                        aria-label="Cerrar búsqueda"
                                        className="text-gray-400 hover:text-gray-700 transition-colors"
                                    >
                                        <AiOutlineClose size={14} />
                                    </button>
                                </form>
                            ) : (
                                <button
                                    onClick={() => setIsSearchVisible(true)}
                                    aria-label="Buscar"
                                    className="p-2 text-gray-500 hover:text-[#B076CE] transition-colors"
                                >
                                    <AiOutlineSearch size={18} />
                                </button>
                            )}
                        </div>

                        {/* Usuario desktop */}
                        <div className="hidden md:flex items-center ml-1">
                            {currentUser ? (
                                <UserDropdown currentUser={currentUser} onSignout={handleSignout} />
                            ) : (
                                <Link
                                    to="/sign-in"
                                    className="px-4 py-1.5 border border-gray-900 text-gray-900 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#B076CE] hover:border-[#B076CE] hover:text-white transition-all duration-200"
                                >
                                    Ingresar
                                </Link>
                            )}
                        </div>

                        {/* Botón hamburger móvil */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
                            className="md:hidden p-2 text-gray-600 hover:text-[#B076CE] transition-colors"
                        >
                            {isMenuOpen
                                ? <AiOutlineClose size={21} />
                                : <AiOutlineMenu size={21} />
                            }
                        </button>
                    </div>
                </div>

                {/* ── Menú móvil ── */}
                {isMenuOpen && (
                    <div className="md:hidden border-t border-gray-100 py-5 space-y-5">

                        {/* Búsqueda móvil */}
                        <form
                            onSubmit={handleSubmit}
                            className="flex items-center gap-2 border-b border-gray-200 pb-2"
                        >
                            <AiOutlineSearch size={16} className="text-gray-400 flex-shrink-0" />
                            <input
                                type="text"
                                placeholder="Buscar artículos..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="flex-1 bg-transparent border-none outline-none text-[13px] text-gray-900 placeholder-gray-400 font-light"
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => setSearchTerm('')}
                                    className="text-gray-400"
                                >
                                    <AiOutlineClose size={13} />
                                </button>
                            )}
                        </form>

                        {/* Links de navegación móvil */}
                        <nav className="flex flex-col">
                            {navLinks.map(({ to, label }) => (
                                <Link
                                    key={to}
                                    to={to}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`flex items-center gap-2 py-3 text-sm font-semibold border-b border-gray-50 transition-colors ${
                                        isActive(to)
                                            ? 'text-[#B076CE]'
                                            : 'text-gray-700 hover:text-[#B076CE]'
                                    }`}
                                >
                                    {isActive(to) && (
                                        <span className="w-1 h-1 rounded-full bg-[#B076CE] flex-shrink-0" />
                                    )}
                                    {label}
                                </Link>
                            ))}
                        </nav>

                        {/* Usuario móvil */}
                        <div className="pt-1 border-t border-gray-100">
                            {currentUser ? (
                                <div className="flex flex-col gap-0">
                                    {/* Info del usuario */}
                                    <div className="flex items-center gap-3 py-3 border-b border-gray-50">
                                        <img
                                            src={currentUser.profilePicture || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'}
                                            alt="Foto de perfil"
                                            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                        />
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-gray-900 truncate">{currentUser.username}</p>
                                            <p className="text-xs text-gray-400 font-light truncate">{currentUser.email}</p>
                                        </div>
                                    </div>
                                    <Link
                                        to="/dashboard?tab=profile"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="py-3 text-sm font-semibold text-gray-700 hover:text-[#B076CE] transition-colors border-b border-gray-50"
                                    >
                                        Mi perfil
                                    </Link>
                                    {currentUser.isAdmin && (
                                        <Link
                                            to="/dashboard?tab=dash"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="py-3 text-sm font-semibold text-gray-700 hover:text-[#B076CE] transition-colors border-b border-gray-50"
                                        >
                                            Dashboard
                                        </Link>
                                    )}
                                    <button
                                        onClick={handleSignout}
                                        className="py-3 text-sm font-semibold text-left text-red-500 hover:text-red-700 transition-colors"
                                    >
                                        Cerrar sesión
                                    </button>
                                </div>
                            ) : (
                                <Link
                                    to="/sign-in"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center justify-center w-full py-3 border border-gray-900 text-gray-900 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#B076CE] hover:border-[#B076CE] hover:text-white transition-all duration-200"
                                >
                                    Ingresar
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
