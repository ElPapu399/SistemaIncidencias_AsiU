import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import InputBox from '../components/InputBox';
import Button from '../components/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faLock,
  faGraduationCap,
  faSpinner,
  faKey,
  faEnvelope,
} from '@fortawesome/free-solid-svg-icons';
import { API_BASE } from '../config/api';
import { saveSession, isLoggedIn, onSessionChange } from '../utils/auth';

type AuthView = 'login' | 'recuperar' | 'restablecer';

const parseApiError = async (response: Response, fallback: string) => {
  const rawText = await response.text();
  try {
    const parsed = JSON.parse(rawText);
    return parsed.error || parsed.message || parsed.mensaje || rawText || fallback;
  } catch {
    return rawText?.trim() ? rawText : fallback;
  }
};

const Login = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<AuthView>('login');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [codigo, setCodigo] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [codigoDemo, setCodigoDemo] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn()) {
      navigate('/dashboard', { replace: true });
    }

    const unsubscribe = onSessionChange((user) => {
      if (user && user.token) {
        navigate('/dashboard', { replace: true });
      }
    });

    return unsubscribe;
  }, [navigate]);

  const resetMessages = () => {
    setError('');
    setSuccess('');
  };

  const goToLogin = () => {
    setView('login');
    setCodigo('');
    setNuevaPassword('');
    setConfirmarPassword('');
    setCodigoDemo('');
    resetMessages();
  };

  const goToRecuperar = () => {
    setView('recuperar');
    setPassword('');
    setCodigo('');
    setNuevaPassword('');
    setConfirmarPassword('');
    setCodigoDemo('');
    resetMessages();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, password }),
      });

      if (response.ok) {
        const usuario = await response.json();
        saveSession(usuario);
        navigate('/dashboard');
      } else {
        setError(await parseApiError(response, 'Correo o contraseña incorrectos'));
      }
    } catch {
      setError('No se pudo conectar al servidor. ¿Está corriendo el backend?');
    } finally {
      setLoading(false);
    }
  };

  const handleRecuperar = async (e: FormEvent) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/recuperar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo }),
      });

      if (response.ok) {
        const data = await response.json();
        setCodigoDemo(data.codigo || '');
        setView('restablecer');
        setSuccess(data.mensaje || 'Revisa tu correo e ingresa el código de verificación.');
      } else {
        setError(await parseApiError(response, 'No se pudo iniciar la recuperación'));
      }
    } catch {
      setError('No se pudo conectar al servidor. ¿Está corriendo el backend?');
    } finally {
      setLoading(false);
    }
  };

  const handleRestablecer = async (e: FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (nuevaPassword !== confirmarPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (nuevaPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/restablecer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, codigo, nuevaPassword }),
      });

      if (response.ok) {
        const data = await response.json();
        setView('login');
        setPassword('');
        setCodigo('');
        setNuevaPassword('');
        setConfirmarPassword('');
        setCodigoDemo('');
        setSuccess(data.mensaje || 'Contraseña actualizada. Ya puedes iniciar sesión.');
      } else {
        setError(await parseApiError(response, 'No se pudo restablecer la contraseña'));
      }
    } catch {
      setError('No se pudo conectar al servidor. ¿Está corriendo el backend?');
    } finally {
      setLoading(false);
    }
  };

  const titles = {
    login: {
      heading: 'Iniciar sesión',
      subtitle: 'Ingresa con tu correo institucional',
    },
    recuperar: {
      heading: 'Recuperar contraseña',
      subtitle: 'Te enviaremos un código a tu correo institucional',
    },
    restablecer: {
      heading: 'Nueva contraseña',
      subtitle: 'Ingresa el código y define tu nueva contraseña',
    },
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative bg-blue-700 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/70 to-transparent" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-300/20 rounded-full" />
        <div className="absolute top-24 -left-20 w-64 h-64 bg-blue-500/20 rounded-full" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-15 h-15 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20 mb-4">
              <FontAwesomeIcon icon={faGraduationCap} className="text-slate-950 text-2xl" />
            </div>
            <div>
              <div className="text-white font-extrabold text-2xl -mt-4">ASIU</div>
              <div className="text-blue-300 text-xs">Sistema de Incidencias Universitarias</div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="text-white text-5xl font-bold">
              Gestión eficiente de <br />
              <span className="text-yellow-500">incidencias tecnológicas</span>
            </div>
            <p className="text-blue-200/80 text-base leading-relaxed max-w-sm">Plataforma centralizada para reportar, asignar y resolver problemas técincos en laboratorios universitarios</p>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-4">
            {[
              { v: "98%", l: "Incidencias resueltas" },
              { v: "<2h", l: "Tiempo promedio" },
              { v: "5", l: "Laboratorios activos" },
            ].map(s => (
              <div key={s.l} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <div className="text-white text-2xl font-bold">{s.v}</div>
                <div className="text-blue-300 text-xs mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-blue-200/70 text-xs">© 2024 Universidad Tecnológica del Perú · ASIU v1.0</p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-white">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20 mb-4">
              <FontAwesomeIcon icon={faGraduationCap} className="text-slate-950 text-xl" />
            </div>
            <div>
              <div className="font-extrabold text-xl text-foreground">ASIU</div>
              <p className="text-xs text-slate-400">
                Sistema de Incidencias Universitarias
              </p>
            </div>
          </div>

          <div className="mb-8">
            <div className="text-2xl font-bold text-black">{titles[view].heading}</div>
            <p className="text-black">{titles[view].subtitle}</p>
          </div>

          <div className="bg-gray-900/70 backdrop-blur-xl border border-slate-700/50 p-9 rounded-3xl w-full relative">
            {view === 'login' && (
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="relative w-full">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 z-10">
                      <FontAwesomeIcon icon={faUser} />
                    </span>
                    <InputBox
                      name="correo"
                      type="email"
                      placeholder="Ingrese su correo"
                      value={correo}
                      onChange={(e) => setCorreo(e.target.value)}
                    />
                  </div>
                </div>
                <div className="relative w-full">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
                    Contraseña
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 z-10">
                      <FontAwesomeIcon icon={faLock} />
                    </span>
                    <InputBox
                      name="password"
                      type="password"
                      placeholder="Ingrese contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-end -mt-2">
                  <button
                    type="button"
                    onClick={goToRecuperar}
                    className="text-sm text-yellow-400 hover:text-yellow-300 font-semibold cursor-pointer"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>

                {error && (
                  <div className="text-red-400 text-sm bg-red-950/40 border border-red-800/50 rounded-xl px-4 py-3">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="text-emerald-300 text-sm bg-emerald-950/40 border border-emerald-800/50 rounded-xl px-4 py-3">
                    {success}
                  </div>
                )}

                <div>
                  <Button
                    type="submit"
                    variant="primary"
                    text={loading ? '' : 'Ingresar'}
                    disabled={loading}
                    icon={loading ? <FontAwesomeIcon icon={faSpinner} spin /> : undefined}
                  />
                </div>
              </form>
            )}

            {view === 'recuperar' && (
              <form className="space-y-5" onSubmit={handleRecuperar}>
                <div className="relative w-full">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
                    Correo institucional
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 z-10">
                      <FontAwesomeIcon icon={faEnvelope} />
                    </span>
                    <InputBox
                      name="correo-recuperar"
                      type="email"
                      placeholder="Ingrese su correo"
                      value={correo}
                      onChange={(e) => setCorreo(e.target.value)}
                    />
                  </div>
                </div>

                {error && (
                  <div className="text-red-400 text-sm bg-red-950/40 border border-red-800/50 rounded-xl px-4 py-3">
                    {error}
                  </div>
                )}

                <div>
                  <Button
                    type="submit"
                    variant="primary"
                    text={loading ? '' : 'Enviar código'}
                    disabled={loading}
                    icon={loading ? <FontAwesomeIcon icon={faSpinner} spin /> : undefined}
                  />
                </div>

                <button
                  type="button"
                  onClick={goToLogin}
                  className="w-full text-sm text-slate-300 hover:text-white font-medium cursor-pointer"
                >
                  Volver al inicio de sesión
                </button>
              </form>
            )}

            {view === 'restablecer' && (
              <form className="space-y-5" onSubmit={handleRestablecer}>
                {codigoDemo && (
                  <div className="text-yellow-200 text-sm bg-yellow-950/40 border border-yellow-700/50 rounded-xl px-4 py-3">
                    Código de verificación (demostración): <span className="font-bold tracking-widest">{codigoDemo}</span>
                  </div>
                )}

                <div className="relative w-full">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
                    Código de verificación
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 z-10">
                      <FontAwesomeIcon icon={faKey} />
                    </span>
                    <InputBox
                      name="codigo"
                      type="text"
                      placeholder="Ingrese el código de 6 dígitos"
                      value={codigo}
                      onChange={(e) => setCodigo(e.target.value)}
                    />
                  </div>
                </div>

                <div className="relative w-full">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
                    Nueva contraseña
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 z-10">
                      <FontAwesomeIcon icon={faLock} />
                    </span>
                    <InputBox
                      name="nueva-password"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={nuevaPassword}
                      onChange={(e) => setNuevaPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="relative w-full">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
                    Confirmar contraseña
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 z-10">
                      <FontAwesomeIcon icon={faLock} />
                    </span>
                    <InputBox
                      name="confirmar-password"
                      type="password"
                      placeholder="Repita la nueva contraseña"
                      value={confirmarPassword}
                      onChange={(e) => setConfirmarPassword(e.target.value)}
                    />
                  </div>
                </div>

                {error && (
                  <div className="text-red-400 text-sm bg-red-950/40 border border-red-800/50 rounded-xl px-4 py-3">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="text-emerald-300 text-sm bg-emerald-950/40 border border-emerald-800/50 rounded-xl px-4 py-3">
                    {success}
                  </div>
                )}

                <div>
                  <Button
                    type="submit"
                    variant="primary"
                    text={loading ? '' : 'Restablecer contraseña'}
                    disabled={loading}
                    icon={loading ? <FontAwesomeIcon icon={faSpinner} spin /> : undefined}
                  />
                </div>

                <button
                  type="button"
                  onClick={goToLogin}
                  className="w-full text-sm text-slate-300 hover:text-white font-medium cursor-pointer"
                >
                  Volver al inicio de sesión
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
