import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMagnifyingGlass,
  faChevronDown,
  faChevronUp,
  faArrowRight,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';

import Header from '../components/dashboard/Header';
import Button from '../components/Button';
import {
  PREGUNTAS_FRECUENTES,
  CATEGORIAS_FAQ,
  type CategoriaFaq,
  type PreguntaFrecuente,
} from '../data/guiasAyuda';

export default function CentroAyudaPage() {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState<CategoriaFaq>('Todas');
  const [abiertaId, setAbiertaId] = useState<string | null>(PREGUNTAS_FRECUENTES[0]?.id ?? null);

  const toggleItem = (id: string) => {
    setAbiertaId((prev) => (prev === id ? null : id));
  };

  const handleEscalar = (item: PreguntaFrecuente) => {
    const params = new URLSearchParams({
      categoria: item.categoriaIncidencia,
      titulo: item.tituloIncidencia,
    });
    navigate(`/dashboard/nueva?${params.toString()}`);
  };

  const preguntasFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return PREGUNTAS_FRECUENTES.filter((item) => {
      const matchCat = categoria === 'Todas' || item.categoria === categoria;
      if (!matchCat) return false;
      if (!q) return true;
      return (
        item.pregunta.toLowerCase().includes(q) ||
        item.respuesta.toLowerCase().includes(q)
      );
    });
  }, [busqueda, categoria]);

  return (
    <>
      <Header
        title="Centro de Ayuda"
        subtitle="Preguntas frecuentes y soluciones rápidas para estudiantes."
      />

      <main className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-100 max-w-5xl mx-auto w-full text-left">
        {/* Barra de búsqueda simple */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <FontAwesomeIcon icon={faMagnifyingGlass} className="text-sm" />
          </div>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar pregunta frecuente (ej. wifi, contraseña, software, monitor)..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 transition-colors"
          />
        </div>

        {/* Filtros simples por categoría */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {CATEGORIAS_FAQ.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoria(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                categoria === cat
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Lista de acordeones simple */}
        {preguntasFiltradas.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
            <p className="text-sm text-slate-500">
              No se encontraron soluciones para «{busqueda}».
            </p>
            <div className="mt-4">
              <Button
                type="button"
                variant="secondary"
                icon={<FontAwesomeIcon icon={faPlus} />}
                text="Reportar Incidencia"
                onClick={() => navigate('/dashboard/nueva')}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {preguntasFiltradas.map((item) => {
              const isOpen = abiertaId === item.id;
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggleItem(item.id)}
                    className="w-full px-5 py-4 flex items-center justify-between gap-3 text-left cursor-pointer hover:bg-slate-50/70"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md shrink-0">
                        {item.categoria}
                      </span>
                      <span className="text-sm font-semibold text-slate-800">
                        {item.pregunta}
                      </span>
                    </div>
                    <FontAwesomeIcon
                      icon={isOpen ? faChevronUp : faChevronDown}
                      className="text-xs text-slate-400 shrink-0"
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-4 pt-1 border-t border-slate-100 text-sm text-slate-600 space-y-3">
                      <p className="leading-relaxed">{item.respuesta}</p>

                      {item.pasos && (
                        <ol className="list-decimal list-inside space-y-1 text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                          {item.pasos.map((p, idx) => (
                            <li key={idx}>{p}</li>
                          ))}
                        </ol>
                      )}

                      <div className="pt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleEscalar(item)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                        >
                          <span>¿Aún con problemas? Abrir ticket sobre esto</span>
                          <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Sección inferior sencilla */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-slate-800">
              ¿No encontraste solución a tu problema?
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Registra una incidencia para que el equipo técnico te atienda.
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            icon={<FontAwesomeIcon icon={faPlus} />}
            text="Nueva Incidencia"
            onClick={() => navigate('/dashboard/nueva')}
          />
        </div>
      </main>
    </>
  );
}
