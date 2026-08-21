import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHammer } from '@fortawesome/free-solid-svg-icons';
import Header from '../components/dashboard/Header';

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export default function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <>
      <Header title={title} />
      <main className="flex-1 flex items-center justify-center p-6 bg-slate-200">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mb-4">
            <FontAwesomeIcon icon={faHammer} className="text-2xl text-slate-500" />
          </div>
          <h3 className="text-xl font-semibold text-black">{title}</h3>
          <p className="text-sm text-slate-400 mt-2">{description}</p>
        </div>
      </main>
    </>
  );
}
