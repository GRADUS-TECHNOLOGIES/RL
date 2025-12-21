import { Link } from 'react-router-dom';
import { BsTwitter, BsFacebook, BsInstagram, BsLinkedin } from 'react-icons/bs';

export default function FooterComponent() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className='bg-gradient-to-br from-black via-gray-900 to-black text-white mt-16'>
            <div className='w-full max-w-7xl mx-auto px-4 md:px-8 py-16'>
                {/* Contenido superior - Grid mejorado */}
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-12'>
                    {/* Logo y descripción */}
                    <div className='lg:col-span-1'>
                        <Link to="/" className='flex items-center mb-6 group'>
                            <img 
                                src="/logoFooter.svg" 
                                alt="Revista Legislatura" 
                                className='h-16 w-auto transition-transform duration-300 group-hover:scale-110' 
                            />
                        </Link>
                        <p className='text-gray-400 text-sm leading-relaxed'>
                            Plataforma especializada en contenido legislativo, análisis político y noticias relevantes de México.
                        </p>
                        {/* Redes sociales móviles */}
                        <div className='flex gap-4 mt-6 lg:hidden'>
                            <a 
                                href='https://x.com/Rlegislatura' 
                                target='_blank' 
                                rel='noopener noreferrer'
                                className='text-gray-400 hover:text-[#B076CE] transition-all duration-300 text-xl'
                            >
                                <BsTwitter />
                            </a>
                            <a 
                                href='https://www.facebook.com/RevistaLegislaturaMX' 
                                target='_blank' 
                                rel='noopener noreferrer'
                                className='text-gray-400 hover:text-[#B076CE] transition-all duration-300 text-xl'
                            >
                                <BsFacebook />
                            </a>
                            <a 
                                href='https://www.instagram.com/revistalegislatura/' 
                                target='_blank' 
                                rel='noopener noreferrer'
                                className='text-gray-400 hover:text-[#B076CE] transition-all duration-300 text-xl'
                            >
                                <BsInstagram />
                            </a>
                        </div>
                    </div>

                    {/* Navegación - Nosotros */}
                    <div>
                        <h3 className='text-white font-bold text-lg mb-6 flex items-center gap-2'>
                            <span className='w-1 h-6 bg-gradient-to-b from-[#B076CE] to-purple-600 rounded-full'></span>
                            Nosotros
                        </h3>
                        <ul className='space-y-3'>
                            <li>
                                <a 
                                    href='https://www.imepol.com.mx/' 
                                    target='_blank' 
                                    rel='noopener noreferrer' 
                                    className='text-gray-400 hover:text-[#B076CE] transition-all duration-300 flex items-center gap-2 group'
                                >
                                    <span className='group-hover:translate-x-1 transition-transform duration-300'>→</span>
                                    <span>IMEPOL</span>
                                </a>
                            </li>
                            <li>
                                <a 
                                    href='/construccion' 
                                    rel='noopener noreferrer' 
                                    className='text-gray-400 hover:text-[#B076CE] transition-all duration-300 flex items-center gap-2 group'
                                >
                                    <span className='group-hover:translate-x-1 transition-transform duration-300'>→</span>
                                    <span>LexIA</span>
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Navegación - Síguenos */}
                    <div>
                        <h3 className='text-white font-bold text-lg mb-6 flex items-center gap-2'>
                            <span className='w-1 h-6 bg-gradient-to-b from-[#B076CE] to-purple-600 rounded-full'></span>
                            Síguenos
                        </h3>
                        <ul className='space-y-3'>
                            <li>
                                <a 
                                    href='https://x.com/Rlegislatura' 
                                    target='_blank' 
                                    rel='noopener noreferrer' 
                                    className='text-gray-400 hover:text-[#1C96E8] transition-all duration-300 flex items-center gap-2 group'
                                >
                                    <BsTwitter className='group-hover:scale-125 transition-transform duration-300' />
                                    <span>Twitter / X</span>
                                </a>
                            </li>
                            <li>
                                <a 
                                    href='https://www.facebook.com/RevistaLegislaturaMX' 
                                    target='_blank' 
                                    rel='noopener noreferrer' 
                                    className='text-gray-400 hover:text-[#395693] transition-all duration-300 flex items-center gap-2 group'
                                >
                                    <BsFacebook className='group-hover:scale-125 transition-transform duration-300' />
                                    <span>Facebook</span>
                                </a>
                            </li>
                            <li>
                                <a 
                                    href='https://www.instagram.com/revistalegislatura/' 
                                    target='_blank' 
                                    rel='noopener noreferrer' 
                                    className='text-gray-400 hover:text-[#FF2834] transition-all duration-300 flex items-center gap-2 group'
                                >
                                    <BsInstagram className='group-hover:scale-125 transition-transform duration-300' />
                                    <span>Instagram</span>
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Navegación - Legal */}
                    <div>
                        <h3 className='text-white font-bold text-lg mb-6 flex items-center gap-2'>
                            <span className='w-1 h-6 bg-gradient-to-b from-[#B076CE] to-purple-600 rounded-full'></span>
                            Legal
                        </h3>
                        <ul className='space-y-3'>
                            <li>
                                <a 
                                    href='/construccion' 
                                    rel='noopener noreferrer' 
                                    className='text-gray-400 hover:text-[#B076CE] transition-all duration-300 flex items-center gap-2 group'
                                >
                                    <span className='group-hover:translate-x-1 transition-transform duration-300'>→</span>
                                    <span>Política de privacidad</span>
                                </a>
                            </li>
                            <li>
                                <a 
                                    href='/construccion' 
                                    rel='noopener noreferrer' 
                                    className='text-gray-400 hover:text-[#B076CE] transition-all duration-300 flex items-center gap-2 group'
                                >
                                    <span className='group-hover:translate-x-1 transition-transform duration-300'>→</span>
                                    <span>Términos & Condiciones</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Divisor */}
                <div className='h-px bg-gradient-to-r from-transparent via-[#B076CE] to-transparent my-12'></div>

                {/* Contenido inferior */}
                <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-8'>
                    {/* Copyright */}
                    <div className='text-center md:text-left'>
                        <p className='text-gray-500 text-sm'>
                            © {currentYear} <span className='text-[#B076CE] font-semibold'>Revista Legislatura</span>
                        </p>
                        <p className='text-gray-600 text-xs mt-2'>
                            Desarrollado por <a href='https://gradustec.com/' target='_blank' rel='noopener noreferrer' className='text-[#B076CE] hover:text-white transition-colors duration-300 font-semibold'>GRADUS TECHNOLOGIES</a>
                        </p>
                    </div>

                    {/* Redes sociales desktop */}
                    <div className='hidden lg:flex items-center justify-center gap-6'>
                        <a 
                            href='https://x.com/Rlegislatura' 
                            target='_blank' 
                            rel='noopener noreferrer'
                            className='w-10 h-10 rounded-full bg-gray-800 hover:bg-[#B076CE] flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 group'
                        >
                            <BsTwitter className='group-hover:scale-125 transition-transform duration-300' />
                        </a>
                        <a 
                            href='https://www.facebook.com/RevistaLegislaturaMX' 
                            target='_blank' 
                            rel='noopener noreferrer'
                            className='w-10 h-10 rounded-full bg-gray-800 hover:bg-[#B076CE] flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 group'
                        >
                            <BsFacebook className='group-hover:scale-125 transition-transform duration-300' />
                        </a>
                        <a 
                            href='https://www.instagram.com/revistalegislatura/' 
                            target='_blank' 
                            rel='noopener noreferrer'
                            className='w-10 h-10 rounded-full bg-gray-800 hover:bg-[#B076CE] flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 group'
                        >
                            <BsInstagram className='group-hover:scale-125 transition-transform duration-300' />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
