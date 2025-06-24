import { Alert, Button, Label, Spinner, TextInput } from 'flowbite-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import OAuth from '../components/OAuth';

export default function SignUp() {
    useEffect(() => {
        document.title = 'Registro - Revista Legislatura';
    }, []);

    // Estado para almacenar los datos del formulario
    const [formData, setFormData] = useState({});

    // Estado para almacenar el error del formulario
    const [errorMessage, setErrorMessage] = useState(null);

    // Estado para almacenar el estado de carga
    const [loading, setLoading] = useState(false);

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
        if (!formData.username || !formData.email || !formData.password) {
            return setErrorMessage('Por favor completa todos los campos');
        }

        // Try-catch para enviar los datos al servidor
        try {
            setLoading(true); // Cambiar el estado de carga a verdadero
            setErrorMessage(null); // Limpiar el mensaje de error

            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json(); // Convertir la respuesta a JSON

            if (data.success == false) {
                // Si la respuesta es un error, mostrar el mensaje de error
                return setErrorMessage(data.message);
            }

            setLoading(false); // Cambiar el estado de carga a falso

            if (res.ok) {
                navigate('/sign-in'); // Redirigir al usuario a la página de inicio de sesión
            }
        } catch (error) {
            // Si hay un error en la conexión, mostrar el mensaje de error
            setErrorMessage('Error de conexión, por favor intentelo despues');
            setLoading(false); // Cambiar el estado de carga a falso
        }
    }

    return (
        <div className="min-h-screen flex items-center">
            <div className="flex p-3 max-w-3xl mx-auto flex-col md:flex-row md:items-center gap-5">
                {/* Columna de la izquierda */}
                <div className="flex-1">
                    <Link to="/" className="font-bold dark:text-white text-4xl">
                        <Link to="/" className="font-bold dark:text-white text-4xl">
                            <img src="/logoSingInUp.svg" alt="RL Logo" className='h-50 w-auto' />
                        </Link>
                        <p className="font-bold italic text-sm mt-5">
                            Sé parte de la transformación en información legislativa de México
                        </p>
                    </Link>
                </div>

                {/* Columna de la derecha */}
                <div className="flex-1">
                    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                        <div>
                            <Label htmlFor="username" value="Your username" className='dark:text-black'>Tu ususario</Label>
                            <TextInput type="text" placeholder="Usuario" id="username" onChange={handleChange} />
                        </div>
                        <div>
                            <Label htmlFor="email" value="Your email" className='dark:text-black'>Tu correo</Label>
                            <TextInput type="email" placeholder="nombre@dominio.com" id="email" onChange={handleChange} />
                        </div>
                        <div>
                            <Label htmlFor="password" value="Your password" className='dark:text-black'>Tu contraseña</Label>
                            <TextInput type="password" placeholder="Contraseña" id="password" onChange={handleChange} />
                        </div>
                        <Button type="submit" className='bg-[#b076ce] hover:bg-black hover:text-[#b076ce] rounded-tl-xl rounded-bl-none transition-all' disabled={loading}>
                            {
                                loading ? (
                                    <>
                                        <Spinner size='sm' />
                                        <span className='pl-3'>Cargando...</span>
                                    </>
                                ) : 'REGISTRARME'
                            }
                        </Button>

                        {/* Botón de Google */}
                        <OAuth />
                    </form>
                    <div className="flex gap-2 text-sm mt-5">
                        <span>¿Tienes cuenta?</span>
                        <Link to="/sign-in" className="text-[#b076ce] hover:text-black hover:underline transition-all duration-300">
                            Iniciar sesión
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
