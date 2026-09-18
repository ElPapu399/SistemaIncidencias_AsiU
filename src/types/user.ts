export type UserRole = 'ADMIN' | 'ESTUDIANTE' | 'TECNICO' | 'TECNICO_GENERAL' | 'TECNICO_ESPECIALISTA';

export interface User {
    id: number;
    nombre: string;
    apellido: string;
    correo: string;
    rol: UserRole | string;
    carrera: string | null;
    especialidad: string | null;
    fechaCreacion: string;
    estado: string;
    telefono: string;
}

export interface Role {
    id: number;
    nombre: string;
}

export interface Especialidad {
    id: number;
    nombre: string;
    descripcion: string | null;
}

export interface CreateUserRequest {
    nombre: string;
    apellido: string;
    correo: string;
    password: string;
    rolId: number;
    especialidadId: number | null;
    carrera: string | null;
    telefono: string | null;
    estado: string | null;
}

export type UpdateUserRequest = Omit<CreateUserRequest, 'password'>;
