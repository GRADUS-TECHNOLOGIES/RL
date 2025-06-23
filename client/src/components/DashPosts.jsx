import {
    Button,
    Modal,
    ModalBody,
    ModalHeader,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeadCell,
    TableRow,
} from 'flowbite-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { HiOutlineExclamationCircle } from 'react-icons/hi';

export default function DashPosts() {
    const { currentUser } = useSelector((state) => state.user);
    const [userPosts, setUserPosts] = useState([]);
    const [showMore, setShowMore] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [postIdToDelete, setPostIdToDelete] = useState('');

    const fetchPosts = async (startIndex = 0) => {
        try {
            const res = await fetch(`/api/post/getposts?userId=${currentUser._id}&startIndex=${startIndex}`);
            const data = await res.json();
            if (res.ok) {
                setUserPosts((prev) => [...prev, ...data.posts]);
                setShowMore(data.posts.length >= 9);
            }
        } catch (error) {
            console.error(error.message);
        }
    };

    useEffect(() => {
        if (currentUser?.isAdmin) {
            setUserPosts([]);      // Limpia antes de cargar
            fetchPosts();          // Carga desde el inicio
        }
    }, [currentUser._id]);


    const handleReloadPosts = async () => {
        setUserPosts([]);
        await fetchPosts();
    };

    const handleDeletePost = async () => {
        try {
            const res = await fetch(`/api/post/deletepost/${postIdToDelete}/${currentUser._id}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (res.ok) {
                setUserPosts((prev) => prev.filter((post) => post._id !== postIdToDelete));
                setShowModal(false);
            } else {
                console.log(data.message || 'Error deleting post');
            }
        } catch (error) {
            console.log(error.message);
        }
    };

    return (
        <div className='table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500'>
            {currentUser?.isAdmin && userPosts.length > 0 ? (
                <>
                    <Button color="red" onClick={handleReloadPosts} className="mb-4">
                        Recargar Posts
                    </Button>

                    <Table hoverable className='shadow-md'>
                        <TableHead>
                            <TableRow>
                                <TableHeadCell className='text-gray-700 font-semibold'>Fecha</TableHeadCell>
                                <TableHeadCell className='text-gray-700 font-semibold'>Imagen/PDF</TableHeadCell>
                                <TableHeadCell className='text-gray-700 font-semibold'>Título</TableHeadCell>
                                <TableHeadCell className='text-gray-700 font-semibold'>Categoría</TableHeadCell>
                                <TableHeadCell className='text-gray-700 font-semibold'>Tipo</TableHeadCell>
                                <TableHeadCell className='text-gray-700 font-semibold'>Eliminar</TableHeadCell>
                                <TableHeadCell className='text-gray-700 font-semibold'>Editar</TableHeadCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {userPosts.map((post) => (
                                <TableRow key={post._id} className='bg-white hover:bg-[#f3e8ff] transition-colors duration-200'>
                                    <TableCell>{new Date(post.updatedAt).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        {post.pdf ? (
                                            <div className="flex items-center justify-center bg-gray-200 w-20 h-10 rounded">
                                                <span className="text-sm font-medium text-gray-600">PDF</span>
                                            </div>
                                        ) : (
                                            <Link to={`/post/${post.slug}`} className="block">
                                                <img
                                                    src={post.image}
                                                    alt={post.title}
                                                    className='w-20 h-10 object-cover rounded bg-gray-200'
                                                />
                                            </Link>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Link
                                            className='font-medium text-gray-900 dark:text-white hover:text-[#b076ce]'
                                            to={`/post/${post.slug}`}
                                        >
                                            {post.title}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{post.category}</TableCell>
                                    <TableCell>
                                        <span className="text-sm font-medium">{post.pdf ? 'Revista' : 'Artículo'}</span>
                                    </TableCell>
                                    <TableCell>
                                        <span
                                            onClick={() => {
                                                setShowModal(true);
                                                setPostIdToDelete(post._id);
                                            }}
                                            className='font-medium text-red-500 hover:text-red-700 hover:underline cursor-pointer'
                                        >
                                            Eliminar
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Link
                                            className='text-[#b076ce] hover:text-[#a855f7] hover:underline font-medium'
                                            to={`/update-post/${post._id}`}
                                        >
                                            Editar
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {showMore && (
                        <button
                            onClick={() => fetchPosts(userPosts.length)}
                            className='w-full text-[#b076ce] self-center text-sm py-4 hover:text-[#a855f7] hover:underline cursor-pointer'
                        >
                            Mostrar más
                        </button>
                    )}
                </>
            ) : (
                <p className='text-center py-6 text-gray-500'>No hay publicaciones aún...</p>
            )}

            {/* Modal Confirmación */}
            <Modal show={showModal} onClose={() => setShowModal(false)} popup size='md'>
                <ModalHeader />
                <ModalBody>
                    <div className='text-center'>
                        <HiOutlineExclamationCircle className='h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto' />
                        <h3 className='mb-5 text-lg text-gray-500 dark:text-gray-400'>
                            ¿Estás seguro que deseas eliminar este post?
                        </h3>
                        <div className='flex justify-center gap-4'>
                            <Button color='failure' onClick={handleDeletePost}>
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

