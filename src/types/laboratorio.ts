export interface Laboratorio {
    id: string;
    nombre: string;
    pabellon: string;
    piso: string;
    estado: 'Operativo' | 'Mantenimiento' | 'Sin definir';
    capacidad: number | null;
    cantidadPCs: number;
    encargado: string;
    cantidadEquipos: number;
    pisoNumero?: number;
    encargadoId?: number | null;
}
