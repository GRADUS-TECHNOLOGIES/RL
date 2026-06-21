import { useEffect } from 'react';
import CallToAction from '../components/CallToAction';

// ── Primitivo compartido de sección ───────────────────────────────────────

const SectionLabel = ({ label }) => (
    <div className="flex items-center gap-3 mb-5">
        <div className="w-[2px] h-4 bg-[#B076CE] flex-shrink-0" />
        <span className="text-[10px] font-black text-[#B076CE] uppercase tracking-[0.3em]">{label}</span>
        <div className="flex-1 h-px bg-gray-200" />
    </div>
);

// ── Datos ─────────────────────────────────────────────────────────────────

const purposes = [
    'Informar con pluralidad y objetividad a la ciudadanía interesada en las actividades legislativas.',
    'Brindar a legisladores federales y locales un panorama actualizado sobre las acciones de otras instituciones públicas.',
];

const certifications = [
    'Registro ante el Instituto Nacional del Derecho de Autor (INDAUTOR).',
    'Certificado de Licitud de Contenido y Título, expedido por la Secretaría de Gobernación.',
    'Certificación N° 358 como revista institucional, otorgada por la Dirección de Medios Impresos (Subsecretaría de Normatividad de Medios, SEGOB).',
];

// ── Componente principal ───────────────────────────────────────────────────

export default function About() {
    useEffect(() => {
        document.title = 'Conócenos - Revista Legislatura';
    }, []);

    return (
        <main className="min-h-screen bg-white">

            {/* ── Cabecera de página ── */}
            <div className="border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
                    <SectionLabel label="Conócenos" />
                    <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-black text-gray-900 leading-tight max-w-3xl">
                        La voz institucional<br />
                        del Poder <span className="text-[#B076CE]">Legislativo</span>
                    </h1>
                </div>
            </div>

            {/* ── Contenido principal ── */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-14">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16 items-start">

                    {/* Imagen + tarjeta de datos — 2/5 */}
                    <div className="lg:col-span-2 lg:sticky lg:top-24 space-y-5">
                        <div className="overflow-hidden">
                            <img
                                src="/bckgnd/infoBckgnd.svg"
                                alt="Revista Legislatura — Publicación institucional"
                                className="w-full h-auto object-cover"
                            />
                        </div>
                        <div className="p-5 border border-gray-100 bg-gray-50/50">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-[2px] h-3 bg-[#B076CE]" />
                                <span className="text-[9px] font-black text-[#B076CE] uppercase tracking-[0.3em]">
                                    Sobre la publicación
                                </span>
                            </div>
                            <p className="text-[13px] font-light text-gray-600 leading-relaxed">
                                Publicación mensual de carácter institucional. Neutral, plural y objetiva desde su fundación.
                            </p>
                        </div>
                    </div>

                    {/* Columna de texto — 3/5 */}
                    <div className="lg:col-span-3 space-y-10">

                        {/* Apertura con acento */}
                        <div className="border-l-2 border-[#B076CE] pl-5">
                            <p className="text-lg md:text-xl font-semibold text-gray-900 leading-relaxed">
                                La Revista Legislatura es una publicación mensual de carácter institucional con un doble propósito:
                            </p>
                        </div>

                        {/* Lista numerada estilo editorial */}
                        <div className="space-y-5">
                            {purposes.map((item, i) => (
                                <div key={i} className="flex gap-4 pb-5 border-b border-gray-50 last:border-0">
                                    <span className="text-3xl font-black text-gray-100 leading-none flex-shrink-0 tabular-nums select-none pt-0.5">
                                        {String(i + 1).padStart(2, '0')}
                                    </span>
                                    <p className="text-base text-gray-700 font-light leading-relaxed">{item}</p>
                                </div>
                            ))}
                        </div>

                        {/* Párrafo cuerpo */}
                        <p className="text-base text-gray-700 font-light leading-relaxed">
                            Como medio de comunicación, Legislatura mantiene una posición neutral, ajena a cualquier
                            partidismo, y se consolida como el testigo autorizado del quehacer legislativo en México.
                        </p>

                        {/* Certificaciones */}
                        <div>
                            <SectionLabel label="Certificaciones y registros" />
                            <div className="space-y-0">
                                {certifications.map((cert, i) => (
                                    <div
                                        key={i}
                                        className="flex gap-4 py-4 border-b border-gray-50 last:border-0 group hover:bg-gray-50/50 transition-colors px-1"
                                    >
                                        <span className="text-[10px] font-black text-[#B076CE] flex-shrink-0 tabular-nums mt-0.5 w-5">
                                            {String(i + 1).padStart(2, '0')}
                                        </span>
                                        <p className="text-sm text-gray-600 font-light leading-relaxed">{cert}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="pt-4 border-t border-gray-100">
                            <CallToAction />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
