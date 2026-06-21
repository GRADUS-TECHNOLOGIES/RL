import { useEffect } from 'react';

// ── Primitivo de sección ───────────────────────────────────────────────────

const SectionLabel = ({ label }) => (
    <div className="flex items-center gap-3 mb-5">
        <div className="w-[2px] h-4 bg-[#B076CE] flex-shrink-0" />
        <span className="text-[10px] font-black text-[#B076CE] uppercase tracking-[0.3em]">{label}</span>
        <div className="flex-1 h-px bg-gray-200" />
    </div>
);

// ── Contenido ─────────────────────────────────────────────────────────────

const pillars = [
    { num: '01', label: 'Objetividad',      desc: 'Información sin influencias partidistas' },
    { num: '02', label: 'Pluralidad',        desc: 'Diversidad de perspectivas y voces'      },
    { num: '03', label: 'Especialización',   desc: 'Contenido técnico presentado con claridad' },
];

const body = [
    `El derecho a la información, en especial la que se refiere al ejercicio de las tareas gubernamentales, es sin duda una de las más importantes acciones que acercarán a la sociedad mexicana a la plenitud democrática.`,
    `La aparición de Legislatura responde a este propósito, ya que se reconoce que en particular esta insuficiencia se manifiesta de manera relevante en el quehacer del Poder Legislativo, mismo que cumple con un papel esencial para la vida política, económica y social de México, aunque la perspectiva social que se tiene al respecto, además de limitada, podría decirse que es distorsionada, en buena medida a causa de un deficiente nivel de información sobre los procesos internos, la complejidad con que se llega a acuerdos en ambas cámaras federales, el deterioro de la política y la especialización propia de los trabajos legislativos.`,
    `La aspiración de Legislatura es múltiple en cuanto a los sectores a los que se dirige, pues por un lado se trata de ser un medio objetivo y ajeno a toda clase de partidismos que dé testimonio constante de las actividades propias de las cámaras que componen el Congreso de la Unión y, por otro, mediante un estilo sencillo y conciso, busca informar a los grandes sectores sociales sobre las funciones esenciales de ambas cámaras legislativas, su composición interna, así como su vinculación con los otros Poderes de la Unión, las entidades federativas y las distintas organizaciones sociales.`,
    `Así, se pretende llegar tanto a los grupos de estudiosos y especialistas de las tareas legislativas, como a amplios sectores sociales, los cuales son, sin duda, los principales interesados en conocer los productos finales de la actividad legislativa.`,
];

// ── Componente principal ───────────────────────────────────────────────────

export default function Purpose() {
    useEffect(() => {
        document.title = 'Propósito - Revista Legislatura';
    }, []);

    return (
        <main className="min-h-screen bg-white">

            {/* ── Cabecera de página ── */}
            <div className="border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
                    <SectionLabel label="Propósito" />
                    <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-black text-gray-900 leading-tight max-w-3xl">
                        El derecho a la información<br />
                        como pilar de la{' '}
                        <span className="text-[#B076CE]">democracia</span>
                    </h1>
                </div>
            </div>

            {/* ── Contenido principal ── */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-14">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16 items-start">

                    {/* Sidebar — 2/5 */}
                    <aside className="lg:col-span-2 lg:sticky lg:top-24 space-y-6">

                        <div className="overflow-hidden">
                            <img
                                src="/bckgnd/srvcBckgnd.svg"
                                alt="Propósito de la Revista Legislatura"
                                className="w-full h-auto object-cover"
                            />
                        </div>

                        {/* Pull quote */}
                        <div className="border-l-4 border-[#B076CE] pl-5 py-1">
                            <p className="text-base md:text-lg font-black text-gray-900 leading-snug italic">
                                "El testigo autorizado del quehacer legislativo en México."
                            </p>
                        </div>

                        {/* Pilares editoriales */}
                        <div>
                            <SectionLabel label="Pilares editoriales" />
                            <div className="space-y-0">
                                {pillars.map(({ num, label, desc }) => (
                                    <div
                                        key={num}
                                        className="flex gap-4 py-3.5 border-b border-gray-50 last:border-0"
                                    >
                                        <span className="text-[10px] font-black text-[#B076CE] flex-shrink-0 tabular-nums mt-0.5 w-5">
                                            {num}
                                        </span>
                                        <div>
                                            <p className="text-[11px] font-black text-gray-900 uppercase tracking-wider">
                                                {label}
                                            </p>
                                            <p className="text-[11px] text-gray-400 font-light mt-0.5">{desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* Artículo — 3/5 */}
                    <article className="lg:col-span-3 space-y-7">
                        {/* Primer párrafo destacado */}
                        <p className="text-lg md:text-xl text-gray-800 font-light leading-relaxed border-l-2 border-[#B076CE] pl-5">
                            {body[0]}
                        </p>

                        {/* Párrafos restantes */}
                        {body.slice(1).map((p, i) => (
                            <p key={i} className="text-base text-gray-700 font-light leading-relaxed">
                                {p}
                            </p>
                        ))}
                    </article>
                </div>
            </div>
        </main>
    );
}
