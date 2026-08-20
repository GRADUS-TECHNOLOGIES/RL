import { useEffect, useState } from 'react';

export default function InstitutionalBanner() {
    const [banner, setBanner] = useState(null);

    useEffect(() => {
        let cancelled = false;

        const fetchBanner = async () => {
            try {
                const res = await fetch('/api/banner/getbanners?isActive=true&limit=1');
                if (!res.ok) return;
                const data = await res.json();
                if (!cancelled) setBanner(data.banners?.[0] || null);
            } catch {
                if (!cancelled) setBanner(null);
            }
        };

        fetchBanner();
        return () => { cancelled = true; };
    }, []);

    if (!banner) return null;

    return (
        <div className="border border-gray-100">
            <div className="flex flex-col sm:flex-row">

                {/* Texto */}
                <div className="flex-1 p-8 sm:p-10 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-[2px] h-4 bg-gray-400 flex-shrink-0" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
                            Contenido institucional
                        </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight mb-3">
                        {banner.title}
                    </h2>
                    {banner.description && (
                        <p className="text-sm text-gray-500 font-light leading-relaxed mb-6">
                            {banner.description}
                        </p>
                    )}
                    <a
                        href={banner.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        className="inline-flex items-center gap-2 self-start px-5 py-2.5 border border-gray-900 text-[10px] font-black text-gray-900 uppercase tracking-[0.2em] hover:bg-[#B076CE] hover:border-[#B076CE] hover:text-white transition-all duration-300"
                    >
                        {banner.linkLabel || 'Ver más'}
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </a>
                </div>

                {/* Media */}
                <div className="flex-1 overflow-hidden min-h-[200px] sm:min-h-[260px]">
                    {banner.mediaType === 'video' ? (
                        <video
                            src={banner.mediaUrl}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <img
                            src={banner.mediaUrl}
                            alt={banner.title}
                            className="w-full h-full object-cover"
                        />
                    )}
                </div>

            </div>
        </div>
    );
}
