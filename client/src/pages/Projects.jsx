import { useEffect } from 'react';
import CallToAction from '../components/CallToAction';

// ── Primitivo de sección ───────────────────────────────────────────────────

const SectionLabel = ({ label }) => (
    <div className="flex items-center gap-3 mb-5">
        <div className="w-[2px] h-4 bg-[#B076CE] flex-shrink-0" />
        <span className="text-[10px] font-black text-[#B076CE] uppercase tracking-[0.3em]">{label}</span>
        <div className="flex-1 h-px bg-gray-200" />
    </div>
);

// ── Datos ─────────────────────────────────────────────────────────────────

const services = [
    {
        num: '01',
        title: 'Equipo especializado',
        content:
            'Contamos con un equipo multidisciplinario de profesionales con amplia experiencia en comunicación legislativa, derecho y periodismo político.',
    },
    {
        num: '02',
        title: 'Excelencia editorial',
        content:
            'Ofrecemos rigurosidad en la edición, con procesos de revisión exhaustivos que aseguran precisión y veracidad en la información.',
    },
    {
        num: '03',
        title: 'Contenido estratégico',
        content:
            'Desarrollamos análisis de actualidad que facilitan la comprensión de procesos legislativos, tendencias políticas y jurisprudencia relevante.',
    },
    {
        num: '04',
        title: 'Alcance institucional',
        content:
            'Somos el medio de referencia para legisladores, funcionarios públicos, académicos y profesionales del derecho en México.',
    },
];

const benefits = [
    'Difusión garantizada entre tomadores de decisiones',
    'Contenidos con enfoque técnico pero accesible',
    'Credibilidad institucional reconocida',
    'Posicionamiento como referente en temas legislativos',
    'Conexión con audiencias clave en el sector público',
];

// ── Componente principal ───────────────────────────────────────────────────

export default function Projects() {
    useEffect(() => {
        document.title = 'Servicios - Revista Legislatura';
    }, []);

    return (
        <main className="min-h-screen bg-white">

            {/* ── Cabecera de página ── */}
            <div className="border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
                    <SectionLabel label="Servicios" />
                    <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-black text-gray-900 leading-tight max-w-3xl">
                        Difusión institucional<br />
                        de alto <span className="text-[#B076CE]">impacto</span>
                    </h1>
                    <p className="mt-4 text-base text-gray-500 font-light max-w-xl leading-relaxed">
                        Descubra por qué Revista Legislatura es el medio ideal para su comunicación
                        estratégica en el ámbito legislativo y político.
                    </p>
                </div>
            </div>

            {/* ── Por qué elegirnos ── */}
            <section className="max-w-7xl mx-auto px-4 md:px-8 py-14">
                <SectionLabel label="¿Por qué elegirnos?" />
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-10 max-w-2xl leading-tight">
                    Por qué elegir Revista Legislatura como su medio de difusión
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {services.map(({ num, title, content }) => (
                        <div
                            key={num}
                            className="group flex gap-5 p-6 border border-gray-100 hover:border-[#B076CE]/40 hover:shadow-sm transition-all duration-300"
                        >
                            {/* Número editorial */}
                            <span className="text-4xl font-black text-gray-100 group-hover:text-[#B076CE]/20 transition-colors leading-none flex-shrink-0 tabular-nums select-none pt-1">
                                {num}
                            </span>
                            <div>
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide mb-2 group-hover:text-[#B076CE] transition-colors">
                                    {title}
                                </h3>
                                <p className="text-sm text-gray-600 font-light leading-relaxed">{content}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Beneficios + imagen ── */}
            <section className="bg-gray-50/60 border-y border-gray-100 py-14">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

                        {/* Lista de beneficios */}
                        <div>
                            <SectionLabel label="Beneficios clave" />
                            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-8 leading-tight">
                                Beneficios para su institución
                            </h2>
                            <div className="space-y-0">
                                {benefits.map((benefit, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-0 group cursor-default"
                                    >
                                        <span className="text-[10px] font-black text-[#B076CE] tabular-nums flex-shrink-0 w-5">
                                            {String(i + 1).padStart(2, '0')}
                                        </span>
                                        <p className="text-sm text-gray-600 font-light group-hover:text-gray-900 transition-colors leading-relaxed">
                                            {benefit}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Imagen */}
                        <div className="overflow-hidden">
                            <img
                                src="/bckgnd/srvcBckgnd.svg"
                                alt="Servicios de difusión institucional"
                                className="w-full h-auto object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Call to Action ── */}
            <section className="max-w-7xl mx-auto px-4 md:px-8 py-14">
                <CallToAction />
            </section>
        </main>
    );
}
