import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { app } from '../firebase';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import {
    updateStart, updateSuccess, updateFailure,
    deleteUserStart, deleteUserSuccess, deleteUserFailure,
    signoutSuccess,
} from '../redux/user/userSlice';
import { HiOutlinePencil, HiOutlineDocumentText, HiOutlineLogout, HiOutlineTrash } from 'react-icons/hi';
import { Link } from 'react-router-dom';

// ── Primitivo de sección ───────────────────────────────────────────────────

const SectionLabel = ({ label, color = 'purple' }) => (
    <div className="flex items-center gap-3 mb-4">
        <div className={`w-[2px] h-4 flex-shrink-0 ${color === 'purple' ? 'bg-[#B076CE]' : 'bg-gray-300'}`} />
        <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${color === 'purple' ? 'text-[#B076CE]' : 'text-gray-400'}`}>
            {label}
        </span>
        <div className="flex-1 h-px bg-gray-100" />
    </div>
);

// ── Modal de confirmación ──────────────────────────────────────────────────

function DeleteModal({ onConfirm, onClose }) {
    return (
        <div
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-white w-full max-w-sm"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Cabecera */}
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-[2px] h-4 bg-red-500" />
                        <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em]">
                            Acción irreversible
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-300 hover:text-gray-900 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Cuerpo */}
                <div className="px-6 py-6">
                    <h3 className="text-2xl font-black text-gray-900 mb-2">¿Eliminar tu cuenta?</h3>
                    <p className="text-sm text-gray-500 font-light mb-8 leading-relaxed">
                        Esta acción no se puede deshacer. Todos tus datos serán eliminados permanentemente.
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

// ── Componente principal ───────────────────────────────────────────────────

export default function DashProfile() {
    const { currentUser, error, loading } = useSelector((s) => s.user);
    const dispatch = useDispatch();
    const filePickerRef = useRef();

    const [imageFile, setImageFile]                   = useState(null);
    const [imageFileUrl, setImageFileUrl]             = useState(null);
    const [imageFileUploadProgress, setImageFileUploadProgress] = useState(null);
    const [imageFileUploadError, setImageFileUploadError]       = useState(null);
    const [imageFileUploading, setImageFileUploading] = useState(false);
    const [updateUserSuccess, setUpdateUserSuccess]   = useState(null);
    const [updateUserError, setUpdateUserError]       = useState(null);
    const [showModal, setShowModal]                   = useState(false);
    const [formData, setFormData]                     = useState({});

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImageFileUrl(URL.createObjectURL(file));
        }
    };

    useEffect(() => {
        if (imageFile) uploadImage();
    }, [imageFile]);

    const uploadImage = async () => {
        setImageFileUploading(true);
        setImageFileUploadError(null);
        const storage    = getStorage(app);
        const fileName   = new Date().getTime() + imageFile.name;
        const storageRef = ref(storage, fileName);
        const uploadTask = uploadBytesResumable(storageRef, imageFile);

        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setImageFileUploadProgress(progress.toFixed(0));
            },
            () => {
                setImageFileUploadError('No es posible cargar la imagen (máx. 2 MB)');
                setImageFileUploadProgress(null);
                setImageFile(null);
                setImageFileUrl(null);
                setImageFileUploading(false);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((url) => {
                    setImageFileUrl(url);
                    setFormData({ ...formData, profilePicture: url });
                    setImageFileUploading(false);
                });
            }
        );
    };

    const handleChange = (e) =>
        setFormData({ ...formData, [e.target.id]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdateUserError(null);
        setUpdateUserSuccess(null);
        if (Object.keys(formData).length === 0) {
            return setUpdateUserError('Ningún cambio realizado.');
        }
        if (imageFileUploading) {
            return setUpdateUserError('Por favor espera a que cargue la imagen.');
        }
        try {
            dispatch(updateStart());
            const res  = await fetch(`/api/user/update/${currentUser._id}`, {
                method:  'PUT',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(formData),
            });
            const data = await res.json();
            if (!res.ok) {
                dispatch(updateFailure(data.message));
                setUpdateUserError(data.message);
            } else {
                dispatch(updateSuccess(data));
                setUpdateUserSuccess('Perfil actualizado correctamente.');
            }
        } catch (err) {
            dispatch(updateFailure(err.message));
            setUpdateUserError(err.message);
        }
    };

    const handleDeleteUser = async () => {
        setShowModal(false);
        try {
            dispatch(deleteUserStart());
            const res  = await fetch(`/api/user/delete/${currentUser._id}`, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok) dispatch(deleteUserFailure(data.message));
            else dispatch(deleteUserSuccess(data));
        } catch (err) {
            dispatch(deleteUserFailure(err.message));
        }
    };

    const handleSignout = async () => {
        try {
            const res = await fetch('/api/user/signout', { method: 'POST' });
            const data = await res.json();
            if (res.ok) dispatch(signoutSuccess());
            else console.log(data.message);
        } catch (err) {
            console.log(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-white p-6 md:p-8 w-full">

            {/* ── Encabezado de página ── */}
            <div className="mb-8 pb-6 border-b border-gray-100">
                <SectionLabel label="Dashboard" />
                <h1 className="text-3xl md:text-4xl font-black text-gray-900">Mi Perfil</h1>
                <p className="text-sm text-gray-400 font-light mt-1">
                    Gestiona tu información personal y acciones de cuenta
                </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 xl:gap-12">

                {/* ── Formulario principal (2/3) ── */}
                <div className="xl:col-span-2">
                    <form onSubmit={handleSubmit}>

                        {/* Avatar */}
                        <div className="mb-8">
                            <SectionLabel label="Foto de perfil" />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                ref={filePickerRef}
                                hidden
                            />
                            <div className="flex items-center gap-6">
                                {/* Imagen */}
                                <div
                                    className="relative w-24 h-24 flex-shrink-0 cursor-pointer group"
                                    onClick={() => filePickerRef.current.click()}
                                >
                                    {imageFileUploadProgress && (
                                        <CircularProgressbar
                                            value={imageFileUploadProgress || 0}
                                            text={`${imageFileUploadProgress}%`}
                                            strokeWidth={5}
                                            styles={{
                                                root: {
                                                    position: 'absolute',
                                                    width: '100%',
                                                    height: '100%',
                                                    top: 0,
                                                    left: 0,
                                                },
                                                path:  { stroke: '#B076CE' },
                                                text:  { fill: '#B076CE', fontSize: '22px', fontWeight: 900 },
                                                trail: { stroke: '#f3f4f6' },
                                            }}
                                        />
                                    )}
                                    <img
                                        src={imageFileUrl || currentUser.profilePicture}
                                        alt="Foto de perfil"
                                        className={`w-full h-full rounded-full object-cover border-2 border-gray-100 group-hover:border-[#B076CE] transition-colors duration-200 ${
                                            imageFileUploadProgress && imageFileUploadProgress < 100
                                                ? 'opacity-50'
                                                : ''
                                        }`}
                                    />
                                    {/* Overlay de lápiz */}
                                    <div className="absolute inset-0 rounded-full bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                                        <HiOutlinePencil className="w-5 h-5 text-white" />
                                    </div>
                                </div>

                                {/* Info del usuario */}
                                <div>
                                    <p className="text-base font-black text-gray-900">
                                        {currentUser.username}
                                    </p>
                                    <p className="text-sm text-gray-400 font-light mt-0.5">
                                        {currentUser.email}
                                    </p>
                                    <p className="text-[10px] text-gray-300 font-light mt-3">
                                        JPG, PNG o GIF · Máx. 2 MB
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => filePickerRef.current.click()}
                                        className="mt-2 text-[10px] font-black text-[#B076CE] uppercase tracking-[0.2em] hover:text-gray-900 transition-colors"
                                    >
                                        Cambiar foto →
                                    </button>
                                </div>
                            </div>

                            {imageFileUploadError && (
                                <div className="flex items-center gap-2 mt-3 p-3 border border-red-100 bg-red-50">
                                    <div className="w-[2px] h-4 bg-red-500 flex-shrink-0" />
                                    <p className="text-xs text-red-600 font-light">{imageFileUploadError}</p>
                                </div>
                            )}
                        </div>

                        {/* Campos */}
                        <div className="mb-7">
                            <SectionLabel label="Información de cuenta" />
                            <div className="space-y-5">

                                <div>
                                    <label
                                        htmlFor="username"
                                        className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1.5"
                                    >
                                        Nombre de usuario
                                    </label>
                                    <input
                                        id="username"
                                        type="text"
                                        defaultValue={currentUser.username}
                                        onChange={handleChange}
                                        className="w-full border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-[#B076CE] transition-colors duration-200 bg-white"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="email"
                                        className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1.5"
                                    >
                                        Correo electrónico
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        defaultValue={currentUser.email}
                                        onChange={handleChange}
                                        className="w-full border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-[#B076CE] transition-colors duration-200 bg-white"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="password"
                                        className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1.5"
                                    >
                                        Nueva contraseña
                                    </label>
                                    <input
                                        id="password"
                                        type="password"
                                        placeholder="Dejar en blanco para no cambiar"
                                        onChange={handleChange}
                                        className="w-full border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-300 placeholder:font-light outline-none focus:border-[#B076CE] transition-colors duration-200 bg-white"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Mensajes de estado */}
                        {updateUserSuccess && (
                            <div className="flex items-center gap-2 mb-4 p-3 border border-green-200 bg-green-50">
                                <div className="w-[2px] h-4 bg-green-500 flex-shrink-0" />
                                <p className="text-xs text-green-700 font-light">{updateUserSuccess}</p>
                            </div>
                        )}
                        {(updateUserError || error) && (
                            <div className="flex items-center gap-2 mb-4 p-3 border border-red-100 bg-red-50">
                                <div className="w-[2px] h-4 bg-red-500 flex-shrink-0" />
                                <p className="text-xs text-red-600 font-light">{updateUserError || error}</p>
                            </div>
                        )}

                        {/* Botón guardar */}
                        <button
                            type="submit"
                            disabled={loading || imageFileUploading}
                            className="w-full py-3 bg-gray-900 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#B076CE] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Actualizando...' : 'Actualizar perfil'}
                        </button>
                    </form>
                </div>

                {/* ── Panel lateral (1/3) ── */}
                <div className="space-y-8">

                    {/* Acciones de Admin */}
                    {currentUser.isAdmin && (
                        <div>
                            <SectionLabel label="Administrador" />
                            <Link
                                to="/create-post"
                                className="flex items-center gap-3 w-full px-4 py-3 border border-gray-900 text-gray-900 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#B076CE] hover:border-[#B076CE] hover:text-white transition-all duration-300"
                            >
                                <HiOutlineDocumentText className="w-4 h-4 flex-shrink-0" />
                                Crear post / Cargar revista
                            </Link>
                        </div>
                    )}

                    {/* Información de cuenta */}
                    <div>
                        <SectionLabel label="Información" color="gray" />
                        <div className="border border-gray-100 divide-y divide-gray-50">
                            <div className="flex justify-between items-center px-4 py-3">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                                    ID
                                </span>
                                <span className="text-xs text-gray-600 font-mono">
                                    ···{currentUser._id.slice(-8)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center px-4 py-3">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                                    Estado
                                </span>
                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 ${
                                    currentUser.isAdmin
                                        ? 'bg-[#B076CE] text-white'
                                        : 'bg-gray-100 text-gray-500'
                                }`}>
                                    {currentUser.isAdmin ? 'Administrador' : 'Usuario'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center px-4 py-3">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                                    Miembro desde
                                </span>
                                <span className="text-xs text-gray-600">
                                    {new Date(currentUser.createdAt).toLocaleDateString('es-MX', {
                                        year: 'numeric', month: 'short', day: 'numeric',
                                    })}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Gestión de cuenta */}
                    <div>
                        <SectionLabel label="Cuenta" color="gray" />
                        <div className="space-y-2">
                            <button
                                type="button"
                                onClick={handleSignout}
                                className="w-full flex items-center gap-3 px-4 py-2.5 border border-gray-200 text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] hover:border-gray-900 hover:text-gray-900 transition-all duration-200"
                            >
                                <HiOutlineLogout className="w-4 h-4 flex-shrink-0" />
                                Cerrar sesión
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowModal(true)}
                                className="w-full flex items-center gap-3 px-4 py-2.5 border border-red-100 text-red-400 text-[10px] font-black uppercase tracking-[0.2em] hover:border-red-500 hover:text-red-600 transition-all duration-200"
                            >
                                <HiOutlineTrash className="w-4 h-4 flex-shrink-0" />
                                Eliminar cuenta
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Modal de confirmación ── */}
            {showModal && (
                <DeleteModal
                    onConfirm={handleDeleteUser}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    );
}
