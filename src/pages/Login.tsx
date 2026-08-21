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
    <div className="flex min-h-screen">
      {/* Panel Izquierdo */}
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
              Gestión eficiente de <br/>
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

      {/* Panel derecho */}
      <div className="flex flex-1 items-center justify-center bg-white">
        <div className="w-full max-w-md">
          {/* Logo Móvil */}
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
            <div className="text-2xl font-bold text-black">Iniciar sesión</div>
            <p className="text-black">Ingresa con tu correo institucional</p>
          </div>

          <div className="bg-gray-900/70 backdrop-blur-xl border border-slate-700/50 p-9 rounded-3xl w-full relative">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="relative w-full">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
                  Correo Electrónico
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
              <div className="flex items-center justify-between">
                <button type="button" className="text-sm hover:text-base hover:underline font-medium transition-all duration-200">
                  <p className="text-blue-300 hover:text-red-400 transition-colors">¿Olvidaste tu contraseña?</p>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
