import { Button } from "flowbite-react";
import { WiAlien } from "react-icons/wi";

export default function UnderConstructionPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800">
            {/* Icono como imagen */}
            <img
                src="/icons/constructionIcon.svg"
                alt="Construction Icon"
                className="h-70 w-70 mb-6"
            />

            {/* Mensaje */}
            <h1 className="text-3xl font-bold">¡Estamos trabajando en ello!</h1>
            <p className="text-lg text-gray-600 mt-2">
                Esta página estará disponible pronto.
            </p>

            {/* Botón de regreso */}
            <Button
                href="/"
                rel="noopener noreferrer"
                className="mt-6 px-6 py-2 bg-[#b076ce] text-white rounded-md hover:bg-[#7f5594] transition-colors duration-300"
            >
                <WiAlien className="mr-2 h-8 w-8" />
                Regresar al inicio
            </Button>
        </div>
    );
}