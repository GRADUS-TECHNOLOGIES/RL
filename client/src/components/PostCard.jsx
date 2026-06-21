import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';

GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

export default function PostCard({ post }) {
    const [pdfCover, setPdfCover] = useState(null);

    useEffect(() => {
        if (!post?.pdf) return;

        const loadPdfCover = async () => {
            try {
                const pdf      = await getDocument(post.pdf).promise;
                const page     = await pdf.getPage(1);
                const viewport = page.getViewport({ scale: 0.5 });
                const canvas   = document.createElement('canvas');
                const ctx      = canvas.getContext('2d', { willReadFrequently: true });
                canvas.width   = viewport.width;
                canvas.height  = viewport.height;
                await page.render({ canvasContext: ctx, viewport }).promise;
                setPdfCover(canvas.toDataURL());
            } catch {
                setPdfCover(null);
            }
        };

        loadPdfCover();
    }, [post?.pdf]);

    const imageUrl = post?.pdf ? pdfCover : post?.image;
    const isPdf    = Boolean(post?.pdf);

    return (
        <Link
            to={`/post/${post.slug}`}
            className="group block border border-gray-100 hover:border-[#B076CE]/40 transition-colors duration-300 bg-white"
            aria-label={post.title}
        >
            {/* ── Imagen ── */}
            <div className="relative h-[200px] w-full overflow-hidden bg-gray-50">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={post.title}
                        className={`h-full w-full transition-transform duration-700 group-hover:scale-[1.04] ${
                            isPdf ? 'object-contain' : 'object-cover'
                        }`}
                    />
                ) : (
                    // Placeholder mientras carga la portada del PDF
                    <div className="h-full w-full bg-gray-50 animate-pulse flex items-center justify-center">
                        <div className="w-[2px] h-8 bg-gray-200" />
                    </div>
                )}

                {/* Tipo de contenido */}
                <span className={`absolute top-0 left-0 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 ${
                    isPdf
                        ? 'bg-[#B076CE] text-white'
                        : 'bg-gray-900 text-white'
                }`}>
                    {isPdf ? 'Revista' : 'Artículo'}
                </span>
            </div>

            {/* ── Contenido ── */}
            <div className="p-4">
                {/* Categoría */}
                {post?.category && post.category !== 'uncategorized' && (
                    <p className="text-[9px] font-black text-[#B076CE] uppercase tracking-[0.3em] mb-2">
                        {post.category}
                    </p>
                )}

                {/* Título */}
                <h3 className="text-sm font-black text-gray-900 line-clamp-2 leading-snug mb-3">
                    {post.title}
                </h3>

                {/* CTA */}
                <span className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] group-hover:text-[#B076CE] transition-colors duration-200">
                    {isPdf ? 'Ver revista →' : 'Leer artículo →'}
                </span>
            </div>
        </Link>
    );
}
