import type { Laboratorio } from '../types/laboratorio';

// Datos de demostración de la referencia, pendientes de conectar con el backend.
export const laboratoriosIniciales: Laboratorio[] = [
  { id: 'lab-a', nombre: 'Laboratorio A – Programación', pabellon: 'Pabellón Norte', piso: '2do piso', estado: 'Operativo', capacidad: 30, cantidadPCs: 28, encargado: 'Carlos', cantidadEquipos: 4 },
  { id: 'lab-b', nombre: 'Laboratorio B – Redes y Comunicaciones', pabellon: 'Pabellón Sur', piso: '1er piso', estado: 'Operativo', capacidad: 25, cantidadPCs: 24, encargado: 'Pedro', cantidadEquipos: 2 },
  { id: 'lab-c', nombre: 'Laboratorio C – Desarrollo Web y Móvil', pabellon: 'Pabellón Este', piso: '3er piso', estado: 'Mantenimiento', capacidad: 20, cantidadPCs: 20, encargado: 'Lucía', cantidadEquipos: 2 },
  { id: 'lab-d', nombre: 'Laboratorio D – Bases de Datos y Servidores', pabellon: 'Pabellón Norte', piso: '1er piso', estado: 'Operativo', capacidad: 30, cantidadPCs: 29, encargado: 'Pedro', cantidadEquipos: 2 },
  { id: 'lab-e', nombre: 'Laboratorio E – Inteligencia Artificial', pabellon: 'Pabellón Oeste', piso: '2do piso', estado: 'Operativo', capacidad: 18, cantidadPCs: 14, encargado: 'Lucía', cantidadEquipos: 2 },
];
