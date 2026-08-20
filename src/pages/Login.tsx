import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import InputBox from '../components/InputBox';
import Button from '../components/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock, faGraduationCap } from '@fortawesome/free-solid-svg-icons';

const Login = () => {
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
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
                <InputBox name="user" type="text" placeholder="Ingrese usuario" />
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
                <InputBox name="password" type="password" placeholder="Ingrese contraseña" />
              </div>
            </div>
            <div>
              <Button type="submit" variant="primary" text="Ingresar" />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
