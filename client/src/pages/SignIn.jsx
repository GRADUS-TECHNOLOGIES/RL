import { Alert, Button, Label, Spinner, TextInput } from 'flowbite-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signinStart, signinSuccess, signinFailure } from '../redux/user/userSlice';
import OAuth from '../components/OAuth';

export default function SignIn() {
    // Hook para acceder al dispatch de Redux
    const dispatch = useDispatch();

    useEffect(() => {
        document.title = 'Ingresar - Revista Legislatura';

        // Limpiar error al cargar el componente
        dispatch(signinFailure(null));
    }, [dispatch]);

    // Estado para almacenar los datos del formulario
    const [formData, setFormData] = useState({});

    // Obtener el estado de carga y error desde Redux
    const { loading, error: errorMessage } = useSelector((state) => state.user);

    // Hook para navegar entre rutas
    const navigate = useNavigate();

    // Función para manejar el cambio en los campos de entrada
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
    };

    // Función para manejar el envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevenir el comportamiento por defecto del formulario

        // Mostrar mensaje de error si los campos están vacíos
        if (!formData.email || !formData.password) {
            return dispatch(signinFailure('Por favor completa todos los campos')); // Manejar el error de campos vacíos con Redux
        }

        // Try-catch para enviar los datos al servidor
        try {
            dispatch(signinStart()); // Iniciar el proceso de inicio de sesión con Redux

            const res = await fetch('/api/auth/signin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json(); // Convertir la respuesta a JSON

            if (data.success == false) {
                dispatch(signinFailure(data.message)); // Manejar el error de inicio de sesión con Redux
            }

            if (res.ok) {
                dispatch(signinSuccess(data)); // Manejar el inicio de sesión exitoso con Redux
                navigate('/'); // Redirigir al usuario a la página de inicio de sesión
            }
        } catch (error) {
            dispatch(signinFailure(error.message)); // Manejar el error de conexión con Redux
        }
    }

    return (
        <div className="min-h-screen flex items-center">
            <div className="flex p-3 max-w-3xl mx-auto flex-col md:flex-row md:items-center gap-5">
                {/* Columna de la izquierda */}
                <div className="flex-1">
                    <Link to="/" className="font-bold dark:text-white text-4xl">
                        <img src="/logoSingInUp.svg" alt="RL Logo" className='h-50 w-auto' />
                    </Link>
                    <p className="font-bold italic text-sm mt-5">
                        Sé parte de la transformación en información legislativa de México
                    </p>
                </div>

                {/* Columna de la derecha */}
                <div className="flex-1">
                    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                        <div>
                            <Label htmlFor="email" value="Your email">Tu correo</Label>
                            <TextInput type="email" placeholder="nombre@dominio.com" id="email" onChange={handleChange} />
                        </div>
                        <div>
                            <Label htmlFor="password" value="Your password">Tu contraseña</Label>
                            <TextInput type="password" placeholder="********" id="password" onChange={handleChange} />
                        </div>
                        <Button type="submit" className='bg-[#b076ce] hover:bg-black hover:text-[#b076ce] rounded-tl-xl rounded-bl-none transition-all' disabled={loading}>
                            {
                                loading ? (
                                    <>
                                        <Spinner size='sm' />
                                        <span className='pl-3'>Cargando...</span>
                                    </>
                                ) : 'INGRESAR'
                            }
                        </Button>

                        {/* Botón de Google */}
                        <OAuth />
                    </form>
                    <div className="flex gap-2 text-sm mt-5">
                        <span>¿No tienes cuenta?</span>
                        <Link to="/sign-up" className="text-[#b076ce] hover:text-black hover:underline transition-all duration-300">
                            Registrarme
                        </Link>
                    </div>

                    {/* Mensaje de error si existe */}
                    {errorMessage && (
                        <Alert color="failure" className="mt-5">
                            {errorMessage}
                        </Alert>
                    )}
                </div>
            </div>
        </div>
    );
}