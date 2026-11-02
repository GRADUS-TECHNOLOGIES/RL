import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function RecoverAccess() {
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [message, setMessage] = useState('');
    const [busy, setBusy] = useState(false);
    const [done, setDone] = useState(false);
    async function submit(event) {
        event.preventDefault(); setMessage('');
        if (password !== confirm) { setMessage('Las contraseñas no coinciden.'); return; }
        if (password.length < 12 || new TextEncoder().encode(password).length > 72) {
            setMessage('Usa al menos 12 caracteres y no más de 72 bytes.'); return;
        }
        setBusy(true);
        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: code.trim(), password }),
            });
            if (response.ok) { setDone(true); setCode(''); setPassword(''); setConfirm(''); setMessage('Tu contraseña se actualizó. Ya puedes iniciar sesión.'); }
            else if (response.status === 429) setMessage('Demasiados intentos. Espera 15 minutos y vuelve a intentarlo.');
            else setMessage('No fue posible usar el código. Comprueba que sea correcto y no haya vencido.');
        } catch { setMessage('No fue posible conectar. Inténtalo más tarde.'); }
        finally { setBusy(false); }
    }
    return <main className="mx-auto min-h-[65vh] max-w-lg px-6 py-12">
        <h1 className="text-3xl font-black text-gray-900">Recuperar acceso</h1>
        <p className="mt-4 text-sm text-gray-700">Contacta al administrador por el canal habitual para verificar tu identidad y recibir un código de un solo uso. No compartas tu contraseña.</p>
        {!done && <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block text-sm font-bold">Código de recuperación
                <input className="mt-1 block w-full border px-3 py-2 font-normal" autoComplete="off" required value={code} onChange={e => setCode(e.target.value)} />
            </label>
            <label className="block text-sm font-bold">Nueva contraseña
                <input className="mt-1 block w-full border px-3 py-2 font-normal" type="password" autoComplete="new-password" required value={password} onChange={e => setPassword(e.target.value)} />
            </label>
            <label className="block text-sm font-bold">Confirmar contraseña
                <input className="mt-1 block w-full border px-3 py-2 font-normal" type="password" autoComplete="new-password" required value={confirm} onChange={e => setConfirm(e.target.value)} />
            </label>
            <button disabled={busy} className="w-full bg-gray-900 px-4 py-3 text-sm font-bold text-white disabled:opacity-50">{busy ? 'Actualizando...' : 'Actualizar contraseña'}</button>
        </form>}
        {message && <p role="status" className="mt-4 text-sm">{message}</p>}
        <p className="mt-6"><Link className="text-sm underline" to="/sign-in">Volver a iniciar sesión</Link></p>
    </main>;
}
