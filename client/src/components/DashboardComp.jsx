import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
    HiAnnotation,
    HiArrowNarrowUp,
    HiDocumentText,
    HiOutlineUserGroup,
    HiBookOpen
} from 'react-icons/hi';
import { Button, Table, TableHead, TableHeadCell, TableBody, TableRow, TableCell } from 'flowbite-react';
import { Link } from 'react-router-dom';

export default function DashboardComp() {
    const [users, setUsers] = useState([]);
    const [comments, setComments] = useState([]);
    const [posts, setPosts] = useState([]);
    const [totals, setTotals] = useState({
        users: 0,
        posts: 0,
        comments: 0,
        magazines: 0
    });
    const [lastMonth, setLastMonth] = useState({
        users: 0,
        posts: 0,
        comments: 0,
        magazines: 0
    });
    const { currentUser } = useSelector((state) => state.user);

    useEffect(() => {
        const fetchData = async () => {
            if (!currentUser.isAdmin) return;

            try {
                // Fetch users
                const usersRes = await fetch('/api/user/getusers?limit=5');
                const usersData = await usersRes.json();
                if (usersRes.ok) {
                    setUsers(usersData.users);
                    setTotals(prev => ({...prev, users: usersData.totalUsers}));
                    setLastMonth(prev => ({...prev, users: usersData.lastMonthUsers}));
                }

                // Fetch posts
                const postsRes = await fetch('/api/post/getposts?limit=5');
                const postsData = await postsRes.json();
                if (postsRes.ok) {
                    setPosts(postsData.posts);
                    const magazines = postsData.posts.filter(post => post.pdf);
                    
                    setTotals(prev => ({
                        ...prev, 
                        posts: postsData.totalPosts,
                        magazines: magazines.length
                    }));
                    
                    setLastMonth(prev => ({
                        ...prev,
                        posts: postsData.lastMonthPosts,
                        magazines: Math.floor(magazines.length * 0.7) // Temporal - debería venir del backend
                    }));
                }

                // Fetch comments
                const commentsRes = await fetch('/api/comment/getcomments?limit=5');
                const commentsData = await commentsRes.json();
                if (commentsRes.ok) {
                    setComments(commentsData.comments);
                    setTotals(prev => ({...prev, comments: commentsData.totalComments}));
                    setLastMonth(prev => ({...prev, comments: commentsData.lastMonthComments}));
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            }
        };

        fetchData();
    }, [currentUser]);

    // Componente reutilizable para las tarjetas de estadísticas
    const StatCard = ({ title, value, lastMonthValue, icon: Icon, color = '[#b076ce]' }) => (
        <div className="flex flex-col p-4 bg-white dark:bg-gray-800 gap-3 shadow-md rounded-lg w-full sm:w-auto flex-1 min-w-[200px]">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xs uppercase text-black dark:text-gray-400">{title}</h3>
                    <p className="text-2xl font-bold dark:text-white">{value}</p>
                </div>
                <div className={`bg-${color} text-white rounded-full p-3 shadow-md`}>
                    <Icon className="text-2xl" />
                </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
                <span className={`${lastMonthValue >= 0 ? 'text-green-500' : 'text-red-500'} flex items-center`}>
                    <HiArrowNarrowUp className="mr-1" /> {Math.abs(lastMonthValue)}
                </span>
                <span className="text-gray-500 dark:text-gray-400">vs mes anterior</span>
            </div>
        </div>
    );

    return (
        <div className='p-3 md:px-6 max-w-full mx-auto'>
            {/* Sección de Estadísticas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mb-8">
                <StatCard 
                    title="Usuarios totales" 
                    value={totals.users} 
                    lastMonthValue={lastMonth.users} 
                    icon={HiOutlineUserGroup} 
                />
                <StatCard 
                    title="Comentarios totales" 
                    value={totals.comments} 
                    lastMonthValue={lastMonth.comments} 
                    icon={HiAnnotation} 
                />
                <StatCard 
                    title="Publicaciones totales" 
                    value={totals.posts} 
                    lastMonthValue={lastMonth.posts} 
                    icon={HiDocumentText} 
                />
                <StatCard 
                    title="Revistas totales" 
                    value={totals.magazines} 
                    lastMonthValue={lastMonth.magazines} 
                    icon={HiBookOpen} 
                />
            </div>

            {/* Sección de Tablas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tabla de Usuarios Recientes */}
                <div className='shadow-md rounded-lg bg-white dark:bg-gray-800 overflow-hidden'>
                    <div className='flex justify-between items-center p-4 border-b dark:border-gray-700'>
                        <h1 className="text-lg font-semibold dark:text-white">Usuarios recientes</h1>
                        <Button size="xs" outline className='border-gray-300 text-gray-700 dark:text-gray-300 hover:bg-[#b076ce] hover:border-[#b076ce]'>
                            <Link to={'/dashboard?tab=users'}>Ver todos</Link>
                        </Button>
                    </div>
                    <div className="overflow-x-auto">
                        <Table hoverable className="w-full">
                            <TableHead>
                                <TableRow className="bg-gray-50 dark:bg-gray-700">
                                    <TableHeadCell className="w-12">Avatar</TableHeadCell>
                                    <TableHeadCell>Usuario</TableHeadCell>
                                    <TableHeadCell>Email</TableHeadCell>
                                </TableRow>
                            </TableHead>
                            <TableBody className="divide-y">
                                {users.length > 0 ? (
                                    users.map((user) => (
                                        <TableRow key={user._id} className="bg-white dark:bg-gray-800 dark:border-gray-700">
                                            <TableCell>
                                                <img
                                                    src={user.profilePicture || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'} 
                                                    alt="user"
                                                    className="w-8 h-8 rounded-full object-cover bg-gray-200"
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                                {user.username || 'Anónimo'}
                                            </TableCell>
                                            <TableCell className="text-gray-600 dark:text-gray-400 text-sm">
                                                {user.email || 'Sin correo'}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan="3" className="text-center py-4 text-gray-500">
                                            No hay usuarios recientes
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Tabla de Comentarios Recientes */}
                <div className='shadow-md rounded-lg bg-white dark:bg-gray-800 overflow-hidden'>
                    <div className='flex justify-between items-center p-4 border-b dark:border-gray-700'>
                        <h1 className="text-lg font-semibold dark:text-white">Comentarios recientes</h1>
                        <Button size="xs" outline className='border-gray-300 text-gray-700 dark:text-gray-300 hover:bg-[#b076ce] hover:border-[#b076ce]'>
                            <Link to={'/dashboard?tab=comments'}>Ver todos</Link>
                        </Button>
                    </div>
                    <div className="overflow-x-auto">
                        <Table hoverable className="w-full">
                            <TableHead>
                                <TableRow className="bg-gray-50 dark:bg-gray-700">
                                    <TableHeadCell>Contenido</TableHeadCell>
                                    <TableHeadCell className="w-20">Likes</TableHeadCell>
                                </TableRow>
                            </TableHead>
                            <TableBody className="divide-y">
                                {comments.length > 0 ? (
                                    comments.map((comment) => (
                                        <TableRow key={comment._id} className="bg-white dark:bg-gray-800 dark:border-gray-700">
                                            <TableCell className="max-w-xs line-clamp-2 text-gray-600 dark:text-gray-300 text-sm">
                                                {comment.content || 'Sin contenido'}
                                            </TableCell>
                                            <TableCell className="text-center">{comment.numberOfLikes || 0}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan="2" className="text-center py-4 text-gray-500">
                                            No hay comentarios recientes
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Tabla de Publicaciones Recientes (ocupa todo el ancho) */}
                <div className='shadow-md rounded-lg bg-white dark:bg-gray-800 overflow-hidden lg:col-span-2'>
                    <div className='flex justify-between items-center p-4 border-b dark:border-gray-700'>
                        <h1 className="text-lg font-semibold dark:text-white">Publicaciones recientes</h1>
                        <Button size="xs" outline className='border-gray-300 text-gray-700 dark:text-gray-300 hover:bg-[#b076ce] hover:border-[#b076ce]'>
                            <Link to={'/dashboard?tab=posts'}>Ver todas</Link>
                        </Button>
                    </div>
                    <div className="overflow-x-auto">
                        <Table hoverable className="w-full">
                            <TableHead>
                                <TableRow className="bg-gray-50 dark:bg-gray-700">
                                    <TableHeadCell className="w-20">Media</TableHeadCell>
                                    <TableHeadCell>Título</TableHeadCell>
                                    <TableHeadCell className="w-40">Categoría</TableHeadCell>
                                    <TableHeadCell className="w-24">Tipo</TableHeadCell>
                                </TableRow>
                            </TableHead>
                            <TableBody className="divide-y">
                                {posts.length > 0 ? (
                                    posts.map((post) => (
                                        <TableRow key={post._id} className="bg-white dark:bg-gray-800 dark:border-gray-700">
                                            <TableCell>
                                                {post.pdf ? (
                                                    <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-700 w-12 h-10 rounded-md">
                                                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">PDF</span>
                                                    </div>
                                                ) : (
                                                    <img
                                                        src={post.image || 'https://via.placeholder.com/100x80'} 
                                                        alt="Post"
                                                        className="w-12 h-10 rounded-md object-cover bg-gray-200"
                                                    />
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium text-gray-900 dark:text-white max-w-xs truncate">
                                                {post.title || 'Sin título'}
                                            </TableCell>
                                            <TableCell className="text-gray-600 dark:text-gray-400 capitalize">
                                                {post.category || 'Sin categoría'}
                                            </TableCell>
                                            <TableCell className="text-gray-600 dark:text-gray-400">
                                                {post.pdf ? 'Revista' : 'Artículo'}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan="4" className="text-center py-4 text-gray-500">
                                            No hay publicaciones recientes
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </div>
    );
}