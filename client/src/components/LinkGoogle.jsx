import { useState } from 'react';
import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth';
import { app } from '../firebase';

export default function LinkGoogle() {
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const submit = async (event) => {
        event.preventDefault(); setLoading(true); setMessage('');
        try {
            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({ prompt: 'login' });
            const auth = getAuth(app);
            const result = await signInWithPopup(auth, provider);
            const idToken = await result.user.getIdToken();
            const response = await fetch('/api/auth/link-google', {
                method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password, idToken }),
            });
            const data = await response.json();
            setMessage(data.message || 'No fue posible vincular la cuenta.');
        } catch { setMessage('No fue posible vincular la cuenta. Intenta nuevamente.'); }
        finally { setPassword(''); setLoading(false); }
    };
    return <form onSubmit={submit} className="space-y-2 border border-gray-200 p-4">
        <label className="block text-xs font-bold" htmlFor="link-google-password">Contraseña actual para vincular Google</label>
        <input id="link-google-password" type="password" autoComplete="current-password" required value={password}
            onChange={event => setPassword(event.target.value)} className="w-full border border-gray-300 text-sm" />
        <button type="submit" disabled={loading} className="border border-gray-900 px-4 py-2 text-xs font-bold disabled:opacity-50">
            {loading ? 'Vinculando...' : 'Vincular cuenta de Google'}
        </button>
        {message && <p role="status" className="text-sm">{message}</p>}
    </form>;
}
