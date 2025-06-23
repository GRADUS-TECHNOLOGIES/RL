import { Button } from 'flowbite-react';
import { AiFillGoogleCircle } from 'react-icons/ai';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getAuth } from 'firebase/auth';
import { app } from '../firebase';
import { useDispatch } from 'react-redux';
import { signinSuccess } from '../redux/user/userSlice';
import { useNavigate } from 'react-router-dom';

export default function OAuth() {
    const auth = getAuth(app);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Maneja el inicio de sesión con Google
    const handleGoogleClick = async () => {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });

        try {
            const resultFromGoogle = await signInWithPopup(auth, provider);

            const user = resultFromGoogle.user;

            // Envía los datos a tu backend
            const res = await fetch('/api/auth/google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: user.displayName,
                    email: user.email,
                    googlePhotoUrl: user.photoURL,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                dispatch(signinSuccess(data));
                navigate('/');
            } else {
                console.error('Error en el servidor:', data.message || 'Inicio de sesión fallido');
            }
        } catch (error) {
            console.error('Error al iniciar sesión con Google:', error.message);
        }
    };

    return (
        <Button
            type='button'
            outline
            onClick={handleGoogleClick}
            className="flex items-center justify-center w-full text-black border-black hover:bg-[#b076ce] hover:border-[#b076ce] hover:text-white rounded-tl-xl rounded-bl-none transition-all"
        >
            <AiFillGoogleCircle className="w-6 h-6 mr-2" />
            CONTINUAR CON GOOGLE
        </Button>
    );
}