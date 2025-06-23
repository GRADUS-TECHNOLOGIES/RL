import { Button } from "flowbite-react";
import { HiBell } from "react-icons/hi";

export default function CallToAction() {
    return (
        <div className="flex flex-col sm:flex-row p-4 border border-black justify-center items-center rounded-tl-3xl rounded-br-3xl text-center sm:text-left shadow-md hover:shadow-lg transition-shadow duration-300 bg-white">
            {/* Texto e información */}
            <div className="flex-1 flex flex-col justify-center p-4 sm:p-6">
                <h2 className="text-3xl sm:text-4xl font-bold text-black leading-tight">
                    Sé parte del cambio legislativo en México
                </h2>
                <p className="text-[#545454] my-4">
                    Suscríbete a nuestra revista y nunca pierdas de vista aquellas acciones que cambian a nuestro país
                </p>
                {/* Botón full width en móvil */}
                <Button
                    href="/error"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto mt-2 sm:mt-0 bg-[#b076ce] hover:bg-black hover:text-[#b076ce] rounded-tl-xl rounded-bl-none transition-all duration-300"
                >
                    <HiBell className="mr-2 h-5 w-5" />
                    Suscribirse
                </Button>
            </div>

            {/* Imagen */}
            <div className="p-4 flex-1 flex justify-center">
                <img
                    src="https://portalciudadano2.diputados.gob.mx/assets/imagenes/header_6-p-800.png" 
                    alt="Cámara de Diputados"
                    className="max-w-full h-auto rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
                />
            </div>
        </div>
    );
}
