import { Button, Modal, ModalBody, ModalHeader, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from 'flowbite-react';
import { useEffect, useState } from "react";
import { useSelector } from 'react-redux';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import { FaCheck, FaTimes } from 'react-icons/fa';

export default function DashUsers() {
    const { currentUser } = useSelector((state) => state.user);
    const [users, setUsers] = useState([]);
    const [showMore, setShowMore] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [userIdToDelete, setUserIdToDelete] = useState('');

    // Cargar usuarios iniciales o adicionales
    const fetchUsers = async (startIndex = 0) => {
        try {
            const res = await fetch(`/api/user/getusers?startIndex=${startIndex}`);
            const data = await res.json();

            if (res.ok) {
                if (startIndex === 0) {
                    setUsers(data.users);
                } else {
                    setUsers(prev => [...prev, ...data.users]);
                }

                if (data.users.length < 9) {
                    setShowMore(false);
                }
            }
        } catch (error) {
            console.error('Error fetching users:', error.message);
        }
    };

    // Cargar usuarios al iniciar el componente
    useEffect(() => {
        if (currentUser?.isAdmin) {
            fetchUsers();
        }
    }, [currentUser?.isAdmin]);

    // Manejar carga de más usuarios
    const handleShowMore = () => {
        fetchUsers(users.length);
    };

    // Cambiar rol de usuario
    const handleToggleAdmin = async (userId, currentAdminStatus) => {
        if (!userId) return;

        try {
            const res = await fetch(`/api/user/updateUserRole/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ isAdmin: !currentAdminStatus }),
            });

            const data = await res.json();

            if (res.ok && data.user) {
                setUsers((prev) =>
                    prev.map((u) =>
                        u._id === userId ? data.user : u
                    )
                );
            } else {
                console.error('Error en el servidor:', data.message || 'No se pudo actualizar');
            }
        } catch (error) {
            console.error('Error al cambiar rol:', error.message);
        }
    };

    // Eliminar usuario
    const handleDeleteUser = async () => {
        try {
            const res = await fetch(`/api/user/delete/${userIdToDelete}`, {
                method: 'DELETE',
            });
            const data = await res.json();

            if (res.ok) {
                setUsers(prev => prev.filter(user => user._id !== userIdToDelete));
                setShowModal(false);
                setUserIdToDelete('');
                if (users.length <= 1) {
                    setShowMore(false);
                }
            } else {
                console.error(data.message || 'Error deleting user');
            }
        } catch (error) {
            console.error('Error deleting user:', error.message);
        }
    };

    return (
        <div className='table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500'>
            {currentUser?.isAdmin && users.length > 0 ? (
                <>
                    {/* Tabla de usuarios */}
                    <Table hoverable className='shadow-md'>
                        <TableHead>
                            <TableRow>
                                <TableHeadCell className='text-gray-700 font-semibold dark:text-white'>Fecha de creación</TableHeadCell>
                                <TableHeadCell className='text-gray-700 font-semibold dark:text-white'>Imagen</TableHeadCell>
                                <TableHeadCell className='text-gray-700 font-semibold dark:text-white'>Nombre de usuario</TableHeadCell>
                                <TableHeadCell className='text-gray-700 font-semibold dark:text-white'>Correo electrónico</TableHeadCell>
                                <TableHeadCell className='text-gray-700 font-semibold dark:text-white'>Admin</TableHeadCell>
                                <TableHeadCell className='text-gray-700 font-semibold dark:text-white'>Hacer admin</TableHeadCell>
                                <TableHeadCell className='text-gray-700 font-semibold dark:text-white'>Eliminar</TableHeadCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {users.map((user) => (
                                <TableRow
                                    key={user._id}
                                    className='bg-white hover:bg-[#f3e8ff] transition-colors duration-200'
                                >
                                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <img
                                            src={user.profilePicture}
                                            alt={user.username}
                                            className='w-10 h-10 object-cover bg-gray-200 rounded-full'
                                        />
                                    </TableCell>
                                    <TableCell className='font-medium text-gray-900'>{user.username}</TableCell>
                                    <TableCell className='text-gray-600 dark:text-gray-400'>{user.email}</TableCell>
                                    <TableCell>
                                        {user.isAdmin ? (
                                            <span className='flex items-center gap-1 text-green-500'>
                                                <FaCheck /> Sí
                                            </span>
                                        ) : (
                                            <span className='flex items-center gap-1 text-red-500'>
                                                <FaTimes /> No
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <label className="inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only"
                                                checked={user.isAdmin}
                                                onChange={() => handleToggleAdmin(user._id, user.isAdmin)}
                                            />
                                            <div
                                                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ease-in-out ${user.isAdmin ? 'bg-green-500' : 'bg-gray-300'
                                                    }`}
                                            >
                                                <div
                                                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${user.isAdmin ? 'translate-x-5' : 'translate-x-0'
                                                        }`}
                                                ></div>
                                            </div>
                                        </label>
                                    </TableCell>
                                    <TableCell>
                                        <span
                                            onClick={() => {
                                                setShowModal(true);
                                                setUserIdToDelete(user._id);
                                            }}
                                            className='font-medium text-red-500 hover:text-red-700 hover:underline cursor-pointer'
                                        >
                                            Eliminar
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {/* Botón para cargar más usuarios */}
                    {showMore && (
                        <button
                            onClick={handleShowMore}
                            className='w-full text-[#b076ce] self-center text-sm py-4 hover:text-[#a855f7] hover:underline cursor-pointer'
                        >
                            Mostrar más
                        </button>
                    )}
                </>
            ) : (
                <p className='text-center py-6 text-gray-500'>No hay usuarios aún...</p>
            )}

            {/* Modal de confirmación */}
            <Modal show={showModal} onClose={() => setShowModal(false)} popup size='md'>
                <ModalHeader />
                <ModalBody>
                    <div className='text-center'>
                        <HiOutlineExclamationCircle className='h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto' />
                        <h3 className='mb-5 text-lg text-gray-500 dark:text-gray-400'>
                            ¿Estás seguro que deseas eliminar este usuario?
                        </h3>
                        <div className='flex justify-center gap-4'>
                            <Button color='failure' onClick={handleDeleteUser}>
                                Sí, estoy seguro
                            </Button>
                            <Button color='gray' onClick={() => setShowModal(false)}>
                                No, cancelar
                            </Button>
                        </div>
                    </div>
                </ModalBody>
            </Modal>
        </div>
    );
}
