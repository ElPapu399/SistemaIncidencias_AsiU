import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPaperPlane,
  faSpinner,
  faCamera,
  faTrash,
  faCircleCheck,
  faArrowLeft,
  faShieldHalved,
} from '@fortawesome/free-solid-svg-icons';
import Header from '../components/dashboard/Header';
import type { Categoria, Ubicacion, Prioridad } from '../types/incident';
import {
  crearIncidencia,
  obtenerCategorias,
  obtenerUbicaciones,
  obtenerPrioridades,
  subirAdjunto,
} from '../services/incidenciasService';
import { getCurrentUser } from '../utils/auth';

export default function NuevaIncidenciaPage() {
  const navigate = useNavigate();

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoriaId, setCategoriaId] = useState<number>(0);
  const [prioridadId, setPrioridadId] = useState<number>(0);
  const [ubicacionId, setUbicacionId] = useState<number>(0);

  // Evidencia
  const [archivo, setArchivo] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [prioridades, setPrioridades] = useState<Prioridad[]>([]);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const usuario = getCurrentUser();
  const estudianteId = usuario?.id;

  useEffect(() => {
    setLoading(true);
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
        setError('No se pudieron cargar los catálogos del servidor.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleCategoriaChange = (selectedCatId: number) => {
    setCategoriaId(selectedCatId);
    const cat = categorias.find((c) => c.id === selectedCatId);
    if (cat?.prioridadDefecto?.id) {
      setPrioridadId(cat.prioridadDefecto.id);
    } else {
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

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
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

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    let effectivePrioridadId = prioridadId;
    if (!effectivePrioridadId || effectivePrioridadId === 0) {
      const cat = categorias.find((c) => c.id === categoriaId);
      effectivePrioridadId = cat?.prioridadDefecto?.id || prioridades.find((p) => p.nivel === 'Media')?.id || prioridades[0]?.id || 1;
      setPrioridadId(effectivePrioridadId);
    }

    if (!titulo.trim() || !descripcion.trim() || !categoriaId || !ubicacionId) {
      setError('Por favor completa todos los campos requeridos (*).');
      return;
    }

    if (!estudianteId) {
      setError('No se encontró la sesión de usuario. Vuelve a iniciar sesión.');
      return;
    }

    setSubmitting(true);

    try {
      const nuevaIncidencia: any = await crearIncidencia({
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        categoriaId,
        prioridadId: effectivePrioridadId,
        ubicacionId,
        estudianteId,
      });

      if (archivo && nuevaIncidencia?.id) {
        try {
          await subirAdjunto(nuevaIncidencia.id, archivo, estudianteId);
        } catch (uploadErr) {
          console.warn('Incidencia creada pero falló la subida de evidencia:', uploadErr);
        }
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Error al registrar la incidencia.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header
        title="Registrar Nueva Incidencia"
        subtitle="Reporta averías o problemas técnicos en laboratorios o aulas del campus universitario."
      />

      <main className="flex-1 overflow-y-auto p-6 bg-slate-200">
        <div className="max-w-3xl mx-auto">
          {success ? (
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 text-center shadow-xl space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center text-3xl">
                <FontAwesomeIcon icon={faCircleCheck} />
              </div>
              <h3 className="text-xl font-bold text-white">¡Incidencia registrada con éxito!</h3>
              <p className="text-sm text-slate-300 max-w-md mx-auto">
                Tu solicitud ha sido enviada al equipo de soporte técnico. Puedes dar seguimiento al estado de atención en tu panel.
              </p>
              <div className="pt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSuccess(false);
                    setTitulo('');
                    setDescripcion('');
                    setCategoriaId(0);
                    setPrioridadId(0);
                    setUbicacionId(0);
                    handleRemoveFile();
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  Registrar otra incidencia
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard/incidencias')}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 transition-all shadow-md shadow-orange-500/10 cursor-pointer"
                >
                  Ver mis incidencias →
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-xl overflow-hidden">
              {/* Card Banner */}
              <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <FontAwesomeIcon icon={faPaperPlane} className="text-amber-400 text-sm" />
                    Formulario de Solicitud de Incidencia
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Proporciona los datos del equipo o ambiente para que un técnico sea asignado.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard/incidencias')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
                >
                  <FontAwesomeIcon icon={faArrowLeft} />
                  <span>Volver</span>
                </button>
              </div>

              {loading ? (
                <div className="p-12 text-center text-slate-400">
                  <FontAwesomeIcon icon={faSpinner} spin className="text-2xl text-amber-400 mb-2" />
                  <p className="text-sm">Cargando formulario...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  {/* Título */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Título de la incidencia *
                    </label>
                    <input
                      type="text"
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                      placeholder="Ej: Computadora no da vídeo o proyector sin señal"
                      className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors"
                    />
                  </div>

                  {/* Descripción */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Descripción detallada del problema *
                    </label>
                    <textarea
                      rows={3}
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      placeholder="Indica qué equipo presenta la falla, qué sucede al encenderlo, o cualquier detalle relevante..."
                      className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors"
                    />
                  </div>

                  {/* Categoría y Ubicación en 2 columnas */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        Categoría de la falla *
                      </label>
                      <select
                        value={categoriaId}
                        onChange={(e) => handleCategoriaChange(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
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
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        Ubicación (Aula o Laboratorio) *
                      </label>
                      <select
                        value={ubicacionId}
                        onChange={(e) => setUbicacionId(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                      >
                        <option value={0} disabled>
                          Seleccionar aula / laboratorio
                        </option>
                        {ubicaciones.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.pabellon} — {u.aulaLaboratorio} (Piso {u.piso}, {u.tipo})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Evidencia Fotográfica */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <FontAwesomeIcon icon={faCamera} className="text-amber-400" />
                        Evidencia fotográfica (Opcional)
                      </span>
                      <span className="text-[11px] font-normal text-slate-400">JPG, PNG, WEBP (Máx. 10MB)</span>
                    </label>

                    {!previewUrl ? (
                      <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-700 hover:border-amber-500/60 rounded-xl cursor-pointer bg-slate-800/40 hover:bg-slate-800/80 transition-all duration-200 group">
                        <div className="flex flex-col items-center justify-center text-center px-4">
                          <div className="w-9 h-9 rounded-full bg-slate-700/50 group-hover:bg-amber-500/20 flex items-center justify-center text-slate-400 group-hover:text-amber-400 transition-colors mb-1.5">
                            <FontAwesomeIcon icon={faCamera} className="text-sm" />
                          </div>
                          <p className="text-xs text-slate-300 font-medium">
                            <span className="text-amber-400 font-semibold underline decoration-amber-400/40 underline-offset-2">
                              Haz clic para subir una foto
                            </span>{' '}
                            o arrastra aquí
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">Captura el error, monitor o equipo afectado</p>
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
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-900 border border-slate-700 shrink-0 flex items-center justify-center">
                          <img
                            src={previewUrl}
                            alt="Vista previa"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-white truncate">{archivo?.name}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {archivo
                              ? archivo.size / 1024 < 1024
                                ? `${(archivo.size / 1024).toFixed(1)} KB`
                                : `${(archivo.size / (1024 * 1024)).toFixed(2)} MB`
                              : ''}
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

                  {/* Mensaje de error si falla validación */}
                  {error && (
                    <div className="text-red-400 text-sm bg-red-950/40 border border-red-800/50 rounded-xl px-4 py-3">
                      {error}
                    </div>
                  )}

                  {/* Botones de acción */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faShieldHalved} className="text-amber-400" />
                      Tu solicitud será procesada por el equipo de soporte de ASIU.
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => navigate('/dashboard/incidencias')}
                        className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-slate-950 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-orange-500/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {submitting ? (
                          <>
                            <FontAwesomeIcon icon={faSpinner} spin />
                            <span>Enviando...</span>
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faPaperPlane} />
                            <span>Registrar incidencia</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
