import { Button, Modal, ModalBody, ModalHeader, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from 'flowbite-react';
import { useEffect, useState } from "react";
import { useSelector } from 'react-redux';
import { HiOutlineExclamationCircle } from 'react-icons/hi';

export default function DashComments() {
    const { currentUser } = useSelector((state) => state.user);
    const [comments, setComments] = useState([]);
    const [showMore, setShowMore] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [commentIdToDelete, setCommentIdToDelete] = useState('');

    // Cargar comentarios
    useEffect(() => {
        const fetchComments = async () => {
            try {
                const res = await fetch(`/api/comment/getcomments`);
                const data = await res.json();
                if (res.ok) {
                    setComments(data.comments);
                    if (data.comments.length < 9) {
                        setShowMore(false);
                    }
                }
            } catch (error) {
                console.log(error.message);
            }
        };
        if (currentUser.isAdmin) {
            fetchComments();
        }
    }, [currentUser.isAdmin]);

    // Cargar más comentarios
    const handleShowMore = async () => {
        const startIndex = comments.length;
        try {
            const res = await fetch(`/api/comment/getcomments?startIndex=${startIndex}`);
            const data = await res.json();
            if (res.ok) {
                setComments((prev) => [...prev, ...data.comments]);
                if (data.comments.length < 9) {
                    setShowMore(false);
                }
            }
        } catch (error) {
            console.log(error.message);
        }
    };

    // Eliminar comentario
    const handleDeleteComment = async () => {
        if (!commentIdToDelete) {
            console.error("No se proporcionó un ID de comentario para eliminar.");
            return;
        }

        try {
            const res = await fetch(`/api/comment/deleteComment/${commentIdToDelete}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (res.ok) {
                setComments((prev) => prev.filter((comment) => comment._id !== commentIdToDelete));
                setShowModal(false);
                setCommentIdToDelete('');
                if (comments.length <= 1) {
                    setShowMore(false);
                }
            } else {
                console.log(data.message || "Error al eliminar el comentario");
            }
        } catch (error) {
            console.log(error.message || "Error inesperado al eliminar el comentario");
        }
    };

    return (
        <div className='table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500'>
            {currentUser.isAdmin && comments.length > 0 ? (
                <>
                    <Table hoverable className='shadow-md'>
                        <TableHead>
                            <TableRow>
                                <TableHeadCell className='text-gray-700 font-semibold dark:text-white'>Fecha de creación</TableHeadCell>
                                <TableHeadCell className='text-gray-700 font-semibold dark:text-white'>Contenido</TableHeadCell>
                                <TableHeadCell className='text-gray-700 font-semibold dark:text-white'>Likes</TableHeadCell>
                                <TableHeadCell className='text-gray-700 font-semibold dark:text-white'>Post Id</TableHeadCell>
                                <TableHeadCell className='text-gray-700 font-semibold dark:text-white'>User Id</TableHeadCell>
                                <TableHeadCell className='text-gray-700 font-semibold dark:text-white'>Eliminar</TableHeadCell>
                            </TableRow>
                        </TableHead>
                        {comments.map((comment) => (
                            <TableBody className='divide-y' key={comment._id}>
                                <TableRow className='bg-white dark:border-gray-700 dark:bg-gray-800'>
                                    <TableCell>
                                        {new Date(comment.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        {comment.content}
                                    </TableCell>
                                    <TableCell>
                                        {comment.numberOfLikes}
                                    </TableCell>
                                    <TableCell>
                                        {comment.postId}
                                    </TableCell>
                                    <TableCell>
                                        {comment.userId}
                                    </TableCell>
                                    <TableCell>
                                        <span
                                            onClick={() => {
                                                setShowModal(true);
                                                setCommentIdToDelete(comment._id); // Usar setCommentIdToDelete
                                            }}
                                            className='font-medium text-red-500 hover:text-red-700 hover:underline cursor-pointer'
                                        >
                                            Eliminar
                                        </span>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        ))}
                    </Table>
                    {
                        showMore && (
                            <button
                                onClick={handleShowMore}
                                className='w-full text-[#b076ce] self-center text-sm py-4 hover:text-[#a855f7] hover:underline cursor-pointer'
                            >
                                Mostrar más
                            </button>
                        )
                    }
                </>
            ) : (
                <p>No hay comentarios aún....</p>
            )}
            {/* Modal de confirmación */}
            <Modal show={showModal} onClose={() => setShowModal(false)} popup size='md'>
                <ModalHeader />
                <ModalBody>
                    <div className='text-center'>
                        <HiOutlineExclamationCircle className='h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto' />
                        <h3 className='mb-5 text-lg text-gray-500 dark:text-gray-400'>
                            ¿Estás seguro que deseas eliminar este comentario?
                        </h3>
                        <div className='flex justify-center gap-4'>
                            <Button color='failure' onClick={handleDeleteComment}>
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