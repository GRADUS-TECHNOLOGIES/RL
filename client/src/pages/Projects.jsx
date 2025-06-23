import { useEffect } from 'react';
import CallToAction from '../components/CallToAction';

export default function Projects() {
    useEffect(() => {
        document.title = 'Servicios - Revista Legislatura';
    }, []);

    const servicesData = {
        title: 'Nuestros Servicios de Difusión Institucional',
        description:
            'Descubra por qué Revista Legislatura es el medio ideal para su comunicación estratégica en el ámbito legislativo y político.',
        whyChooseUs: {
            title: '¿Por qué elegir a Revista Legislatura como su medio de difusión?',
            items: [
                {
                    title: 'Equipo especializado',
                    content:
                        'Contamos con un equipo multidisciplinario de profesionales con amplia experiencia en comunicación legislativa, derecho y periodismo político.'
                },
                {
                    title: 'Excelencia editorial',
                    content:
                        'Ofrecemos rigurosidad en la edición, con procesos de revisión exhaustivos que aseguran precisión en la información.'
                },
                {
                    title: 'Contenido estratégico',
                    content:
                        'Desarrollamos análisis de actualidad que facilitan la comprensión de procesos legislativos, tendencias políticas y jurisprudencia relevante.'
                },
                {
                    title: 'Alcance institucional',
                    content:
                        'Somos el medio de referencia para legisladores, funcionarios públicos, académicos y profesionales del derecho.'
                }
            ]
        },
        benefits: {
            title: 'Beneficios clave para su institución',
            items: [
                'Difusión garantizada entre tomadores de decisiones',
                'Contenidos con enfoque técnico pero accesible',
                'Credibilidad institucional',
                'Posicionamiento como referente en temas legislativos',
                'Conexión con audiencias clave en el sector público'
            ]
        }
    };

    return (
        <div className="min-h-screen bg-white px-3 sm:px-5 lg:px-6">
            {/* Contenedor principal con diseño de dos columnas a ancho completo */}
            <div className="flex flex-col sm:flex-row gap-8 mt-4">
                {/* Columna izquierda: Contenido */}
                <div className="w-full sm:w-1/2">
                    {/* Icono personalizado centrado arriba del encabezado */}
                    <div className="flex justify-center mb-6">
                        <img
                            src="/icons/srvc.svg"
                            alt="Icono de Servicios"
                            className="h-20 w-20 object-contain mt-4 mb-8"
                        />
                    </div>

                    {/* Encabezado en columna izquierda */}
                    <header className="mb-8 text-left">
                        <h1 className="text-center text-3xl sm:text-4xl font-bold italic text-gray-800 mb-4">
                            {servicesData.title}
                        </h1>
                        <p className="text-lg text-gray-600">
                            {servicesData.description}
                        </p>
                    </header>

                    {/* Sección Por qué elegirnos */}
                    <section className="mb-10">
                        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-6">
                            {servicesData.whyChooseUs.title}
                        </h2>
                        <div className="grid grid-cols-1 gap-6">
                            {servicesData.whyChooseUs.items.map((item, index) => (
                                <div
                                    key={index}
                                    className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                                >
                                    <h3 className="text-xl font-medium text-gray-800 mb-3">{item.title}</h3>
                                    <p className="text-gray-600">{item.content}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Sección Beneficios */}
                    <section className="mb-10">
                        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-6">
                            {servicesData.benefits.title}
                        </h2>
                        <ul className="space-y-4">
                            {servicesData.benefits.items.map((benefit, index) => (
                                <li key={index} className="flex items-start space-x-3">
                                    <svg
                                        className="h-5 w-5 text-green-500 mt-1 flex-shrink-0"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                    <span className="text-gray-700">{benefit}</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>

                {/* Columna derecha: Imagen */}
                <div className="w-full sm:w-1/2 flex items-center justify-center">
                    <img
                        src="/bckgnd/srvcBckgnd.svg"
                        alt="Servicios de difusión institucional"
                        className="w-full h-full object-cover rounded-lg shadow-md"
                    />
                </div>
            </div>
        </div>
    );
}