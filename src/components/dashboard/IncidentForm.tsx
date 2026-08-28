import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faSpinner } from '@fortawesome/free-solid-svg-icons';
import type { Categoria, Ubicacion, Prioridad } from '../../types/incident';
import {
  crearIncidencia,
  obtenerCategorias,
  obtenerUbicaciones,
  obtenerPrioridades,
} from '../../services/incidenciasService';

interface IncidentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function IncidentFormModal({ isOpen, onClose, onSave }: IncidentFormProps) {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoriaId, setCategoriaId] = useState<number>(0);
  const [prioridadId, setPrioridadId] = useState<number>(0);
  const [ubicacionId, setUbicacionId] = useState<number>(0);

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [prioridades, setPrioridades] = useState<Prioridad[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Usuario actual
  const usuarioGuardado = sessionStorage.getItem('usuario');
  const usuario = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
  const estudianteId = usuario?.id;

  useEffect(() => {
    if (!isOpen) return;

    setError('');
    setTitulo('');
    setDescripcion('');
    setCategoriaId(0);
    setPrioridadId(0);
    setUbicacionId(0);

    Promise.all([
      obtenerCategorias(),
      obtenerUbicaciones(),
      obtenerPrioridades(),
    ])
      .then(([catData, ubiData, prioData]) => {
        setCategorias(catData);
        setUbicaciones(ubiData);
        setPrioridades(prioData);
      })
      .catch((err) => {
        console.error(err);
        setError('No se pudieron cargar los catálogos.');
      });
  }, [isOpen]);

  const handleCategoriaChange = (selectedCatId: number) => {
    setCategoriaId(selectedCatId);
    const cat = categorias.find((c) => c.id === selectedCatId);
    if (cat?.prioridadDefecto?.id) {
      setPrioridadId(cat.prioridadDefecto.id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!titulo.trim() || !descripcion.trim() || !categoriaId || !prioridadId || !ubicacionId) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    if (!estudianteId) {
      setError('No se encontró la sesión de usuario. Vuelve a iniciar sesión.');
      return;
    }

    setLoading(true);

    try {
      await crearIncidencia({
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        categoriaId,
        prioridadId,
        ubicacionId,
        estudianteId,
      });

      onSave();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al registrar la incidencia.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-xl mx-4 overflow-hidden z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h3 className="text-lg font-bold text-white">Registrar Nueva Incidencia</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Título de la incidencia *
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-yellow-500/50 transition-colors"
              placeholder="Ej: Computadora 12 no da imagen o proyector desconectado"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Descripción detallada *
            </label>
            <textarea
              rows={3}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-yellow-500/50 transition-colors"
              placeholder="Describe lo que sucede con el equipo o servicio..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Categoría *
              </label>
              <select
                value={categoriaId}
                onChange={(e) => handleCategoriaChange(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500/50 transition-colors"
              >
                <option value={0} disabled>
                  Seleccionar categoría
                </option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} {c.especialidad ? `(${c.especialidad.nombre})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Prioridad *
              </label>
              <select
                value={prioridadId}
                onChange={(e) => setPrioridadId(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500/50 transition-colors"
              >
                <option value={0} disabled>
                  Seleccionar prioridad
                </option>
                {prioridades.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nivel} ({p.tiempoMaximoHoras}h máx)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Ubicación *
            </label>
            <select
              value={ubicacionId}
              onChange={(e) => setUbicacionId(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500/50 transition-colors"
            >
              <option value={0} disabled>
                Seleccionar aula / laboratorio
              </option>
              {ubicaciones.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.pabellon} - {u.aulaLaboratorio} (Piso {u.piso}, {u.tipo})
                </option>
              ))}
            </select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-400 text-sm bg-red-950/40 border border-red-800/50 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-slate-950 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-orange-500/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Crear incidencia'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
