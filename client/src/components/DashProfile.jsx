import { Alert, Button, Modal, ModalBody, ModalHeader, TextInput, Card } from 'flowbite-react';
import { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { app } from '../firebase';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { updateStart, updateSuccess, updateFailure, deleteUserStart, deleteUserSuccess, deleteUserFailure, signoutSuccess } from '../redux/user/userSlice';
import { useDispatch } from 'react-redux';
import { HiOutlineExclamationCircle, HiOutlinePencil, HiOutlineDocumentText, HiOutlineLogout, HiOutlineTrash } from 'react-icons/hi';
import { Link } from 'react-router-dom';

export default function DashProfile() {
    const { currentUser, error, loading } = useSelector(state => state.user);
    const [imageFile, setImageFile] = useState(null);
    const [imageFileUrl, setImageFileUrl] = useState(null);
    const [imageFileUploadProgress, setImageFileUploadProgress] = useState(null);
    const [imageFileUploadError, setImageFileUploadError] = useState(null);
    const [imageFileUploading, setImageFileUploading] = useState(false);
    const [updateUserSuccess, setUpdateUserSuccess] = useState(null);
    const [updateUserError, setUpdateUserError] = useState(null);
    const [showModal, setShowModal] = useState(null);
    const [formData, setFormData] = useState({});
    const filePickerRef = useRef();
    const dispatch = useDispatch();

    const handleImageChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            setImageFile(file);
            setImageFileUrl(URL.createObjectURL(file));
        }
    };

    useEffect(() => {
        if (imageFile) {
            uploadImage();
        }
    }, [imageFile]);

    const uploadImage = async () => {

        /* FIREBASE STORAGE
        rules_version = '2';

        service firebase.storage {
            match /b/{bucket}/o {
                match /{allPaths=**} {
                allow read;
                allow write:if
                    request.resource.size < 2 *1024 *1024 &&
                    request.resource.contentType.matches('image/.*');
                }
            }
        }
        */
        setImageFileUploading(true);
        setImageFileUploadError(null);
        const storage = getStorage(app);
        const fileName = new Date().getTime() + imageFile.name;
        const storageRef = ref(storage, fileName);
        const uploadTask = uploadBytesResumable(storageRef, imageFile);

        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setImageFileUploadProgress(progress.toFixed(0));
            },
            (error) => {
                setImageFileUploadError('No es posible cargar la imagen (El archivo debe ser menor a 2MB)');
                setImageFileUploadProgress(null);
                setImageFile(null);
                setImageFileUrl(null);
                setImageFileUploading(false);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    setImageFileUrl(downloadURL);
                    setFormData({ ...formData, profilePicture: downloadURL });
                    setImageFileUploading(false);
                });
            }
        );
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdateUserError(null);
        setUpdateUserSuccess(null);

        if (Object.keys(formData).length === 0) {
            setUpdateUserError('Ningún cambio realizado');
            return;
        }
        if (imageFileUploading) {
            setUpdateUserError('Por favor espere a que cargue la imagen');
            return;
        }
        try {
            dispatch(updateStart());
            const res = await fetch(`/api/user/update/${currentUser._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (!res.ok) {
                dispatch(updateFailure(data.message));
                setUpdateUserError(data.message);
            } else {
                dispatch(updateSuccess(data));
                setUpdateUserSuccess('Perfil de usuario actualizado correctamente');
            }
        } catch (error) {
            dispatch(updateFailure(error.message));
            setUpdateUserError(error.message);
        }
    };

    const handleDeleteUser = async () => {
        setShowModal(false);

        try {
            dispatch(deleteUserStart());
            const res = await fetch(`/api/user/delete/${currentUser._id}`, {
                method: 'DELETE',
            });

            const data = await res.json();

            if (!res.ok) {
                dispatch(deleteUserFailure(data.message));
            } else {
                dispatch(deleteUserSuccess(data));
            }
        } catch (error) {
            dispatch(deleteUserFailure(error.message));
        }
    };

    const handleSignout = async () => {
        try {
            const res = await fetch('/api/user/signout', {
                method: 'POST',
            });

            const data = await res.json();

            if (!res.ok) {
                console.log(data.message);
            } else {
                dispatch(signoutSuccess());
            }
        } catch (error) {
            console.log(error.message);

        }
    };

    return (
        <div className='min-h-screen bg-white dark:bg-white p-6 w-full'>
            <div className='w-full'>
                {/* Encabezado */}
                <div className='text-center mb-10'>
                    <h1 className='text-4xl font-bold text-gray-900 dark:text-gray-900 mb-2'>Mi Perfil</h1>
                    <p className='text-gray-600 dark:text-gray-600'>Gestiona tu información personal y acciones rápidas</p>
                </div>

                <div className='grid grid-cols-1 xl:grid-cols-3 gap-6 w-full'>
                    {/* Sección Izquierda - Perfil y Formulario */}
                    <div className='xl:col-span-2 w-full'>
                        <Card className='bg-white dark:bg-white shadow-lg'>
                            <form onSubmit={handleSubmit} className='space-y-6'>
                                {/* Foto de Perfil */}
                                <div>
                                    <label className='block text-sm font-semibold text-gray-700 dark:text-gray-700 mb-4 text-center'>Foto de Perfil</label>
                                    <input type="file" accept='image/*' onChange={handleImageChange} ref={filePickerRef} hidden />
                                    <div className='flex justify-center'>
                                        <div className='relative w-48 h-48 cursor-pointer shadow-md overflow-hidden rounded-full' onClick={() => filePickerRef.current.click()}>
                                            {imageFileUploadProgress && (
                                                <CircularProgressbar value={imageFileUploadProgress || 0} text={`${imageFileUploadProgress}%`}
                                                    strokeWidth={5}
                                                    styles={{
                                                        root: {
                                                            width: '100%',
                                                            height: '100%',
                                                            position: 'absolute',
                                                            top: 0,
                                                            left: 0,
                                                        },
                                                        path: {
                                                            stroke: `rgba(62,152,199, ${imageFileUploadProgress / 100})`,
                                                        }
                                                    }} />
                                            )}
                                            <img src={imageFileUrl || currentUser.profilePicture} alt="user" className={`rounded-full w-full h-full object-cover border-8 border-[lightgray] ${imageFileUploadProgress && imageFileUploadProgress < 100 && 'opacity-60'}`} />
                                        </div>
                                    </div>
                                    {imageFileUploadError && <Alert color='failure' className='mt-4'>
                                        {imageFileUploadError}
                                    </Alert>
                                    }
                                </div>

                                {/* Campos de Formulario */}
                                <div className='space-y-4'>
                                    <div>
                                        <label className='block text-sm font-medium text-gray-700 dark:text-gray-700 mb-2'>Usuario</label>
                                        <TextInput type='text' id='username' placeholder='Tu usuario' defaultValue={currentUser.username}
                                            onChange={handleChange}
                                            className='w-full'
                                        />
                                    </div>
                                    <div>
                                        <label className='block text-sm font-medium text-gray-700 dark:text-gray-700 mb-2'>Correo Electrónico</label>
                                        <TextInput type='email' id='email' placeholder='tu@correo.com' defaultValue={currentUser.email}
                                            onChange={handleChange}
                                            className='w-full'
                                        />
                                    </div>
                                    <div>
                                        <label className='block text-sm font-medium text-gray-700 dark:text-gray-700 mb-2'>Contraseña</label>
                                        <TextInput type='password' id='password' placeholder='Dejar en blanco para no cambiar'
                                            onChange={handleChange}
                                            className='w-full'
                                        />
                                    </div>
                                </div>

                                {/* Alertas */}
                                {updateUserSuccess && (
                                    <Alert color='success' className='mt-4'>
                                        {updateUserSuccess}
                                    </Alert>
                                )}
                                {updateUserError && (
                                    <Alert color='failure' className='mt-4'>
                                        {updateUserError}
                                    </Alert>
                                )}
                                {error && (
                                    <Alert color='failure' className='mt-4'>
                                        {error}
                                    </Alert>
                                )}

                                {/* Botón Actualizar */}
                                <Button
                                    type='submit'
                                    className='w-full bg-[#B076CE] dark:bg-[#B076CE] hover:bg-black dark:hover:bg-black text-white font-semibold py-3 rounded-lg transition-all'
                                    disabled={loading || imageFileUploading}
                                >
                                    {loading ? 'Actualizando...' : 'Actualizar Perfil'}
                                </Button>
                            </form>
                        </Card>
                    </div>

                    {/* Sección Derecha - Acciones Rápidas */}
                    <div className='space-y-4 w-full'>
                        {/* Acciones de Admin */}
                        {currentUser.isAdmin && (
                            <Card className='shadow-lg bg-gradient-to-br from-[#f0def8] to-[#ffffff] dark:from-[#f0def8] dark:to-[#ffffff]'>
                                <h2 className='text-lg font-bold text-black dark:text-black mb-4 flex items-center gap-2'>
                                    <HiOutlineDocumentText className='w-5 h-5' />
                                    Acciones Admin
                                </h2>
                                <div className='space-y-3'>
                                    <Link to={'/create-post'} className='block'>
                                        <Button
                                            type='button'
                                            className='w-full bg-[#B076CE] dark:bg-[#B076CE] hover:bg-black dark:hover:bg-black text-white font-semibold py-3 transition-all flex items-center justify-center gap-2'
                                        >
                                            <HiOutlineDocumentText className='w-5 h-5' />
                                            Crear Post / Cargar Revista
                                        </Button>
                                    </Link>
                                </div>
                            </Card>
                        )}

                        {/* Card de Cuenta */}
                        <Card className='shadow-lg dark:bg-white'>
                            <h2 className='text-lg font-bold text-black dark:text-black mb-4'>Gestión de Cuenta</h2>
                            <div className='space-y-3'>
                                <Button
                                    type='button'
                                    onClick={handleSignout}
                                    className='w-full bg-orange-600 hover:bg-orange-700 text-white dark:bg-orange-600 dark:hover:bg-orange-700 font-semibold py-2 transition-all flex items-center justify-center gap-2'
                                >
                                    <HiOutlineLogout className='w-5 h-5' />
                                    Cerrar Sesión
                                </Button>
                                <Button
                                    type='button'
                                    onClick={() => setShowModal(true)}
                                    className='w-full bg-red-600 hover:bg-red-700 text-white dark:bg-red-600 dark:hover:bg-red-700 font-semibold py-2 transition-all flex items-center justify-center gap-2'
                                >
                                    <HiOutlineTrash className='w-5 h-5' />
                                    Eliminar Cuenta
                                </Button>
                            </div>
                        </Card>

                        {/* Info de Usuario */}
                        <Card className='shadow-lg dark:bg-white'>
                            <h3 className='text-sm font-semibold text-gray-700 dark:text-gray-700 mb-3'>Información de Cuenta</h3>
                            <div className='space-y-2 text-sm'>
                                <p className='text-gray-600 dark:text-gray-600'><span className='font-medium'>ID:</span> {currentUser._id.slice(-8)}</p>
                                <p className='text-gray-600 dark:text-gray-600'><span className='font-medium'>Estado:</span> <span className={`px-2 py-1 rounded text-white text-xs ${currentUser.isAdmin ? 'bg-[#B076CE]' : 'bg-[#880fc5]'}`}>{currentUser.isAdmin ? 'Administrador' : 'Usuario'}</span></p>
                                <p className='text-gray-600 dark:text-gray-600'><span className='font-medium'>Miembro desde:</span> {new Date(currentUser.createdAt).toLocaleDateString()}</p>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Modal de Confirmación */}
            <Modal
                show={showModal}
                onClose={() => setShowModal(false)}
                popup
                size='md'>
                <ModalHeader />
                <ModalBody>
                    <div className='text-center'>
                        <HiOutlineExclamationCircle className='h-14 w-14 text-gray-500 dark:text-gray-200 mb-4 mx-auto' />
                        <h3 className='mb-5 text-lg font-semibold text-gray-800 dark:text-gray-200'>¿Eliminar cuenta?</h3>
                        <p className='text-sm text-gray-600 dark:text-gray-400 mb-6'>Esta acción no se puede deshacer. Todos tus datos serán eliminados permanentemente.</p>
                        <div className='flex justify-center gap-4'>
                            <Button color='red' onClick={handleDeleteUser} className='flex-1'>Sí, eliminar</Button>
                            <Button color='gray' onClick={() => setShowModal(false)} className='flex-1'>Cancelar</Button>
                        </div>
                    </div>
                </ModalBody>
            </Modal>
        </div>
    )
}
