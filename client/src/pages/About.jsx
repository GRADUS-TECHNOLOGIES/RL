import { useEffect } from 'react';
import CallToAction from '../components/CallToAction';

export default function About() {
    useEffect(() => {
        document.title = 'Conócenos - Revista Legislatura';
    }, []);

    return (
        <div className="min-h-screen bg-white px-3 sm:px-5 lg:px-6">
            {/* Contenedor principal con diseño de dos columnas */}
            <div className="flex flex-col sm:flex-row gap-8 mt-4">
                {/* Columna izquierda: Imagen */}
                <div className="w-full sm:w-1/2">
                    <img
                        src="/bckgnd/infoBckgnd.svg"
                        alt="Ilustración institucional"
                        className="w-full h-full object-cover rounded-lg shadow-md"
                    />
                </div>

                {/* Columna derecha: Texto */}
                <div className="w-full sm:w-1/2">
                    {/* Icono/imagen centrado arriba de la columna */}
                    <div className="flex justify-center mb-6">
                        <img
                            src="/icons/info.svg"
                            alt="Icono Revista Legislatura"
                            className="h-20 w-20 object-contain mt-4 mb-8"
                        />
                    </div>

                    {/* Título */}
                    <h1 className="text-3xl text-center sm:text-4xl font-bold italic text-gray-800 mb-6 leading-tight">
                        Revista Legislatura: <br />la voz institucional del Poder Legislativo
                    </h1>

                    {/* Contenido */}
                    <div className="text-lg text-gray-700 space-y-4">
                        <p>
                            <strong>La Revista Legislatura es una publicación mensual de carácter institucional con un doble propósito:</strong>
                        </p>
                        <ul className="list-disc list-inside pl-4 space-y-2">
                            <li>Informar con pluralidad y objetividad a la ciudadanía interesada en las actividades legislativas.</li>
                            <li>Brindar a legisladores federales y locales un panorama actualizado sobre las acciones de otras instituciones públicas.</li>
                        </ul>

                        <p>
                            Como medio de comunicación, Legislatura mantiene una posición neutral, ajena a cualquier partidismo, y se consolida como el testigo autorizado del quehacer legislativo en México.
                        </p>

                        <div>
                            <strong>Certificaciones y registros:</strong>
                            <ul className="list-disc list-inside pl-4 mt-2 space-y-2">
                                <li>Registro ante el Instituto Nacional del Derecho de Autor (INDAUTOR).</li>
                                <li>Certificado de Licitud de Contenido y Título, expedido por la Secretaría de Gobernación.</li>
                                <li>Certificación N° 358 como revista institucional, otorgada por la Dirección de Medios Impresos (Subsecretaría de Normatividad de Medios, Segob).</li>
                            </ul>
                        </div>

                        {/* Llamada a la acción */}
                        <div className="mt-8">
                            <CallToAction />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}