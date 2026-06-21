import { Link } from 'react-router-dom';
import { BsTwitter, BsFacebook, BsInstagram } from 'react-icons/bs';

// ── Primitivos del footer ──────────────────────────────────────────────────

const FooterSection = ({ title, children }) => (
    <div>
        <div className="flex items-center gap-2.5 mb-5">
            <div className="w-[2px] h-4 bg-[#B076CE] flex-shrink-0" />
            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">
                {title}
            </h3>
        </div>
        {children}
    </div>
);

const FooterLink = ({ href, to, external, children }) => {
    const cls =
        'flex items-center gap-2 py-1.5 text-[13px] font-light text-gray-500 hover:text-white transition-colors duration-200 group';
    const inner = (
        <>
            <span className="text-[#B076CE] opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[11px] leading-none">
                →
            </span>
            {children}
        </>
    );

    if (to) return <Link to={to} className={cls}>{inner}</Link>;
    return (
        <a
            href={href}
            target={external ? '_blank' : undefined}
            rel={external ? 'noopener noreferrer' : undefined}
            className={cls}
        >
            {inner}
        </a>
    );
};

const SocialIcon = ({ href, Icon, label }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        className="w-8 h-8 flex items-center justify-center border border-white/10 text-gray-500 hover:border-[#B076CE] hover:text-[#B076CE] transition-all duration-200"
    >
        <Icon size={13} />
    </a>
);

// ── Datos estáticos ────────────────────────────────────────────────────────

const socials = [
    { href: 'https://x.com/Rlegislatura',                   Icon: BsTwitter,   label: 'Twitter / X' },
    { href: 'https://www.facebook.com/RevistaLegislaturaMX', Icon: BsFacebook,  label: 'Facebook'    },
    { href: 'https://www.instagram.com/revistalegislatura/', Icon: BsInstagram, label: 'Instagram'   },
];

// ── Componente principal ───────────────────────────────────────────────────

export default function FooterComponent() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-950 text-white">
            {/* Línea superior de acento */}
            <div className="h-[2px] bg-gradient-to-r from-transparent via-[#B076CE] to-transparent" />

            <div className="max-w-7xl mx-auto px-4 md:px-8 py-14">

                {/* ── Columnas de contenido ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-12">

                    {/* Logo + descripción */}
                    <div className="lg:col-span-1">
                        <Link to="/" className="inline-block mb-5">
                            <img
                                src="/logoFooter.svg"
                                alt="Revista Legislatura"
                                className="h-14 w-auto opacity-80 hover:opacity-100 transition-opacity duration-200"
                            />
                        </Link>
                        <p className="text-gray-500 text-[13px] font-light leading-relaxed mb-6 max-w-xs">
                            Plataforma especializada en contenido legislativo, análisis político y noticias relevantes de México.
                        </p>
                        {/* Redes sociales — solo visible en móvil/tablet */}
                        <div className="flex gap-2 lg:hidden">
                            {socials.map((s) => (
                                <SocialIcon key={s.label} {...s} />
                            ))}
                        </div>
                    </div>

                    {/* Nosotros */}
                    <FooterSection title="Nosotros">
                        <ul>
                            <li><FooterLink href="https://www.imepol.com.mx/" external>IMEPOL</FooterLink></li>
                            <li><FooterLink to="/about">Acerca de</FooterLink></li>
                            <li><FooterLink to="/purpose">Propósito</FooterLink></li>
                            <li><FooterLink to="/services">Servicios</FooterLink></li>
                        </ul>
                    </FooterSection>

                    {/* Síguenos */}
                    <FooterSection title="Síguenos">
                        <ul>
                            {socials.map(({ href, Icon, label }) => (
                                <li key={label}>
                                    <a
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 py-1.5 text-[13px] font-light text-gray-500 hover:text-white transition-colors duration-200 group"
                                    >
                                        <Icon
                                            size={13}
                                            className="flex-shrink-0 group-hover:text-[#B076CE] transition-colors duration-200"
                                        />
                                        {label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </FooterSection>

                    {/* Legal */}
                    <FooterSection title="Legal">
                        <ul>
                            <li><FooterLink to="/construccion">Política de privacidad</FooterLink></li>
                            <li><FooterLink to="/construccion">Términos y condiciones</FooterLink></li>
                        </ul>
                    </FooterSection>
                </div>

                {/* ── Separador ── */}
                <div className="h-px bg-white/5 mb-8" />

                {/* ── Pie de página ── */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">

                    {/* Copyright */}
                    <div>
                        <p className="text-gray-600 text-[12px] font-light">
                            © {currentYear}{' '}
                            <span className="text-[#B076CE] font-semibold">Revista Legislatura</span>
                            {' '}— Todos los derechos reservados.
                        </p>
                        <p className="text-gray-700 text-[11px] font-light mt-1">
                            Desarrollado por{' '}
                            <a
                                href="https://gradustec.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-500 hover:text-[#B076CE] transition-colors duration-200 font-medium"
                            >
                                GRADUS TECHNOLOGIES
                            </a>
                        </p>
                    </div>

                    {/* Redes sociales — solo visible en desktop */}
                    <div className="hidden lg:flex items-center gap-2">
                        {socials.map((s) => (
                            <SocialIcon key={s.label} {...s} />
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
