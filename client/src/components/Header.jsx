import {
    Button,
    Navbar,
    TextInput,
    NavbarToggle,
    NavbarCollapse,
    Dropdown,
    Avatar,
    DropdownHeader,
    DropdownItem,
    DropdownDivider,
} from 'flowbite-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AiOutlineSearch, AiOutlineMail } from 'react-icons/ai';
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
            />
        }
    >
        <DropdownHeader>
            <span className="block text-sm">@{currentUser.username}</span>
            <span className="block text-sm font-medium truncate">{currentUser.email}</span>
        </DropdownHeader>
        <Link to="/dashboard?tab=profile">
            <DropdownItem>Perfil</DropdownItem>
        </Link>
        <DropdownDivider />
        <DropdownItem onClick={onSignout}>Salir</DropdownItem>
    </Dropdown>
);

// ✅ Componente: Botones de acción (reutilizable en desktop y mobile)
const ActionButtons = ({ baseButtonClass, isMobile = false }) => (
    <>
        <Link to={'/construccion'}>
            <Button
                className={`${baseButtonClass} ${isMobile ? 'w-full justify-start px-4 py-2' : 'p-2'}`}
                aria-label="Contacto"
            >
                <AiOutlineMail size={isMobile ? 20 : 18} className={isMobile ? 'mr-3' : ''} />
                {isMobile && 'Contacto'}
            </Button>
        </Link>

        <Link to={'/construccion'}>
            <Button
                className={`${baseButtonClass} ${isMobile ? 'w-full justify-start px-4 py-2 mt-1' : ''}`}
                aria-label="Anúnciate"
            >
                {isMobile ? 'ANUNCIATE' : 'ANUNCIATE'}
            </Button>
        </Link>

        <Link to={'/'}>
            <Button
                className={`${baseButtonClass} ${isMobile ? 'w-full justify-start px-4 py-2 mt-1' : ''}`}
                aria-label="Suscríbete"
            >
                {isMobile ? 'INICIO' : 'INICIO'}
            </Button>
        </Link>
    </>
);

export default function Header() {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);

    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false); // Controla apertura del menú móvil

    // 🔄 Scroll effect
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
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
        },
        [searchTerm, location.search, navigate]
    );

    // 🎨 Estilos dinámicos
    const navbarBgClass = scrolled ? 'bg-white' : 'bg-white';
    const baseButtonIn =
        'bg-white text-[#b076ce] border-2 border-[#b076ce] hover:bg-[#b076ce] hover:text-white transition-all dark:bg-[#b076ce] dark:text-white dark:hover:bg-white dark:hover:text-[#b076ce] font-medium rounded-md';
    const baseButtonClass =
        'bg-[#b076ce] text-white hover:bg-black hover:text-white transition-all dark:bg-[#b076ce] dark:text-white dark:hover:bg-black dark:hover:text-white font-medium rounded-md';

    return (
        <Navbar
            className={`sticky top-0 z-50 border-b-2 border-black dark:bg-white transition-all duration-300 ${navbarBgClass} text-white`}
            aria-label="Navegación principal"
        >
            {/* ✅ IZQUIERDA: Botón Ingresar o UserDropdown */}
            <div className="flex items-center">
                {currentUser ? (
                    <UserDropdown currentUser={currentUser} onSignout={handleSignout} />
                ) : (
                    <Link to="/sign-in">
                        <Button className={baseButtonIn} aria-label="Iniciar sesión">
                            Ingresar
                        </Button>
                    </Link>
                )}
            </div>

            {/* ✅ CENTRO: Lupa que expande búsqueda */}
            <div className="flex-1 flex justify-center relative">
                {!isSearchVisible ? (
                    <button
                        type="button"
                        onClick={() => setIsSearchVisible(true)}
                        className="p-2 rounded-full text-black hover:bg-black/10 transition-colors"
                        aria-label="Abrir búsqueda"
                    >
                        <AiOutlineSearch size={24} />
                    </button>
                ) : (
                    <form onSubmit={handleSubmit} className="flex items-center max-w-md w-full">
                        <TextInput
                            type="text"
                            placeholder="Buscar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            aria-label="Buscar en el sitio"
                            className="w-full"
                            autoFocus
                        />
                        <Button type="submit" className="ml-2 p-2" color="alternative">
                            <AiOutlineSearch size={24} />
                        </Button>
                        <button
                            type="button"
                            onClick={() => setIsSearchVisible(false)}
                            className="ml-2 p-2 text-gray-300 hover:text-black transition-colors"
                            aria-label="Cancelar búsqueda"
                        >
                            ✕
                        </button>
                    </form>
                )}
            </div>

            {/* ✅ DERECHA (solo en desktop): Botones de acción */}
            <div className="hidden md:flex items-center gap-2">
                <ActionButtons baseButtonClass={baseButtonClass} />
                {/* Toggle solo visible en móvil, pero lo dejamos oculto en desktop */}
                <NavbarToggle aria-label="Alternar menú de navegación" className="hidden" />
            </div>

            {/* ✅ Toggle visible solo en móvil */}
            <div className="flex md:hidden items-center">
                <NavbarToggle
                    aria-label="Alternar menú de navegación"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                />
            </div>

            {/* ✅ MENÚ DESPLEGABLE (para móvil) */}
            <NavbarCollapse>
                {/* Búsqueda móvil (opcional, puedes personalizarlo) */}
                <div className="p-4 border-b border-gray-700 md:hidden">
                    <form onSubmit={handleSubmit}>
                        <TextInput
                            type="text"
                            placeholder="Buscar..."
                            rightIcon={AiOutlineSearch}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            aria-label="Buscar en el sitio"
                            className="w-full p-2 bg-black text-white"
                        />
                    </form>
                </div>

                {/* Enlaces de navegación (comentados, pero puedes activarlos) */}
                <ul className="flex flex-col p-4 space-y-2 md:hidden">
                    {[
                        { to: '/', label: 'Inicio' },
                        { to: '/about', label: 'Conócenos' },
                        { to: '/services', label: 'Servicios' },
                        { to: '/purpose', label: 'Propósito' },
                    ].map(({ to, label }) => (
                        <li key={to}>
                            <Link
                                to={to}
                                className={`block px-3 py-2 rounded-md transition-colors ${location.pathname === to
                                    ? 'text-white font-medium bg-gray-800'
                                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                                    }`}
                                aria-current={location.pathname === to ? 'page' : undefined}
                            >
                                {label}
                            </Link>
                        </li>
                    ))}
                </ul>


                {/* ✅ BOTONES DE ACCIÓN EN MÓVIL */}
                <div className="p-4 pt-2 md:hidden border-t border-gray-700">
                    <ActionButtons baseButtonClass={baseButtonClass} isMobile={true} />
                </div>

                {/* Opción de cerrar sesión en móvil (si está logueado) */}
                {currentUser && (
                    <div className="p-4 pt-0 md:hidden">
                        <button
                            onClick={handleSignout}
                            className="block w-full text-left px-4 py-2 text-red-400 hover:bg-gray-800 rounded-md"
                            aria-label="Cerrar sesión"
                        >
                            Salir
                        </button>
                    </div>
                )}
            </NavbarCollapse>
        </Navbar>
    );
}

/*
* Es necesario que en <NavabarLink> se le pase el atributo 'as' con el valor 'div' para que no de error al compilar,
* ya que el componente NavbarLink espera un elemento HTML como hijo y no un componente de React.
*
* En este caso, como estamos usando React Router, el componente Link es un componente de React y no un elemento HTML.
*/