import { GoogleAuthProvider, signInWithRedirect, getAuth, getRedirectResult } from 'firebase/auth';
import { app } from '../firebase';
import { useDispatch } from 'react-redux';
import { signinSuccess } from '../redux/user/userSlice';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function OAuth() {
    const auth     = getAuth(app);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [pending, setPending] = useState(false);
    const [error, setError]     = useState(null);

    // Procesa el resultado cuando Google redirige de vuelta a la app
    useEffect(() => {
        const handleRedirect = async () => {
            try {
                const result = await getRedirectResult(auth);
                if (!result) return; // No hay redirect pendiente

                setPending(true);
                const user = result.user;
                const res  = await fetch('/api/auth/google', {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body:    JSON.stringify({
                        name:           user.displayName,
                        email:          user.email,
                        googlePhotoUrl: user.photoURL,
                    }),
                });
                const data = await res.json();
                if (res.ok) {
                    dispatch(signinSuccess(data));
                    navigate('/');
                } else {
                    setError(data.message || 'Error al iniciar sesión');
                }
            } catch (err) {
                if (err.code !== 'auth/no-current-user') {
                    setError('Error al procesar el inicio de sesión con Google');
                    console.error(err);
                }
            } finally {
                setPending(false);
            }
        };

        handleRedirect();
    }, []);

    const handleGoogleClick = async () => {
        try {
            setError(null);
            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({ prompt: 'select_account' });
            await signInWithRedirect(auth, provider);
        } catch (err) {
            console.error('Error al iniciar redirect:', err);
            setError('No se pudo iniciar sesión con Google');
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <button
                type="button"
                onClick={handleGoogleClick}
                disabled={pending}
                className="w-full flex items-center justify-center gap-3 py-3 border border-gray-200 text-gray-600 text-[10px] font-black uppercase tracking-[0.2em] hover:border-[#B076CE] hover:text-[#B076CE] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
                {pending ? (
                    <svg className="animate-spin w-4 h-4 text-[#B076CE]" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                ) : (
                    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                )}
                {pending ? 'Iniciando sesión...' : 'Continuar con Google'}
            </button>

            {error && (
                <p className="text-[10px] text-red-400 font-light text-center">{error}</p>
            )}
        </div>
    );
}
