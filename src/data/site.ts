// Contenido del sitio. Horizonte es una empresa ficticia creada para portafolio.

export const contact = {
  whatsapp: 'https://wa.me/524611234567?text=Hola%2C%20quiero%20pedir%20un%20kit%20de%20muestreo',
  whatsappLabel: '461 123 4567',
  email: 'hola@horizontesuelos.mx',
  lab: 'Celaya, Guanajuato',
};

// Horizontes del monolito de la Fig. 1 (figure/build.mjs). Profundidades en cm; colores tomados de la notación Munsell.
export const horizons = [
  { id: 'O', name: 'Horizonte O', desc: 'Hojarasca y restos de cosecha', from: 0, to: 5, munsell: '10YR 2/1', color: '#2E2620' },
  { id: 'A', name: 'Horizonte A', desc: 'Capa arable, donde vive la raíz', from: 5, to: 25, munsell: '10YR 3/2', color: '#5A4636', sample: true },
  { id: 'B', name: 'Horizonte B', desc: 'Subsuelo con arcilla acumulada', from: 25, to: 60, munsell: '7.5YR 5/6', color: '#9A6A3E' },
  { id: 'C', name: 'Horizonte C', desc: 'Roca madre a medio deshacer', from: 60, to: 110, munsell: '2.5Y 6/3', color: '#A89C80' },
] as const;

export const sampleDepth = 20;

// Extracto del informe de ejemplo.
export const sampleReport = {
  id: 'HZ-24817',
  meta: [
    ['Parcela', 'El Mezquite'],
    ['Cultivo', 'Maíz de temporal'],
    ['Superficie', '6 ha'],
    ['Muestreo', '14 de octubre de 2026'],
  ],
  rows: [
    { name: 'pH', value: 5.4, unit: '', scale: [4, 9], optimal: [6, 7], status: 'Bajo', note: 'Suelo ácido: el fósforo se bloquea.' },
    { name: 'Materia orgánica', value: 1.6, unit: '%', scale: [0, 6], optimal: [2.5, 4], status: 'Bajo', note: 'Retiene poca agua entre lluvias.' },
    { name: 'Nitrógeno', value: 12, unit: 'mg/kg', scale: [0, 60], optimal: [20, 40], status: 'Bajo', note: 'Necesita aporte antes de sembrar.' },
    { name: 'Fósforo', value: 18, unit: 'mg/kg', scale: [0, 40], optimal: [11, 22], status: 'Óptimo', note: 'Suficiente para este ciclo.' },
    { name: 'Potasio', value: 310, unit: 'mg/kg', scale: [0, 400], optimal: [150, 250], status: 'Alto', note: 'No hace falta aplicar.' },
  ],
  recommendation: [
    'Aplica 1.5 t/ha de cal agrícola un mes antes de sembrar para subir el pH.',
    'Aplica 120 kg/ha de nitrógeno en dos partes: la mitad al sembrar y la otra a los 35 días.',
    'Deja fuera el potasio este ciclo. En 6 ha te ahorras alrededor de $7,200.',
  ],
};

export const steps = [
  { title: 'Pide el kit', body: 'Te llega en 3 a 5 días con bolsas, etiquetas, una guía ilustrada y la guía de envío ya pagada.' },
  { title: 'Toma la muestra', body: 'Camina la parcela en zigzag y saca de 15 a 20 piquetes a 20 cm de profundidad. Mézclalos en una cubeta y llena la bolsa con un kilo.' },
  { title: 'Envíala', body: 'Deja la caja en cualquier sucursal de paquetería. No pagas nada al enviarla.' },
  { title: 'Recibe tu informe', body: 'En 10 días hábiles te llega por correo y WhatsApp. Incluye una llamada de 20 minutos con un agrónomo para resolver dudas.' },
];

export const prices = [
  { name: 'Análisis básico', includes: 'pH, materia orgánica, nitrógeno, fósforo, potasio y conductividad eléctrica.', price: '$690', per: 'por muestra' },
  { name: 'Análisis completo', includes: 'Todo lo del básico, más calcio, magnesio, zinc, hierro, manganeso, cobre, boro y textura.', price: '$1,250', per: 'por muestra' },
  { name: 'Seguimiento de temporada', includes: 'Dos análisis completos, antes de sembrar y a medio ciclo, y una visita a campo de un agrónomo.', price: '$3,900', per: 'por parcela de hasta 20 ha' },
];

export const faqs = [
  { q: '¿Cuántas muestras necesito?', a: 'Una por cada zona de la parcela que se vea o se trabaje distinto. Si el terreno es parejo, una muestra alcanza para hasta 10 hectáreas.' },
  { q: '¿Cuándo conviene muestrear?', a: 'De 4 a 6 semanas antes de sembrar y sin haber fertilizado en los dos meses anteriores. Así el plan llega a tiempo para comprar insumos.' },
  { q: '¿Quién hace el análisis?', a: 'Nuestro propio laboratorio en Celaya, Guanajuato, con los métodos de la NOM-021-SEMARNAT-2000. Guardamos tu muestra 90 días por si quieres repetir una prueba.' },
  { q: '¿Y si no entiendo el informe?', a: 'Cada informe incluye una llamada con un agrónomo. Te explica los números y ajusta el plan a lo que encuentras en tu zona y a tu presupuesto.' },
  { q: '¿Llegan a todo México?', a: 'Sí. Enviamos el kit a cualquier código postal con cobertura de paquetería. En comunidades sin cobertura, puedes dejar la muestra en una de nuestras 40 tiendas agrícolas aliadas.' },
];
