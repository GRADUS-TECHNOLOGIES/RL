export default function CallToAction() {
    return (
        <div className="border border-gray-100">
            <div className="flex flex-col sm:flex-row">

                {/* Texto */}
                <div className="flex-1 p-8 sm:p-10 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-[2px] h-4 bg-[#B076CE] flex-shrink-0" />
                        <span className="text-[10px] font-black text-[#B076CE] uppercase tracking-[0.3em]">
                            Boletín
                        </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight mb-3">
                        Sé parte del cambio legislativo en México
                    </h2>
                    <p className="text-sm text-gray-500 font-light leading-relaxed mb-6">
                        Suscríbete a nuestra revista y nunca pierdas de vista las acciones que transforman al país.
                    </p>
                    <a
                        href="/sign-up"
                        className="inline-flex items-center gap-2 self-start px-5 py-2.5 border border-gray-900 text-[10px] font-black text-gray-900 uppercase tracking-[0.2em] hover:bg-[#B076CE] hover:border-[#B076CE] hover:text-white transition-all duration-300"
                    >
                        Suscribirse
                    </a>
                </div>

                {/* Imagen */}
                <div className="flex-1 overflow-hidden min-h-[200px] sm:min-h-[260px]">
                    <img
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRA-8hAhzcgka1aW6itk5ogw0HTL_eG9B70QrfNFohxelD87VOcuL8en82R&s=10"
                        alt="Cámara de Diputados"
                        className="w-full h-full object-cover"
                    />
                </div>

            </div>
        </div>
    );
}
