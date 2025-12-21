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
    const StatCard = ({ title, value, lastMonthValue, icon: Icon, color = 'bg-purple-600' }) => (
        <div className="bg-white dark:bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 dark:border-gray-700 group">
            <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                    <h3 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold mb-2">{title}</h3>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
                </div>
                <div className={`${color} text-white rounded-lg p-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="text-2xl" />
                </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
                <span className={`${lastMonthValue >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} flex items-center font-semibold`}>
                    <HiArrowNarrowUp className="mr-1" /> {Math.abs(lastMonthValue)}
                </span>
                <span className="text-gray-500 dark:text-gray-400">vs mes anterior</span>
            </div>
        </div>
    );

    return (
        <div className='p-4 md:p-8 w-full bg-white dark:bg-white min-h-screen'>
            {/* Encabezado */}
            <div className='mb-8'>
                <h1 className='text-3xl font-bold text-gray-900 dark:text-white mb-2'>Dashboard</h1>
                <p className='text-gray-600 dark:text-gray-400'>Resumen de la actividad y estadísticas principales</p>
            </div>

            {/* Sección de Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard 
                    title="Usuarios totales" 
                    value={totals.users} 
                    lastMonthValue={lastMonth.users} 
                    icon={HiOutlineUserGroup}
                    color="bg-[#B076CE]"
                />
                <StatCard 
                    title="Comentarios totales" 
                    value={totals.comments} 
                    lastMonthValue={lastMonth.comments} 
                    icon={HiAnnotation}
                    color="bg-[#B076CE]"
                />
                <StatCard 
                    title="Publicaciones totales" 
                    value={totals.posts} 
                    lastMonthValue={lastMonth.posts} 
                    icon={HiDocumentText}
                    color="bg-[#B076CE]"
                />
                <StatCard 
                    title="Revistas totales" 
                    value={totals.magazines} 
                    lastMonthValue={lastMonth.magazines} 
                    icon={HiBookOpen}
                    color="bg-[#B076CE]"
                />
            </div>

            {/* Sección de Tablas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tabla de Usuarios Recientes */}
                <div className='rounded-xl shadow-lg overflow-hidden bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300'>
                    <div className='flex justify-between items-center p-6 border-b dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-750'>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Usuarios recientes</h2>
                        <Button size="xs" className='bg-[#B076CE] hover:bg-black text-white border-0 rounded-lg transition-all'>
                            <Link to={'/dashboard?tab=users'}>Ver todos</Link>
                        </Button>
                    </div>
                    <div className="overflow-x-auto">
                        <Table hoverable className="w-full">
                            <TableHead>
                                <TableRow className="bg-gray-100 dark:bg-gray-700">
                                    <TableHeadCell className="w-12 py-3">Avatar</TableHeadCell>
                                    <TableHeadCell className="py-3 font-semibold">Usuario</TableHeadCell>
                                    <TableHeadCell className="py-3 font-semibold">Email</TableHeadCell>
                                </TableRow>
                            </TableHead>
                            <TableBody className="divide-y">
                                {users.length > 0 ? (
                                    users.map((user) => (
                                        <TableRow key={user._id} className="bg-white dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                            <TableCell>
                                                <img
                                                    src={user.profilePicture || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'} 
                                                    alt="user"
                                                    className="w-10 h-10 rounded-full object-cover bg-gray-200 border border-gray-300 dark:border-gray-600"
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
                                        <TableCell colSpan="3" className="text-center py-8 text-gray-500">
                                            No hay usuarios recientes
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Tabla de Comentarios Recientes */}
                <div className='rounded-xl shadow-lg overflow-hidden bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300'>
                    <div className='flex justify-between items-center p-6 border-b dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-750'>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Comentarios recientes</h2>
                        <Button size="xs" className='bg-[#B076CE] hover:bg-black text-white border-0 rounded-lg transition-all'>
                            <Link to={'/dashboard?tab=comments'}>Ver todos</Link>
                        </Button>
                    </div>
                    <div className="overflow-x-auto">
                        <Table hoverable className="w-full">
                            <TableHead>
                                <TableRow className="bg-gray-100 dark:bg-gray-700">
                                    <TableHeadCell className="py-3 font-semibold">Contenido</TableHeadCell>
                                    <TableHeadCell className="w-20 py-3 font-semibold text-center">Likes</TableHeadCell>
                                </TableRow>
                            </TableHead>
                            <TableBody className="divide-y">
                                {comments.length > 0 ? (
                                    comments.map((comment) => (
                                        <TableRow key={comment._id} className="bg-white dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                            <TableCell className="max-w-xs line-clamp-2 text-gray-600 dark:text-gray-300 text-sm py-3">
                                                {comment.content || 'Sin contenido'}
                                            </TableCell>
                                            <TableCell className="text-center font-semibold text-gray-900 dark:text-white py-3">{comment.numberOfLikes || 0}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan="2" className="text-center py-8 text-gray-500">
                                            No hay comentarios recientes
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Tabla de Publicaciones Recientes */}
                <div className='rounded-xl shadow-lg overflow-hidden bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300 lg:col-span-2'>
                    <div className='flex justify-between items-center p-6 border-b dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-750'>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Publicaciones recientes</h2>
                        <Button size="xs" className='bg-[#B076CE] hover:bg-black text-white border-0 rounded-lg transition-all'>
                            <Link to={'/dashboard?tab=posts'}>Ver todas</Link>
                        </Button>
                    </div>
                    <div className="overflow-x-auto">
                        <Table hoverable className="w-full">
                            <TableHead>
                                <TableRow className="bg-gray-100 dark:bg-gray-700">
                                    <TableHeadCell className="w-20 py-3 font-semibold">Media</TableHeadCell>
                                    <TableHeadCell className="py-3 font-semibold">Título</TableHeadCell>
                                    <TableHeadCell className="w-40 py-3 font-semibold">Categoría</TableHeadCell>
                                    <TableHeadCell className="w-24 py-3 font-semibold">Tipo</TableHeadCell>
                                </TableRow>
                            </TableHead>
                            <TableBody className="divide-y">
                                {posts.length > 0 ? (
                                    posts.map((post) => (
                                        <TableRow key={post._id} className="bg-white dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                            <TableCell>
                                                {post.pdf ? (
                                                    <div className="flex items-center justify-center bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900 dark:to-red-800 w-14 h-10 rounded-lg border border-red-200 dark:border-red-700">
                                                        <span className="text-xs font-bold text-red-600 dark:text-red-300">PDF</span>
                                                    </div>
                                                ) : (
                                                    <img
                                                        src={post.image || 'https://via.placeholder.com/100x80'} 
                                                        alt="Post"
                                                        className="w-14 h-10 rounded-lg object-cover bg-gray-200 border border-gray-300 dark:border-gray-600"
                                                    />
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium text-gray-900 dark:text-white max-w-xs truncate py-3">
                                                {post.title || 'Sin título'}
                                            </TableCell>
                                            <TableCell className="text-gray-600 dark:text-gray-400 capitalize py-3">
                                                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs font-medium">
                                                    {post.category || 'Sin categoría'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="py-3">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                    post.pdf 
                                                        ? 'bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-200' 
                                                        : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                                                }`}>
                                                    {post.pdf ? 'Revista' : 'Artículo'}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan="4" className="text-center py-8 text-gray-500">
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