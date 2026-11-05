export interface PreguntaFrecuente {
  id: string;
  categoria: 'Redes' | 'Cuentas' | 'Software' | 'Laboratorios';
  pregunta: string;
  respuesta: string;
  pasos?: string[];
  categoriaIncidencia: string;
  tituloIncidencia: string;
}

export const CATEGORIAS_FAQ = ['Todas', 'Redes', 'Cuentas', 'Software', 'Laboratorios'] as const;
export type CategoriaFaq = typeof CATEGORIAS_FAQ[number];

export const PREGUNTAS_FRECUENTES: PreguntaFrecuente[] = [
  {
    id: 'wifi',
    categoria: 'Redes',
    pregunta: '¿Cómo me conecto a la red Wi-Fi institucional?',
    respuesta: 'Selecciona la red «UTP-Alumnos» o «eduroam». En método EAP elige PEAP, autenticación MSCHAPV2 y en certificado marca «No validar». Ingresa tu correo universitario completo y tu contraseña.',
    pasos: [
      'Selecciona la red «UTP-Alumnos».',
      'Configura seguridad EAP: PEAP con MSCHAPV2.',
      'Ingresa tu correo institucional y tu contraseña del campus.',
    ],
    categoriaIncidencia: 'Problema con Wi-Fi',
    tituloIncidencia: 'Falla al conectar a la red Wi-Fi',
  },
  {
    id: 'contrasena',
    categoria: 'Cuentas',
    pregunta: '¿Cómo recupero la contraseña de mi correo o campus virtual?',
    respuesta: 'Ingresa a outlook.office.com o al portal estudiantil y presiona «Olvidé mi contraseña». Podrás recibir un código de validación por SMS a tu número celular registrado.',
    pasos: [
      'Entra al portal de inicio de sesión y pulsa «Olvidé mi contraseña».',
      'Ingresa tu código de estudiante o correo.',
      'Valida tu identidad con el SMS enviado a tu teléfono.',
    ],
    categoriaIncidencia: 'Error de aplicación',
    tituloIncidencia: 'Recuperación o cambio de contraseña institucional',
  },
  {
    id: 'software',
    categoria: 'Software',
    pregunta: '¿Dónde descargo Office 365, MATLAB o AutoCAD con mi cuenta?',
    respuesta: 'Tu correo universitario incluye licencias oficiales. Puedes iniciar sesión en portal.office.com para descargar Office 365, o registrarte en mathworks.com y autodesk.com con tu correo institucional.',
    categoriaIncidencia: 'Problema con licencia de software',
    tituloIncidencia: 'Consulta sobre licencia o descarga de software',
  },
  {
    id: 'laboratorio-pc',
    categoria: 'Laboratorios',
    pregunta: '¿Qué hago si una PC del laboratorio no da video o no enciende?',
    respuesta: 'Comprueba que el botón de encendido del CPU y del monitor tengan la luz encendida. Revisa que el cable HDMI posterior esté bien insertado. Si persiste la pantalla negra, anota el código del equipo y repórtalo.',
    categoriaIncidencia: 'Problema con monitor',
    tituloIncidencia: 'Equipo de laboratorio sin señal o inoperativo',
  },
  {
    id: 'proyector',
    categoria: 'Laboratorios',
    pregunta: '¿Cómo proyecto la pantalla de mi laptop en un aula?',
    respuesta: 'Conecta el cable HDMI y pulsa la tecla Windows + P (en Mac: Ajustes > Pantallas) y selecciona «Duplicar». Verifica que la botonera de la pared esté encendida en la fuente HDMI.',
    categoriaIncidencia: 'Proyector sin señal HDMI',
    tituloIncidencia: 'Falla al conectar proyector de aula',
  },
];
