import {
    Footer,
    FooterCopyright,
    FooterDivider,
    FooterIcon,
    FooterLink,
    FooterLinkGroup,
    FooterTitle,
} from 'flowbite-react';
import { Link } from 'react-router-dom';
import { BsTwitter, BsFacebook, BsInstagram } from 'react-icons/bs';

export default function FooterComponent() {
    return (
        <Footer container className='bg-black text-white mt-2'>
            <div className='w-full max-w-7xl mx-auto px-4 py-12'>
                {/* Contenido superior */}
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
                    {/* Logo y descripción */}
                    <div>
                        <Link to="/" className='flex items-center mb-4'>
                            <img src="/logoFooter.svg" alt="Logo" className='h-20 w-auto mr-2' />
                        </Link>
                        <p className='font-light text-white text-sm'>
                            Explora contenido legislativo, análisis político y noticias relevantes.
                        </p>
                    </div>

                    {/* Nosotros */}
                    <div>
                        <FooterTitle title='Nosotros' className='text-white' />
                        <FooterLinkGroup col>
                            <FooterLink href='https://www.imepol.com.mx/' target='_blank' rel='noopener noreferrer' className='text-[#545454] hover:text-white transition-colors duration-300'>
                                IMEPOL
                            </FooterLink>
                            <FooterLink href='/error' target='_blank' rel='noopener noreferrer' className='text-[#545454] hover:text-white transition-colors duration-300'>
                                LexIA
                            </FooterLink>
                        </FooterLinkGroup>
                    </div>

                    {/* Siguenos */}
                    <div>
                        <FooterTitle title='Síguenos' className='text-white' />
                        <FooterLinkGroup col>
                            <FooterLink href='https://x.com/Rlegislatura' target='_blank' rel='noopener noreferrer' className='text-[#545454] hover:text-white transition-colors duration-300 flex items-center gap-2'>
                                Twitter / X
                            </FooterLink>
                            <FooterLink href='https://www.facebook.com/RevistaLegislaturaMX' target='_blank' rel='noopener noreferrer' className='text-[#545454] hover:text-white transition-colors duration-300 flex items-center gap-2'>
                                Facebook
                            </FooterLink>
                            <FooterLink href='https://www.instagram.com/revistalegislatura/' target='_blank' rel='noopener noreferrer' className='text-[#545454] hover:text-white transition-colors duration-300 flex items-center gap-2'>
                                Instagram
                            </FooterLink>
                        </FooterLinkGroup>
                    </div>

                    {/* Legal */}
                    <div>
                        <FooterTitle title='Legal' className='text-white' />
                        <FooterLinkGroup col>
                            <FooterLink href='/construccion' rel='noopener noreferrer' className='text-[#545454] hover:text-white transition-colors duration-300'>
                                Política de privacidad
                            </FooterLink>
                            <FooterLink href='/construccion' rel='noopener noreferrer' className='text-[#545454] hover:text-white transition-colors duration-300'>
                                Términos & Condiciones
                            </FooterLink>
                        </FooterLinkGroup>
                    </div>
                </div>

                <FooterDivider className='my-8 border-white' />

                {/* Contenido inferior */}
                <div className='w-full flex flex-col sm:flex-row sm:items-center sm:justify-between'>
                    <FooterCopyright
                        href='https://gradustec.com/'
                        by='DESARROLLADO POR GRADUS TECHNOLOGIES'
                        year={new Date().getFullYear()}
                        className='text-[#545454] text-sm text-center sm:text-left hover:text-white transition-colors duration-300'
                    />
                    <div className='flex justify-center gap-6 mt-4 sm:mt-0'>
                        <FooterIcon href='https://x.com/Rlegislatura' target='_blank' icon={BsTwitter} className='text-[#545454] hover:text-[#1C96E8] transition-colors duration-300' />
                        <FooterIcon href='https://www.facebook.com/RevistaLegislaturaMX' target='_blank' icon={BsFacebook} className='text-[#545454] hover:text-[#395693] transition-colors duration-300' />
                        <FooterIcon href='https://www.instagram.com/revistalegislatura/' target='_blank' icon={BsInstagram} className='text-[#545454] hover:text-[#FF2834] transition-colors duration-300' />
                    </div>
                </div>
            </div>
        </Footer>
    );
}
