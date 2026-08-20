import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
    getDownloadURL,
    getStorage,
    ref,
    uploadBytesResumable,
} from 'firebase/storage';
import { app } from '../firebase';

// ── Primitivos ─────────────────────────────────────────────────────────────

const SectionLabel = ({ label }) => (
    <div className="flex items-center gap-3">
        <div className="w-[2px] h-4 bg-[#B076CE] flex-shrink-0" />
        <span className="text-[10px] font-black text-[#B076CE] uppercase tracking-[0.3em]">{label}</span>
        <div className="flex-1 h-px bg-gray-100" />
    </div>
);

const UploadProgress = ({ progress }) => (
    <div className="mt-2 h-[2px] bg-gray-100">
        <div
            className="h-[2px] bg-[#B076CE] transition-all duration-300"
            style={{ width: `${progress}%` }}
        />
    </div>
);

function DeleteModal({ onConfirm, onClose }) {
    return (
        <div
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div className="bg-white w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-[2px] h-4 bg-red-500" />
                        <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em]">
                            Acción irreversible
                        </span>
                    </div>
                    <button onClick={onClose} className="text-gray-300 hover:text-gray-900 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="px-6 py-6">
                    <h3 className="text-2xl font-black text-gray-900 mb-2">¿Estás seguro?</h3>
                    <p className="text-sm text-gray-500 font-light mb-8 leading-relaxed">
                        Esta acción eliminará el banner permanentemente. No se puede deshacer.
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={onConfirm}
                            className="flex-1 py-2.5 bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-700 transition-colors"
                        >
                            Sí, eliminar
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-[10px] font-black uppercase tracking-[0.2em] hover:border-gray-900 hover:text-gray-900 transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const EMPTY_FORM = {
    title: '', description: '', mediaUrl: '', mediaType: 'image',
    linkUrl: '', linkLabel: 'Ver más', isActive: true,
};
const TH_COLS = ['Fecha', 'Media', 'Título', 'Enlace', 'Activo', 'Editar', 'Eliminar'];

// ── Componente principal ───────────────────────────────────────────────────

export default function DashBanners() {
    const { currentUser } = useSelector((s) => s.user);

    const [banners, setBanners]     = useState([]);
    const [showMore, setShowMore]   = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [bannerIdToDelete, setBannerIdToDelete] = useState('');

    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData]   = useState(EMPTY_FORM);
    const [file, setFile]           = useState(null);
    const [mediaUploadProgress, setMediaUploadProgress] = useState(null);
    const [mediaUploadError, setMediaUploadError]       = useState(null);
    const [formError, setFormError]     = useState(null);
    const [formSuccess, setFormSuccess] = useState(null);

    const fetchBanners = async (startIndex = 0) => {
        try {
            const res  = await fetch(`/api/banner/getbanners?startIndex=${startIndex}`);
            const data = await res.json();
            if (res.ok) {
                setBanners((prev) => startIndex === 0 ? data.banners : [...prev, ...data.banners]);
                setShowMore(data.banners.length >= 9);
            }
        } catch (err) {
            console.error('Error al cargar banners:', err.message);
        }
    };

    useEffect(() => {
        if (currentUser?.isAdmin) fetchBanners();
    }, [currentUser?.isAdmin]);

    // ── Subida de media (imagen, GIF o video) ─────────────────────────────

    const handleUploadMedia = () => {
        if (!file) { setMediaUploadError('Por favor selecciona un archivo'); return; }
        setMediaUploadError(null);
        setMediaUploadProgress(0);
        const detectedType = file.type.startsWith('video/') ? 'video' : 'image';
        const storage    = getStorage(app);
        const storageRef = ref(storage, `${Date.now()}-${file.name}`);
        const task       = uploadBytesResumable(storageRef, file);
        task.on(
            'state_changed',
            (snap) => setMediaUploadProgress(((snap.bytesTransferred / snap.totalBytes) * 100).toFixed(0)),
            (err)  => { console.error(err); setMediaUploadError('Error al cargar el archivo'); setMediaUploadProgress(null); },
            ()     => getDownloadURL(task.snapshot.ref).then((url) => {
                setMediaUploadProgress(null);
                setMediaUploadError(null);
                setFormData((prev) => ({ ...prev, mediaUrl: url, mediaType: detectedType }));
            }),
        );
    };

    // ── Alta / edición ────────────────────────────────────────────────────

    const resetForm = () => {
        setEditingId(null);
        setFormData(EMPTY_FORM);
        setFile(null);
        setMediaUploadProgress(null);
        setMediaUploadError(null);
        setFormError(null);
    };

    const handleEditClick = (banner) => {
        setEditingId(banner._id);
        setFormData({
            title:       banner.title,
            description: banner.description || '',
            mediaUrl:    banner.mediaUrl,
            mediaType:   banner.mediaType || 'image',
            linkUrl:     banner.linkUrl,
            linkLabel:   banner.linkLabel || 'Ver más',
            isActive:    banner.isActive,
        });
        setFile(null);
        setFormSuccess(null);
        setFormError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError(null);
        setFormSuccess(null);

        if (!formData.title.trim())   { setFormError('El título es obligatorio'); return; }
        if (!formData.mediaUrl)       { setFormError('La imagen, GIF o video es obligatorio'); return; }
        if (!formData.linkUrl.trim()) { setFormError('El enlace es obligatorio'); return; }

        const isEditing = Boolean(editingId);
        const url    = isEditing ? `/api/banner/update/${editingId}` : '/api/banner/create';
        const method = isEditing ? 'PUT' : 'POST';

        try {
            const res  = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(formData),
                credentials: 'include',
            });
            const data = await res.json();
            if (!res.ok) { setFormError(data.message || 'Hubo un problema al guardar el banner'); return; }

            setFormSuccess(isEditing ? 'Banner actualizado con éxito' : 'Banner creado con éxito');
            resetForm();
            fetchBanners();
        } catch {
            setFormError('No se pudo guardar el banner');
        }
    };

    // ── Activar / desactivar ─────────────────────────────────────────────

    const handleToggleActive = async (bannerId, currentStatus) => {
        try {
            const res  = await fetch(`/api/banner/update/${bannerId}`, {
                method:  'PUT',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ isActive: !currentStatus }),
                credentials: 'include',
            });
            const data = await res.json();
            if (res.ok) {
                setBanners((prev) => prev.map((b) => b._id === bannerId ? data : b));
            } else {
                console.error(data.message || 'No se pudo actualizar el banner');
            }
        } catch (err) {
            console.error('Error al cambiar estado del banner:', err.message);
        }
    };

    // ── Eliminar ──────────────────────────────────────────────────────────

    const handleDeleteBanner = async () => {
        try {
            const res  = await fetch(`/api/banner/delete/${bannerIdToDelete}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            const data = await res.json();
            if (res.ok) {
                setBanners((prev) => prev.filter((b) => b._id !== bannerIdToDelete));
                setShowModal(false);
                if (editingId === bannerIdToDelete) resetForm();
            } else {
                console.error(data.message || 'Error al eliminar');
            }
        } catch (err) {
            console.error(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-white p-6 md:p-8 w-full">

            {/* ── Encabezado ── */}
            <div className="mb-8 pb-6 border-b border-gray-100">
                <SectionLabel label="Dashboard" />
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 mt-4">Banners</h1>
                <p className="text-sm text-gray-400 font-light mt-1">
                    Publicidad institucional mostrada en Inicio, artículos y búsqueda
                </p>
            </div>

            {/* ── Formulario alta / edición ── */}
            <div className="border border-gray-100 p-5 mb-10">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
                    {editingId ? 'Editar banner' : 'Nuevo banner'}
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Título (ej. Senado de la República)"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="border border-gray-200 px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-300 placeholder:font-light outline-none focus:border-[#B076CE] transition-colors bg-white"
                        />
                        <input
                            type="url"
                            placeholder="Enlace (ej. https://www.senado.gob.mx)"
                            value={formData.linkUrl}
                            onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                            className="border border-gray-200 px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-300 placeholder:font-light outline-none focus:border-[#B076CE] transition-colors bg-white"
                        />
                    </div>

                    <textarea
                        placeholder="Descripción breve"
                        rows={2}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="border border-gray-200 px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-300 placeholder:font-light outline-none focus:border-[#B076CE] transition-colors bg-white resize-none"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                        <div>
                            <div className="flex gap-2">
                                <div className="relative flex-1 border border-gray-200 hover:border-[#B076CE] transition-colors cursor-pointer overflow-hidden">
                                    <input
                                        type="file"
                                        accept="image/*,video/*"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                                    />
                                    <div className="px-3 py-2.5 flex items-center gap-2">
                                        <span className="text-xs text-gray-400 font-light truncate">
                                            {file ? file.name : 'Seleccionar imagen, GIF o video...'}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleUploadMedia}
                                    disabled={!!mediaUploadProgress}
                                    className="px-4 py-2 border border-gray-900 text-[10px] font-black text-gray-900 uppercase tracking-[0.15em] hover:bg-[#B076CE] hover:border-[#B076CE] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all whitespace-nowrap"
                                >
                                    {mediaUploadProgress ? `${mediaUploadProgress}%` : 'Cargar'}
                                </button>
                            </div>
                            <p className="mt-1.5 text-[10px] text-gray-300 font-light">
                                Admite imagen, GIF o video (MP4/WebM). Un video corto y liviano funciona mejor como banner.
                            </p>
                            {mediaUploadProgress && <UploadProgress progress={mediaUploadProgress} />}
                            {mediaUploadError && (
                                <p className="mt-2 text-[9px] font-black text-red-500 uppercase tracking-[0.2em]">{mediaUploadError}</p>
                            )}
                            {formData.mediaUrl && !mediaUploadProgress && (
                                <div className="mt-3 flex items-center gap-3">
                                    {formData.mediaType === 'video' ? (
                                        <video
                                            src={formData.mediaUrl}
                                            muted
                                            className="w-20 h-14 object-cover border border-gray-100"
                                        />
                                    ) : (
                                        <img
                                            src={formData.mediaUrl}
                                            alt="Vista previa"
                                            className="w-20 h-14 object-cover border border-gray-100"
                                        />
                                    )}
                                    <p className="text-[9px] font-black text-green-500 uppercase tracking-[0.2em]">
                                        {formData.mediaType === 'video' ? 'Video cargado' : 'Imagen cargada'}
                                    </p>
                                </div>
                            )}
                        </div>

                        <input
                            type="text"
                            placeholder="Texto del botón (ej. Visitar sitio oficial)"
                            value={formData.linkLabel}
                            onChange={(e) => setFormData({ ...formData, linkLabel: e.target.value })}
                            className="border border-gray-200 px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-300 placeholder:font-light outline-none focus:border-[#B076CE] transition-colors bg-white"
                        />
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer group w-fit">
                        <div
                            onClick={() => setFormData((p) => ({ ...p, isActive: !p.isActive }))}
                            className={`relative w-9 h-5 flex items-center p-0.5 flex-shrink-0 transition-colors duration-300 ${
                                formData.isActive ? 'bg-[#B076CE]' : 'bg-gray-200'
                            }`}
                        >
                            <div className={`bg-white w-4 h-4 shadow-sm transform transition-transform duration-300 ${
                                formData.isActive ? 'translate-x-4' : 'translate-x-0'
                            }`} />
                        </div>
                        <span className="text-sm text-gray-600 font-light group-hover:text-gray-900 transition-colors">
                            Banner activo (visible en el sitio)
                        </span>
                    </label>

                    {(formError || formSuccess) && (
                        <div className="space-y-2">
                            {formError && (
                                <div className="flex items-center gap-3 px-4 py-3 border border-red-100 bg-red-50">
                                    <div className="w-[2px] h-4 bg-red-400 flex-shrink-0" />
                                    <p className="text-xs text-red-500 font-light">{formError}</p>
                                </div>
                            )}
                            {formSuccess && (
                                <div className="flex items-center gap-3 px-4 py-3 border border-green-200 bg-green-50">
                                    <div className="w-[2px] h-4 bg-green-500 flex-shrink-0" />
                                    <p className="text-xs text-green-600 font-light">{formSuccess}</p>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            className="flex-1 py-3 bg-gray-900 text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-[#B076CE] transition-colors duration-300"
                        >
                            {editingId ? 'Guardar cambios' : 'Publicar banner'}
                        </button>
                        {editingId && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-6 py-3 border border-gray-200 text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] hover:border-gray-900 hover:text-gray-900 transition-colors"
                            >
                                Cancelar
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* ── Listado ── */}
            {banners.length > 0 ? (
                <>
                    <div className="border border-gray-100 overflow-x-auto">
                        <table className="w-full min-w-[700px]">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/80">
                                    {TH_COLS.map((h) => (
                                        <th
                                            key={h}
                                            className="text-left text-[9px] font-black text-gray-400 uppercase tracking-[0.25em] px-4 py-2.5 whitespace-nowrap"
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {banners.map((banner) => (
                                    <tr
                                        key={banner._id}
                                        className="border-b border-gray-50 last:border-0 hover:bg-[#B076CE]/[0.03] transition-colors"
                                    >
                                        <td className="px-4 py-3 text-xs text-gray-400 font-light whitespace-nowrap">
                                            {new Date(banner.updatedAt).toLocaleDateString('es-MX', {
                                                year: 'numeric', month: 'short', day: 'numeric',
                                            })}
                                        </td>
                                        <td className="px-4 py-3">
                                            {banner.mediaType === 'video' ? (
                                                <video
                                                    src={banner.mediaUrl}
                                                    muted
                                                    className="w-16 h-10 object-cover border border-gray-100"
                                                />
                                            ) : (
                                                <img
                                                    src={banner.mediaUrl}
                                                    alt={banner.title}
                                                    className="w-16 h-10 object-cover border border-gray-100"
                                                />
                                            )}
                                        </td>
                                        <td className="px-4 py-3 max-w-[220px]">
                                            <span className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug">
                                                {banner.title}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 max-w-[180px]">
                                            <a
                                                href={banner.linkUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[11px] text-[#B076CE] hover:underline truncate block"
                                            >
                                                {banner.linkUrl}
                                            </a>
                                        </td>
                                        <td className="px-4 py-3">
                                            <label className="inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only"
                                                    checked={banner.isActive}
                                                    onChange={() => handleToggleActive(banner._id, banner.isActive)}
                                                />
                                                <div className={`w-9 h-5 flex items-center p-0.5 transition-colors duration-300 ${
                                                    banner.isActive ? 'bg-[#B076CE]' : 'bg-gray-200'
                                                }`}>
                                                    <div className={`bg-white w-4 h-4 shadow-sm transform transition-transform duration-300 ${
                                                        banner.isActive ? 'translate-x-4' : 'translate-x-0'
                                                    }`} />
                                                </div>
                                            </label>
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => handleEditClick(banner)}
                                                className="text-[9px] font-black text-[#B076CE] hover:text-gray-900 uppercase tracking-[0.2em] transition-colors"
                                            >
                                                Editar
                                            </button>
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => { setShowModal(true); setBannerIdToDelete(banner._id); }}
                                                className="text-[9px] font-black text-red-300 hover:text-red-600 uppercase tracking-[0.2em] transition-colors"
                                            >
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {showMore && (
                        <button
                            onClick={() => fetchBanners(banners.length)}
                            className="w-full mt-0 py-3 text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] hover:text-[#B076CE] transition-colors border-t border-gray-100"
                        >
                            Mostrar más →
                        </button>
                    )}
                </>
            ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-[2px] h-8 bg-gray-100 mb-4" />
                    <p className="text-sm text-gray-300 font-light">No hay banners aún</p>
                </div>
            )}

            {showModal && (
                <DeleteModal
                    onConfirm={handleDeleteBanner}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    );
}
