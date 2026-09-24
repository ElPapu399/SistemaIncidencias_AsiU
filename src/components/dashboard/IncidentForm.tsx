import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faSpinner, faCamera, faTrash } from '@fortawesome/free-solid-svg-icons';
import type { Categoria, Ubicacion, Prioridad } from '../../types/incident';
import {
  crearIncidencia,
  obtenerCategorias,
  obtenerUbicaciones,
  obtenerPrioridades,
  subirAdjunto,
} from '../../services/incidenciasService';
import { getCurrentUser } from '../../utils/auth';

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

  // Imagen / Evidencia
  const [archivo, setArchivo] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [prioridades, setPrioridades] = useState<Prioridad[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Usuario actual
  const usuario = getCurrentUser();
  const estudianteId = usuario?.id;
  const isEstudiante = usuario?.rol === 'ESTUDIANTE';

  useEffect(() => {
    if (!isOpen) return;

    setError('');
    setTitulo('');
    setDescripcion('');
    setCategoriaId(0);
    setPrioridadId(0);
    setUbicacionId(0);
    setArchivo(null);
    setPreviewUrl(null);

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
    } else {
      // Si la categoría no tiene prioridad por defecto, asignar Media o la primera disponible
      const fallbackPrio = prioridades.find((p) => p.nivel === 'Media') || prioridades[0];
      if (fallbackPrio) {
        setPrioridadId(fallbackPrio.id);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('La imagen no debe superar los 10 MB.');
      return;
    }

    setArchivo(file);
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleRemoveFile = () => {
    setArchivo(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    let effectivePrioridadId = prioridadId;
    if (isEstudiante && (!effectivePrioridadId || effectivePrioridadId === 0)) {
      const cat = categorias.find((c) => c.id === categoriaId);
      effectivePrioridadId = cat?.prioridadDefecto?.id || prioridades.find((p) => p.nivel === 'Media')?.id || prioridades[0]?.id || 1;
      setPrioridadId(effectivePrioridadId);
    }

    if (!titulo.trim() || !descripcion.trim() || !categoriaId || (!isEstudiante && !effectivePrioridadId) || !ubicacionId) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    if (!estudianteId) {
      setError('No se encontró la sesión de usuario. Vuelve a iniciar sesión.');
      return;
    }

    setLoading(true);

    try {
      const nuevaIncidencia: any = await crearIncidencia({
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        categoriaId,
        prioridadId: effectivePrioridadId,
        ubicacionId,
        estudianteId,
      });

      // Subir archivo adjunto si el usuario seleccionó una imagen
      if (archivo && nuevaIncidencia?.id) {
        try {
          await subirAdjunto(nuevaIncidencia.id, archivo, estudianteId);
        } catch (uploadErr) {
          console.warn('Incidencia creada pero falló la subida de evidencia:', uploadErr);
        }
      }

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

            {isEstudiante ? (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
                  <span>Prioridad</span>
                  <span className="text-[10px] text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    Asignada por sistema
                  </span>
                </label>
                <div className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 flex items-center justify-between text-sm">
                  <span className="text-xs text-slate-400">
                    {categoriaId ? 'Nivel asignado:' : 'Elige una categoría'}
                  </span>
                  {(() => {
                    const prioridadObj = prioridades.find((p) => p.id === prioridadId);
                    if (!prioridadObj) {
                      return <span className="text-xs text-slate-500 italic">Automática</span>;
                    }
                    const badgeColor =
                      prioridadObj.nivel === 'Alta'
                        ? 'bg-red-500/20 text-red-400 border-red-500/30'
                        : prioridadObj.nivel === 'Media'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
                    return (
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${badgeColor}`}>
                        {prioridadObj.nivel} ({prioridadObj.tiempoMaximoHoras}h máx)
                      </span>
                    );
                  })()}
                </div>
              </div>
            ) : (
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
            )}
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

          {/* Adjuntar imagen de evidencia */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FontAwesomeIcon icon={faCamera} className="text-amber-400" />
                Evidencia fotográfica (Opcional)
              </span>
              <span className="text-[11px] font-normal text-slate-500">JPG, PNG, WEBP (Máx. 10MB)</span>
            </label>

            {!previewUrl ? (
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-700 hover:border-amber-500/60 rounded-xl cursor-pointer bg-slate-800/40 hover:bg-slate-800/80 transition-all duration-200 group">
                <div className="flex flex-col items-center justify-center text-center px-4">
                  <div className="w-8 h-8 rounded-full bg-slate-700/50 group-hover:bg-amber-500/20 flex items-center justify-center text-slate-400 group-hover:text-amber-400 transition-colors mb-1">
                    <FontAwesomeIcon icon={faCamera} className="text-xs" />
                  </div>
                  <p className="text-xs text-slate-300 font-medium">
                    <span className="text-amber-400 font-semibold underline decoration-amber-400/40 underline-offset-2">Haz clic para subir una foto</span> o arrastra aquí
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative flex items-center gap-3 p-3 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-900 border border-slate-700 shrink-0 flex items-center justify-center">
                  <img
                    src={previewUrl}
                    alt="Vista previa"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">{archivo?.name}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {archivo ? (archivo.size / 1024 < 1024 ? `${(archivo.size / 1024).toFixed(1)} KB` : `${(archivo.size / (1024 * 1024)).toFixed(2)} MB`) : ''}
                  </p>
                  <span className="inline-block px-1.5 py-0.5 mt-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold rounded">
                    Foto lista para adjuntar
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  title="Eliminar imagen"
                  className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center transition-colors"
                >
                  <FontAwesomeIcon icon={faTrash} className="text-xs" />
                </button>
              </div>
            )}
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
