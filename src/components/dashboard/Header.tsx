import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faMagnifyingGlass, faUser } from '@fortawesome/free-solid-svg-icons';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="h-16 shrink-0 border-b border-slate-800 bg-gray-950/50 backdrop-blur-xl flex items-center justify-between px-6">
      <div className="text-left">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden sm:block">
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm"
          />
          <input
            type="search"
            placeholder="Buscar incidencias..."
            className="w-64 bg-slate-900/80 border border-slate-700 rounded-xl py-2 pl-9 pr-4 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-orange-500/50"
          />
        </div>

        <button
          type="button"
          className="relative w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors"
        >
          <FontAwesomeIcon icon={faBell} />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
            3
          </span>
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <FontAwesomeIcon icon={faUser} className="text-white text-sm" />
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-slate-200">Admin Campus</p>
            <p className="text-xs text-slate-500">Coordinador</p>
          </div>
        </div>
      </div>
    </header>
  );
}
