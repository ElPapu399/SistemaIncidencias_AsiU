import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import InputBox from '../components/InputBox';
import Button from '../components/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock, faGraduationCap, faSpinner } from '@fortawesome/free-solid-svg-icons';

const Login = () => {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, password }),
      });

      if (response.ok) {
        const usuario = await response.json();
        // Guardar datos del usuario en sessionStorage para uso en otras páginas
        sessionStorage.setItem('usuario', JSON.stringify(usuario));
        navigate('/dashboard');
      } else {
        const msg = await response.text();
        setError(msg || 'Correo o contraseña incorrectos');
      }
    } catch {
      setError('No se pudo conectar al servidor. ¿Está corriendo el backend?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20 mb-4">
            <FontAwesomeIcon icon={faGraduationCap} className="text-slate-950 text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-white">ASIU</h1>
          <p className="text-sm text-slate-400 mt-1">
            Sistema de Atención y Seguimiento de Incidencias Universitarias
          </p>
        </div>

        <div className="bg-gray-900/70 backdrop-blur-xl border border-slate-700/50 p-9 rounded-3xl w-full relative">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="relative w-full">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
                Usuario
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

            {/* Mensaje de error */}
            {error && (
              <div className="text-red-400 text-sm bg-red-950/40 border border-red-800/50 rounded-xl px-4 py-3">
                {error}
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
        </div>
      </div>
    </div>
  );
};

export default Login;
