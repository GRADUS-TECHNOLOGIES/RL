import { Button, Navbar, TextInput, NavbarToggle, NavbarCollapse, NavbarLink, Dropdown, Avatar, DropdownHeader, DropdownItem, DropdownDivider } from 'flowbite-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AiOutlineSearch } from 'react-icons/ai';
import { useSelector, useDispatch } from 'react-redux';

import { signoutSuccess } from '../redux/user/userSlice';
import { useEffect, useState } from 'react';

export default function Header() {
    const path = useLocation().pathname;
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { currentUser } = useSelector(state => state.user);
    const [searchTerm, setSearchTerm] = useState('');
    const [scrolled, setScrolled] = useState(false);

    // Detectar scroll
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const searchTermFromUrl = urlParams.get('searchTerm');
        if (searchTermFromUrl) {
            setSearchTerm(searchTermFromUrl);
        }
    }, [location.search]);

    const handleSignout = async () => {
        try {
            const res = await fetch('/api/user/signout', {
                method: 'POST',
            });

            const data = await res.json();

            if (!res.ok) {
                console.log(data.message);
            } else {
                dispatch(signoutSuccess());
            }
        } catch (error) {
            console.log(error.message);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const urlParams = new URLSearchParams(location.search);
        urlParams.set('searchTerm', searchTerm);
        const searchQuery = urlParams.toString();
        navigate(`/search?${searchQuery}`);
    };

    return (
        // Navbar de la aplicación
        <Navbar
            className={`sticky top-0 z-50 border-b-2 transition-all duration-300 ${scrolled ? 'bg-black text-white' : 'bg-[#b076ce] text-white'
                }`}
        >
            {/* Logo con transición */}
            <Link to="/" className='flex items-center gap-2 self-center'>
                <img
                    src={scrolled ? "/logoFooter.svg" : "/logoNavbar.svg"}
                    alt="RL Logo"
                    className='h-15 w-auto transition-all duration-300'
                />
            </Link>

            {/* Sección de búsqueda */}
            <form onSubmit={handleSubmit}>
                <TextInput
                    type="text"
                    placeholder='Buscar...'
                    rightIcon={AiOutlineSearch}
                    className='hidden lg:inline'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </form>

            <div className='flex items-center gap-2 md:order-2'>
                {currentUser ? (
                    <Dropdown
                        arrowIcon={false}
                        inline
                        label={
                            <Avatar
                                alt='user'
                                img={currentUser.profilePicture || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'}
                                rounded
                            />
                        }
                    >
                        <DropdownHeader>
                            <span className='block text-sm'>@{currentUser.username}</span>
                            <span className='block text-sm font-medium truncate'>{currentUser.email}</span>
                        </DropdownHeader>
                        <Link to={'/dashboard?tab=profile'}>
                            <DropdownItem>Perfil</DropdownItem>
                        </Link>
                        <DropdownDivider />
                        <DropdownItem onClick={handleSignout}>Salir</DropdownItem>
                    </Dropdown>
                ) : (
                    /* Botón de registro */
                    <Link to="/sign-in">
                        <Button className='bg-white text-[#b076ce] hover:bg-black hover:text-white transition-all dark:bg-[#b076ce] dark:text-white dark:hover:bg-white dark:hover:text-[#b076ce]'>
                            Ingresar
                        </Button>
                    </Link>
                )
                }

                {/* Botón para abrir el menú en dispositivos móviles */}
                <NavbarToggle />
            </div>

            {/* Menú de navegación */}
            <NavbarCollapse>
                {/* Formulario de búsqueda en dispositivos móviles */}
                <form onSubmit={handleSubmit} className="lg:hidden mb-4">
                    <TextInput
                        type="text"
                        placeholder='Buscar...'
                        rightIcon={AiOutlineSearch}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-1 bg-black text-white"
                    />
                </form>
                {/* Enlaces de navegación */}
                <NavbarLink active={path === '/'} as={'div'}>
                    <Link
                        to="/"
                        className={`${path === '/' ? 'text-white' : 'text-gray-300'} hover:text-white`}
                    >
                        Inicio
                    </Link>
                </NavbarLink>
                <NavbarLink active={path === '/about'} as={'div'}>
                    <Link
                        to="/about"
                        className={`${path === '/about' ? 'text-white' : 'text-gray-300'
                            } hover:text-white`}
                    >
                        Conócenos
                    </Link>
                </NavbarLink>
                <NavbarLink active={path === '/services'} as={'div'}>
                    <Link
                        to="/services"
                        className={`${path === '/services' ? 'text-white' : 'text-gray-300'
                            } hover:text-white`}
                    >
                        Servicios
                    </Link>
                </NavbarLink>
                <NavbarLink active={path === '/purpose'} as={'div'}>
                    <Link
                        to="/purpose"
                        className={`${path === '/purpose' ? 'text-white' : 'text-gray-300'
                            } hover:text-white`}
                    >
                        Propósito
                    </Link>
                </NavbarLink>
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