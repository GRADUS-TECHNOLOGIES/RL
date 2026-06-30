export default function ServiceDisabledPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800 px-4">
            <img
                src="/icons/errorIcon.svg"
                alt="Servicio no disponible"
                className="h-40 w-40 mb-8 opacity-70"
            />

            <h1 className="text-4xl font-bold text-center text-gray-900 mb-3">
                Servicio no disponible
            </h1>

            <p className="text-lg text-gray-600 text-center max-w-md mb-2">
                Este servicio se encuentra temporalmente inhabilitado.
            </p>
            <p className="text-base text-gray-500 text-center max-w-md">
                Para más información, comuníquese con el administrador del sistema.
            </p>

            <div className="mt-10 border-t border-gray-300 pt-6 text-sm text-gray-400 text-center">
                <p>Revista de la Legislatura &mdash; Acceso restringido</p>
            </div>
        </div>
    );
}
