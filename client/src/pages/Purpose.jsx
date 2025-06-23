import { useEffect } from 'react';
import CallToAction from '../components/CallToAction';

export default function About() {
    useEffect(() => {
        document.title = 'Propósito - Revista Legislatura';
    }, []);

    return (
        <div className="min-h-screen bg-white px-3 sm:px-5 lg:px-6">
            {/* Contenedor principal con diseño de dos columnas */}
            <div className="flex flex-col sm:flex-row gap-8 mt-4">
                {/* Columna izquierda: Imagen */}
                <div className="w-full sm:w-1/2">
                    <img
                        src="/bckgnd/srvcBckgnd.svg"
                        alt="Ilustración institucional"
                        className="w-full h-full object-cover rounded-lg shadow-md"
                    />
                </div>

                {/* Columna derecha: Texto */}
                <div className="w-full sm:w-1/2">
                    {/* Icono/imagen centrado arriba de la columna */}
                    <div className="flex justify-center mb-6">
                        <img
                            src="/icons/prps.svg"
                            alt="Icono Revista Legislatura"
                            className="h-20 w-20 object-contain mt-4 mb-8"
                        />
                    </div>

                    {/* Título */}
                    <h1 className="text-3xl text-center sm:text-4xl font-bold italic text-gray-800 mb-6 leading-tight">
                        Propósito de la revista Legislatura
                    </h1>

                    {/* Contenido */}
                    <div className="text-lg text-gray-700 space-y-8">
                        <p>
                            <strong>El derecho a la información como pilar de la democracia.</strong>
                        </p>

                        <p>
                            El derecho a la información, en especial la que se refiere al ejercicio de las tareas gubernamentales, es sin duda una de las más importantes acciones que acercarán a la sociedad mexicana a la plenitud democrática.
                        </p>

                        <p>
                            La aparición de Legislatura responde a este propósito, ya que se reconoce que en particular esta insuficiencia se manifiesta de manera relevante en el quehacer del Poder Legislativo, mismo que cumple con un papel esencial para la vida política, económica y social de México, aunque la perspectiva social que se tiene al respecto, además de limitada, podría decirse que es distorsionada, en buena medida a causa de un deficiente nivel de información sobre los procesos internos, la complejidad con que se llega a acuerdos en ambas cámaras federales, el deterioro de la política y la especialización propia de los trabajos legislativos.
                        </p>

                        <p>
                            La aspiración de Legislatura es múltiple en cuanto a los sectores a los que se dirige, pues por un lado se trata de ser un medio objetivo y ajeno a toda clase de partidismos que dé testimonio constante de las actividades propias de las cámaras que componen el Congreso de la Unión y, por otro, mediante un estilo sencillo y conciso, busca informar a los grandes sectores sociales sobre las funciones esenciales de ambas cámaras legislativas, su composición interna, así como su vinculación con los otros Poderes de la Unión, las entidades federativas y las distintas organizaciones sociales.
                        </p>

                        <p>
                            Así, se pretende llegar tanto a los grupos de estudiosos y especialistas de las tareas legislativas, como a amplios sectores sociales, los cuales son, sin duda, los principales interesados en conocer los productos finales de la actividad legislativa.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

