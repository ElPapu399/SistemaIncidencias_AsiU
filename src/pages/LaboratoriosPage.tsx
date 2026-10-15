import Header from "../components/dashboard/Header";
import { useState } from 'react';
import { Plus } from 'lucide-react';
import LaboratorioCard from '../components/dashboard/LaboratorioCard';
import LaboratorioForm from '../components/dashboard/LaboratorioForm';
import { laboratoriosIniciales } from '../data/laboratorios';
import type { Laboratorio } from '../types/laboratorio';

interface LaboratoriosPageProps {
    title: string;
    description: string;
}

export default function LaboratoriosPage({title, description}: LaboratoriosPageProps) {
    const [laboratorios, setLaboratorios] = useState<Laboratorio[]>(laboratoriosIniciales);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingLaboratorio, setEditingLaboratorio] = useState<Laboratorio | null>(null);

    function guardarLaboratorio(laboratorio: Laboratorio) {
        setLaboratorios((actuales) => actuales.some((item) => item.id === laboratorio.id)
            ? actuales.map((item) => item.id === laboratorio.id ? laboratorio : item)
            : [...actuales, laboratorio]);
    }

    return (
        <>
            <Header title={title} subtitle={description} />
            <main className="flex-1 p-6 lg:p-8 space-y-8 bg-slate-100">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-left">
                        <h1 className="m-0! text-2xl! font-bold! tracking-normal! text-slate-900">Laboratorios</h1>
                        <p className="mt-1 text-sm text-slate-500">
                            {laboratorios.length} laboratorio{laboratorios.length !== 1 ? 's' : ''} registrado{laboratorios.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <button type="button" onClick={() => {
                        setEditingLaboratorio(null);
                        setModalOpen(true);
                    }} className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                        <Plus className="h-5 w-5" aria-hidden="true" />
                        Nuevo Laboratorio
                    </button>
                </div>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {laboratorios.map((laboratorio) => (
                        <LaboratorioCard key={laboratorio.id} laboratorio={laboratorio} onEdit={(item) => {
                            setEditingLaboratorio(item);
                            setModalOpen(true);
                        }} />
                    ))}
                </div>
            </main>
            {modalOpen && <LaboratorioForm laboratorio={editingLaboratorio} onSave={guardarLaboratorio} onClose={() => setModalOpen(false)} />}
        </>
    )
}
