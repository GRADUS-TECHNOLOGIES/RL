import {
    Button,
    TextInput,
    Dropdown,
    Avatar,
    DropdownHeader,
    DropdownItem,
    DropdownDivider,
} from 'flowbite-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AiOutlineSearch, AiOutlineMail, AiOutlineClose, AiOutlineMenu } from 'react-icons/ai';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState, useCallback } from 'react';
import { signoutSuccess } from '../redux/user/userSlice';

// ✅ Componente: Dropdown de usuario
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
                className='cursor-pointer hover:ring-2 hover:ring-[#B076CE] transition-all'
            />
        }
    >
        <DropdownHeader>
            <span className="block text-sm font-semibold">{currentUser.username}</span>
            <span className="block text-xs text-gray-500 truncate">{currentUser.email}</span>
        </DropdownHeader>
        <Link to="/dashboard?tab=profile">
            <DropdownItem>Perfil</DropdownItem>
        </Link>
        <DropdownDivider />
        <DropdownItem onClick={onSignout}>Salir</DropdownItem>
    </Dropdown>
);

// ✅ Enlaces de navegación principales
const navLinks = [
    { to: '/', label: 'Inicio' },
    { to: '/about', label: 'Conócenos' },
    { to: '/purpose', label: 'Propósito' },
    { to: '/services', label: 'Servicios' },
];

export default function Header() {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);

    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // 🔄 Scroll effect
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // 🔍 Sync search term from URL
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const term = urlParams.get('searchTerm') || '';
        setSearchTerm(term);
    }, [location.search]);

    // 🚪 Sign out handler
    const handleSignout = useCallback(async () => {
        try {
            const res = await fetch('/api/user/signout', { method: 'POST' });
            const data = await res.json();

            if (!res.ok) {
                console.error('Error al cerrar sesión:', data.message);
                return;
            }

            dispatch(signoutSuccess());
            navigate('/sign-in');
            setIsMenuOpen(false);
        } catch (error) {
            console.error('Error inesperado:', error.message);
        }
    }, [dispatch, navigate]);

    // 🔎 Submit search
    const handleSubmit = useCallback(
        (e) => {
            e.preventDefault();
            if (!searchTerm.trim()) return;

            const urlParams = new URLSearchParams(location.search);
            urlParams.set('searchTerm', searchTerm.trim());
            navigate(`/search?${urlParams.toString()}`);
            setIsSearchVisible(false);
            setIsMenuOpen(false);
        },
        [searchTerm, location.search, navigate]
    );

    return (
        <header
            className={`sticky top-0 z-50 transition-all duration-300 ${
                scrolled
                    ? 'bg-white shadow-lg'
                    : 'bg-white border-b-2 border-gray-100'
            }`}
        >
            <div className='max-w-7xl mx-auto px-4 md:px-8'>
                <div className='flex items-center justify-between py-4'>
                    {/* ✅ IZQUIERDA: Logo */}
                    <Link to="/" className='flex-shrink-0 flex items-center gap-3 group'>
                        <img 
                            src="/logoNavbar.svg" 
                            alt="Revista Legislatura" 
                            className='h-10 w-auto transition-transform duration-300 group-hover:scale-110' 
                        />
                    </Link>

                    {/* ✅ CENTRO: Navegación principal (solo desktop) */}
                    <nav className='hidden md:flex items-center gap-1'>
                        {navLinks.map(({ to, label }) => (
                            <Link key={to} to={to}>
                                <button
                                    className={`px-4 py-2 rounded-lg transition-all duration-300 font-medium ${
                                        location.pathname === to
                                            ? 'text-white bg-[#B076CE]'
                                            : 'text-gray-700 hover:text-[#B076CE] hover:bg-[#B076CE]/10'
                                    }`}
                                >
                                    {label}
                                </button>
                            </Link>
                        ))}
                    </nav>

                    {/* ✅ DERECHA: Búsqueda + Usuario + Menú */}
                    <div className='flex items-center gap-2 md:gap-4'>
                        {/* Búsqueda */}
                        {!isSearchVisible ? (
                            <button
                                onClick={() => setIsSearchVisible(true)}
                                className='p-2 rounded-lg text-gray-700 hover:bg-[#B076CE]/10 hover:text-[#B076CE] transition-all'
                                aria-label="Abrir búsqueda"
                            >
                                <AiOutlineSearch size={22} />
                            </button>
                        ) : (
                            <div className='hidden md:flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1'>
                                <input
                                    type="text"
                                    placeholder="Buscar..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
                                    className='bg-transparent border-none outline-none text-gray-700 placeholder-gray-500 w-48'
                                    autoFocus
                                />
                                <button
                                    onClick={handleSubmit}
                                    className='p-1 text-[#B076CE] hover:text-purple-700 transition-all'
                                    aria-label="Buscar"
                                >
                                    <AiOutlineSearch size={20} />
                                </button>
                                <button
                                    onClick={() => setIsSearchVisible(false)}
                                    className='p-1 text-gray-500 hover:text-gray-700 transition-all'
                                    aria-label="Cerrar búsqueda"
                                >
                                    <AiOutlineClose size={18} />
                                </button>
                            </div>
                        )}

                        {/* Usuario - Desktop */}
                        <div className='hidden sm:block'>
                            {currentUser ? (
                                <UserDropdown currentUser={currentUser} onSignout={handleSignout} />
                            ) : (
                                <Link to="/sign-in">
                                    <Button className='bg-[#B076CE] hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-lg transition-all'>
                                        Ingresar
                                    </Button>
                                </Link>
                            )}
                        </div>

                        {/* Botón menú móvil */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className='md:hidden p-2 rounded-lg text-gray-700 hover:bg-[#B076CE]/10 transition-all'
                            aria-label="Menú"
                        >
                            {isMenuOpen ? <AiOutlineClose size={24} /> : <AiOutlineMenu size={24} />}
                        </button>
                    </div>
                </div>

                {/* ✅ MENÚ MÓVIL */}
                {isMenuOpen && (
                    <div className='md:hidden pb-4 border-t border-gray-100 pt-4 space-y-4 animate-in fade-in slide-in-from-top-2'>
                        {/* Búsqueda móvil */}
                        <form onSubmit={handleSubmit} className='flex gap-2'>
                            <input
                                type="text"
                                placeholder="Buscar..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className='flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#B076CE] focus:ring-2 focus:ring-[#B076CE]/20'
                            />
                            <button
                                type="submit"
                                className='p-2 bg-[#B076CE] text-white rounded-lg hover:bg-purple-700 transition-all'
                            >
                                <AiOutlineSearch size={20} />
                            </button>
                        </form>

                        {/* Enlaces de navegación */}
                        <nav className='flex flex-col gap-2'>
                            {navLinks.map(({ to, label }) => (
                                <Link
                                    key={to}
                                    to={to}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`px-4 py-3 rounded-lg transition-all font-medium ${
                                        location.pathname === to
                                            ? 'text-white bg-[#B076CE]'
                                            : 'text-gray-700 hover:bg-[#B076CE]/10 hover:text-[#B076CE]'
                                    }`}
                                >
                                    {label}
                                </Link>
                            ))}
                        </nav>

                        {/* Botones de acción móvil */}
                        <div className='flex flex-col gap-2 pt-2'>
                            <Link to="/construccion" className='w-full'>
                                <Button className='w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-all flex items-center justify-center gap-2'>
                                    <AiOutlineMail size={18} />
                                    Contacto
                                </Button>
                            </Link>
                            <Link to="/construccion" className='w-full'>
                                <Button className='w-full bg-[#B076CE] hover:bg-purple-700 text-white font-semibold rounded-lg transition-all'>
                                    Anúnciate
                                </Button>
                            </Link>
                        </div>

                        {/* Usuario móvil */}
                        <div className='pt-2 border-t border-gray-100'>
                            {currentUser ? (
                                <div className='flex flex-col gap-2'>
                                    <Link to="/dashboard?tab=profile" className='w-full'>
                                        <Button className='w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-all'>
                                            👤 Mi Perfil
                                        </Button>
                                    </Link>
                                    {currentUser.isAdmin && (
                                        <Link to="/dashboard?tab=dash" className='w-full'>
                                            <Button className='w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-all'>
                                                📊 Dashboard
                                            </Button>
                                        </Link>
                                    )}
                                    <button
                                        onClick={handleSignout}
                                        className='w-full px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded-lg transition-all'
                                    >
                                        🚪 Salir
                                    </button>
                                </div>
                            ) : (
                                <Link to="/sign-in" className='w-full'>
                                    <Button className='w-full bg-[#B076CE] hover:bg-purple-700 text-white font-semibold rounded-lg transition-all'>
                                        Ingresar
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}