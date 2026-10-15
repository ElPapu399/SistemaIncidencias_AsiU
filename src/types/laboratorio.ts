export interface Laboratorio {
    id: string;
    nombre: string;
    pabellon: string;
    piso: string;
    estado: 'Operativo' | 'Mantenimiento';
    capacidad: number;
    cantidadPCs: number;
    encargado: string;
    cantidadEquipos: number;
}
