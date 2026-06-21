import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import OAuth from '../components/OAuth';

// ── Panel editorial izquierdo (solo desktop) ───────────────────────────────

function LeftPanel() {
    return (
        <div className="hidden lg:flex flex-col justify-between bg-gray-950 text-white px-10 xl:px-14 py-12">
            <div>
                <Link to="/">
                    <img
                        src="/logoFooter.svg"
                        alt="Revista Legislatura"
                        className="h-14 w-auto opacity-90 mb-8"
                    />
                </Link>
                <div className="space-y-[3px] mb-6">
                    <div className="h-[3px] bg-white" />
                    <div className="h-[2px] bg-[#B076CE]" />
                </div>
                <h2 className="text-3xl xl:text-4xl font-black text-white leading-tight mb-4">
                    Revista<br />Legislatura
                </h2>
                <p className="text-gray-400 text-sm font-light leading-relaxed max-w-[260px]">
                    La primera publicación especializada en materia legislativa y política en México.
                </p>
            </div>

            <div className="space-y-3 my-10">
                {['Análisis legislativo', 'Política electoral', 'Noticias de impacto'].map((t) => (
                    <div key={t} className="flex items-center gap-3">
                        <div className="w-[2px] h-4 bg-[#B076CE] flex-shrink-0" />
                        <span className="text-sm text-gray-300 font-light">{t}</span>
                    </div>
                ))}
            </div>

            <div>
                <div className="h-px bg-white/10 mb-4" />
                <p className="text-[10px] text-gray-600 font-light">
                    © {new Date().getFullYear()} Revista Legislatura · IMEPOL
                </p>
            </div>
        </div>
    );
}

// ── Cabecera compacta móvil ────────────────────────────────────────────────

function MobileHeader() {
    return (
        <div className="lg:hidden bg-gray-950 text-white px-6 py-6 flex items-center justify-between">
            <Link to="/">
                <img src="/logoFooter.svg" alt="Revista Legislatura" className="h-9 w-auto opacity-90" />
            </Link>
            <p className="text-[10px] text-gray-500 font-light tracking-widest uppercase">
                Política · Legislativo
            </p>
        </div>
    );
}

// ── Spinner inline ─────────────────────────────────────────────────────────

function Spinner() {
    return (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
    );
}

// ── Componente principal ───────────────────────────────────────────────────

export default function SignUp() {
    const navigate                          = useNavigate();
    const [formData, setFormData]           = useState({});
    const [errorMessage, setErrorMessage]   = useState(null);
    const [loading, setLoading]             = useState(false);

    useEffect(() => {
        document.title = 'Registro – Revista Legislatura';
    }, []);

    const handleChange = (e) =>
        setFormData({ ...formData, [e.target.id]: e.target.value.trim() });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.username || !formData.email || !formData.password) {
            return setErrorMessage('Por favor completa todos los campos.');
        }
        try {
            setLoading(true);
            setErrorMessage(null);
            const res  = await fetch('/api/auth/signup', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(formData),
            });
            const data = await res.json();
            if (data.success === false) return setErrorMessage(data.message);
            setLoading(false);
            if (res.ok) navigate('/sign-in');
        } catch {
            setErrorMessage('Error de conexión. Inténtalo más tarde.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[420px_1fr]">

            {/* Panel izquierdo */}
            <LeftPanel />

            {/* Panel derecho */}
            <div className="flex flex-col">
                <MobileHeader />

                <div className="flex flex-1 items-center justify-center px-6 py-12">
                    <div className="w-full max-w-md">

                        {/* Etiqueta de sección */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-[2px] h-4 bg-[#B076CE] flex-shrink-0" />
                            <span className="text-[10px] font-black text-[#B076CE] uppercase tracking-[0.3em]">
                                Crear cuenta
                            </span>
                            <div className="flex-1 h-px bg-gray-200" />
                        </div>

                        <h1 className="text-3xl font-black text-gray-900 mb-1">Únete a la comunidad</h1>
                        <p className="text-sm text-gray-400 font-light mb-8">
                            Accede a contenido exclusivo de análisis legislativo
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-5">

                            {/* Usuario */}
                            <div>
                                <label
                                    htmlFor="username"
                                    className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1.5"
                                >
                                    Nombre de usuario
                                </label>
                                <input
                                    id="username"
                                    type="text"
                                    autoComplete="username"
                                    placeholder="tuusuario"
                                    onChange={handleChange}
                                    className="w-full border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-300 placeholder:font-light outline-none focus:border-[#B076CE] transition-colors duration-200 bg-white"
                                />
                            </div>

                            {/* Correo */}
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1.5"
                                >
                                    Correo electrónico
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="nombre@dominio.com"
                                    onChange={handleChange}
                                    className="w-full border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-300 placeholder:font-light outline-none focus:border-[#B076CE] transition-colors duration-200 bg-white"
                                />
                            </div>

                            {/* Contraseña */}
                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1.5"
                                >
                                    Contraseña
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    autoComplete="new-password"
                                    placeholder="••••••••"
                                    onChange={handleChange}
                                    className="w-full border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-300 outline-none focus:border-[#B076CE] transition-colors duration-200 bg-white"
                                />
                            </div>

                            {/* Error inline */}
                            {errorMessage && (
                                <p className="text-xs text-red-500 font-light">{errorMessage}</p>
                            )}

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-gray-900 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#B076CE] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <Spinner />
                                        <span>Creando cuenta...</span>
                                    </>
                                ) : 'Registrarme'}
                            </button>

                            {/* Separador */}
                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-px bg-gray-100" />
                                <span className="text-[10px] text-gray-400 font-light">o continúa con</span>
                                <div className="flex-1 h-px bg-gray-100" />
                            </div>

                            <OAuth />
                        </form>

                        <p className="mt-7 text-sm text-gray-500 font-light">
                            ¿Ya tienes cuenta?{' '}
                            <Link
                                to="/sign-in"
                                className="text-[#B076CE] font-semibold hover:text-gray-900 transition-colors"
                            >
                                Ingresar →
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
