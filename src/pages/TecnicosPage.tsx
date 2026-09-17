import { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSpinner, faUsers } from '@fortawesome/free-solid-svg-icons';

import Header from '../components/dashboard/Header';
import TechnTable from '../components/TechnTable';
import UserFormModal from '../components/dashboard/UserForm';
import type { User } from '../types/user';

const API_BASE = 'http://localhost:8080/api';

interface TecnicosPageProps {
    title: string;
    description: string;
}

export default function TecnicosPage({ title }: TecnicosPageProps) {
    const [tecnicos, setTecnicos] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [modalOpen, setModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const cargarUsuarios = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_BASE}/usuarios`);
            if (response.ok) {
                const data = await response.json();
                setTecnicos(data);
            } else {
                setError('Error al cargar usuarios');
            }
        } catch {
            setError('No se pudo conectar al servidor');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        cargarUsuarios();
    }, [cargarUsuarios]);

    const handleCreate = () => {
        setEditingUser(null);
        setModalOpen(true);
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setModalOpen(true);
    };

    const handleSave = () => {
        cargarUsuarios();
    };

    const totalTecnicos = tecnicos.filter(u => u.rol === 'TECNICO').length;

    return (
        <>
            <Header title={title} />
            <main className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="text-left">
                        <h3 className="text-2xl font-bold text-black">Gestión de Técnicos</h3>
                        <p className="text-sm text-slate-500 mt-1">
                            {totalTecnicos} técnico{totalTecnicos !== 1 ? 's' : ''} registrado{totalTecnicos !== 1 ? 's' : ''} en el sistema
                        </p>    
                    </div>
                    <button
                        type="button"
                        onClick={handleCreate}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-slate-950 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-orange-500/10 cursor-pointer"
                    >
                        <FontAwesomeIcon icon={faPlus} />
                        Nuevo técnico
                    </button>
                </div>

                {error && (
                    <div className="text-red-600 text-sm bg-red-100 border border-red-300 rounded-xl px-4 py-3">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <FontAwesomeIcon icon={faSpinner} spin className="text-3xl text-slate-400" />
                    </div>
                ) : tecnicos.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-300 flex items-center justify-center mb-4">
                            <FontAwesomeIcon icon={faUsers} className="text-2xl text-slate-500" />
                        </div>
                        <h4 className="text-lg font-semibold text-black">Sin técnicos</h4>
                        <p className="text-sm text-slate-500 mt-1">
                            Aún no hay técnicos registrados. Crea el primero.
                        </p>
                    </div>
                ) : (
                    <div className="xl:col-span-2">
                        <TechnTable usuarios={tecnicos} onEdit={handleEdit} />
                    </div>
                )}
            </main>

            <UserFormModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSave}
                editingUser={editingUser}
            />
        </>
    );
}
