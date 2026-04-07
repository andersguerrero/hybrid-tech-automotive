export interface FAQItem {
  id: string
  question: string
  questionEs: string
  answer: string
  answerEs: string
  category: string
  categoryEs: string
}

export const faqs: FAQItem[] = [
  // General
  {
    id: 'faq-1',
    question: 'What is a hybrid battery?',
    questionEs: 'Que es una bateria hibrida?',
    answer: 'A hybrid battery is a high-voltage battery pack that stores electrical energy to power the electric motor in a hybrid vehicle. It works alongside the gasoline engine to improve fuel efficiency and reduce emissions. These batteries are typically nickel-metal hydride (NiMH) or lithium-ion and are designed to last many years with proper maintenance.',
    answerEs: 'Una bateria hibrida es un paquete de bateria de alto voltaje que almacena energia electrica para alimentar el motor electrico en un vehiculo hibrido. Funciona junto con el motor de gasolina para mejorar la eficiencia de combustible y reducir emisiones. Estas baterias son tipicamente de hidruro de niquel-metal (NiMH) o litio-ion y estan disenadas para durar muchos anos con el mantenimiento adecuado.',
    category: 'General',
    categoryEs: 'General'
  },
  {
    id: 'faq-2',
    question: 'How long do hybrid batteries last?',
    questionEs: 'Cuanto duran las baterias hibridas?',
    answer: 'Most hybrid batteries last between 8 to 15 years or 100,000 to 200,000 miles, depending on driving habits, climate, and maintenance. Factors like extreme temperatures, frequent short trips, and lack of regular use can reduce battery life. With proper care and maintenance, many hybrid batteries exceed their expected lifespan.',
    answerEs: 'La mayoria de las baterias hibridas duran entre 8 a 15 anos o 100,000 a 200,000 millas, dependiendo de los habitos de conduccion, clima y mantenimiento. Factores como temperaturas extremas, viajes cortos frecuentes y falta de uso regular pueden reducir la vida de la bateria. Con el cuidado y mantenimiento adecuado, muchas baterias hibridas superan su vida util esperada.',
    category: 'General',
    categoryEs: 'General'
  },
  {
    id: 'faq-3',
    question: 'What are signs of a failing hybrid battery?',
    questionEs: 'Cuales son las senales de una bateria hibrida que esta fallando?',
    answer: 'Common signs include decreased fuel economy, reduced performance or sluggish acceleration, the gasoline engine running more frequently, dashboard warning lights (especially the check engine or hybrid system warning), and inconsistent battery charge levels. If you notice any of these symptoms, we recommend scheduling a diagnostic as soon as possible.',
    answerEs: 'Las senales comunes incluyen disminucion en la economia de combustible, rendimiento reducido o aceleracion lenta, el motor de gasolina funcionando mas frecuentemente, luces de advertencia en el tablero (especialmente la luz de verificacion del motor o advertencia del sistema hibrido), y niveles de carga inconsistentes. Si nota alguno de estos sintomas, recomendamos programar un diagnostico lo antes posible.',
    category: 'General',
    categoryEs: 'General'
  },
  {
    id: 'faq-4',
    question: 'What brands do you service?',
    questionEs: 'Que marcas atienden?',
    answer: 'We specialize in Toyota and Lexus hybrid vehicles, including popular models like the Prius, Camry Hybrid, Highlander Hybrid, RAV4 Hybrid, Lexus RX, ES, NX, CT, and more. We also service other hybrid brands. Contact us to confirm availability for your specific vehicle.',
    answerEs: 'Nos especializamos en vehiculos hibridos Toyota y Lexus, incluyendo modelos populares como Prius, Camry Hybrid, Highlander Hybrid, RAV4 Hybrid, Lexus RX, ES, NX, CT, y mas. Tambien atendemos otras marcas hibridas. Contactenos para confirmar disponibilidad para su vehiculo especifico.',
    category: 'General',
    categoryEs: 'General'
  },
  // Hybrid Batteries
  {
    id: 'faq-5',
    question: 'What is the difference between new and refurbished hybrid batteries?',
    questionEs: 'Cual es la diferencia entre baterias hibridas nuevas y reconstruidas?',
    answer: 'New batteries are brand-new units from the manufacturer or aftermarket suppliers. Refurbished (rebuilt) batteries are used battery packs where individual cells have been tested, replaced if needed, and the pack is rebalanced to restore performance. Refurbished batteries offer a more affordable option while still providing reliable performance with warranty coverage.',
    answerEs: 'Las baterias nuevas son unidades completamente nuevas del fabricante o proveedores de repuestos. Las baterias reconstruidas son paquetes de baterias usadas donde las celdas individuales han sido probadas, reemplazadas si es necesario, y el paquete es reequilibrado para restaurar el rendimiento. Las baterias reconstruidas ofrecen una opcion mas economica mientras proporcionan un rendimiento confiable con cobertura de garantia.',
    category: 'Hybrid Batteries',
    categoryEs: 'Baterias Hibridas'
  },
  {
    id: 'faq-6',
    question: 'How much does a hybrid battery replacement cost?',
    questionEs: 'Cuanto cuesta el reemplazo de una bateria hibrida?',
    answer: 'The cost varies depending on the vehicle make and model, and whether you choose a new or refurbished battery. Our rebuilt batteries start at competitive prices with transparent pricing. Visit our batteries page or call us at (832) 762-5299 for a specific quote for your vehicle.',
    answerEs: 'El costo varia dependiendo de la marca y modelo del vehiculo, y si elige una bateria nueva o reconstruida. Nuestras baterias reconstruidas comienzan a precios competitivos con precios transparentes. Visite nuestra pagina de baterias o llamenos al (832) 762-5299 para una cotizacion especifica para su vehiculo.',
    category: 'Hybrid Batteries',
    categoryEs: 'Baterias Hibridas'
  },
  {
    id: 'faq-7',
    question: 'Can I bring my own battery for installation?',
    questionEs: 'Puedo traer mi propia bateria para la instalacion?',
    answer: 'Yes, we can install a hybrid battery that you provide. However, please note that our warranty coverage only applies to batteries purchased through us. We recommend discussing your battery choice with our technicians before purchasing to ensure compatibility and quality.',
    answerEs: 'Si, podemos instalar una bateria hibrida que usted proporcione. Sin embargo, tenga en cuenta que nuestra cobertura de garantia solo aplica a baterias compradas a traves de nosotros. Recomendamos discutir su eleccion de bateria con nuestros tecnicos antes de comprar para asegurar compatibilidad y calidad.',
    category: 'Hybrid Batteries',
    categoryEs: 'Baterias Hibridas'
  },
  // Services
  {
    id: 'faq-8',
    question: 'How long does hybrid battery installation take?',
    questionEs: 'Cuanto tiempo toma la instalacion de una bateria hibrida?',
    answer: 'Most hybrid battery replacements take between 2 to 4 hours, depending on the vehicle model and complexity. Some vehicles may require additional time for testing and calibration. We strive to complete the work as efficiently as possible while maintaining our quality standards.',
    answerEs: 'La mayoria de los reemplazos de baterias hibridas toman entre 2 a 4 horas, dependiendo del modelo del vehiculo y la complejidad. Algunos vehiculos pueden requerir tiempo adicional para pruebas y calibracion. Nos esforzamos por completar el trabajo de la manera mas eficiente posible mientras mantenemos nuestros estandares de calidad.',
    category: 'Services',
    categoryEs: 'Servicios'
  },
  {
    id: 'faq-9',
    question: 'Do you offer hybrid battery diagnostics?',
    questionEs: 'Ofrecen diagnostico de baterias hibridas?',
    answer: 'Yes, we offer comprehensive hybrid battery diagnostics using specialized equipment. Our diagnostic service tests individual cell voltages, overall pack health, cooling system performance, and identifies any failing modules. This helps us provide an accurate assessment and honest recommendation for repair or replacement.',
    answerEs: 'Si, ofrecemos diagnosticos integrales de baterias hibridas utilizando equipo especializado. Nuestro servicio de diagnostico prueba los voltajes de celdas individuales, la salud general del paquete, el rendimiento del sistema de enfriamiento, e identifica cualquier modulo que este fallando. Esto nos ayuda a proporcionar una evaluacion precisa y una recomendacion honesta para reparacion o reemplazo.',
    category: 'Services',
    categoryEs: 'Servicios'
  },
  {
    id: 'faq-10',
    question: 'Do you offer towing services?',
    questionEs: 'Ofrecen servicio de grua?',
    answer: 'While we do not provide towing directly, we can recommend trusted towing partners in the Spring, TX area who can transport your vehicle to our shop safely. Contact us and we will help coordinate getting your vehicle to us.',
    answerEs: 'Aunque no proporcionamos servicio de grua directamente, podemos recomendar socios de grua confiables en el area de Spring, TX que pueden transportar su vehiculo a nuestro taller de manera segura. Contactenos y le ayudaremos a coordinar el traslado de su vehiculo.',
    category: 'Services',
    categoryEs: 'Servicios'
  },
  {
    id: 'faq-11',
    question: 'Do you service my area?',
    questionEs: 'Atienden mi area?',
    answer: 'We are located in Spring, TX and serve the greater Houston metropolitan area, including The Woodlands, Conroe, Humble, Tomball, Cypress, Klein, and surrounding communities. Our customers also come from further areas for our specialized hybrid services.',
    answerEs: 'Estamos ubicados en Spring, TX y servimos el area metropolitana de Houston, incluyendo The Woodlands, Conroe, Humble, Tomball, Cypress, Klein, y comunidades circundantes. Nuestros clientes tambien vienen de areas mas lejanas por nuestros servicios especializados en hibridos.',
    category: 'Services',
    categoryEs: 'Servicios'
  },
  {
    id: 'faq-12',
    question: 'How do I book an appointment?',
    questionEs: 'Como puedo reservar una cita?',
    answer: 'You can book an appointment through our website by visiting the booking page, calling us at (832) 762-5299, or reaching out via WhatsApp. We offer convenient online scheduling where you can select your preferred date, time, and service.',
    answerEs: 'Puede reservar una cita a traves de nuestro sitio web visitando la pagina de reservas, llamandonos al (832) 762-5299, o contactandonos por WhatsApp. Ofrecemos programacion en linea conveniente donde puede seleccionar su fecha, hora y servicio preferido.',
    category: 'Services',
    categoryEs: 'Servicios'
  },
  // Pricing
  {
    id: 'faq-13',
    question: 'What payment methods do you accept?',
    questionEs: 'Que metodos de pago aceptan?',
    answer: 'We accept multiple payment methods for your convenience: credit and debit cards (processed securely through Stripe), Zelle transfers, and cash payments. You can choose your preferred payment method when booking your appointment or at the time of service.',
    answerEs: 'Aceptamos multiples metodos de pago para su conveniencia: tarjetas de credito y debito (procesadas de forma segura a traves de Stripe), transferencias Zelle, y pagos en efectivo. Puede elegir su metodo de pago preferido al reservar su cita o al momento del servicio.',
    category: 'Pricing',
    categoryEs: 'Precios'
  },
  {
    id: 'faq-14',
    question: 'Do you offer financing or payment plans?',
    questionEs: 'Ofrecen financiamiento o planes de pago?',
    answer: 'Please contact us directly to discuss payment options. We understand that hybrid battery replacement can be a significant investment, and we work with our customers to find solutions that fit their budget. Call us at (832) 762-5299 to discuss your specific situation.',
    answerEs: 'Contactenos directamente para discutir opciones de pago. Entendemos que el reemplazo de bateria hibrida puede ser una inversion significativa, y trabajamos con nuestros clientes para encontrar soluciones que se ajusten a su presupuesto. Llamenos al (832) 762-5299 para discutir su situacion especifica.',
    category: 'Pricing',
    categoryEs: 'Precios'
  },
  {
    id: 'faq-15',
    question: 'Are your prices transparent with no hidden fees?',
    questionEs: 'Sus precios son transparentes sin cargos ocultos?',
    answer: 'Absolutely! We pride ourselves on transparent pricing. All our service and battery prices are listed clearly on our website. The price you see includes parts and labor with no hidden fees or surprise charges. We provide detailed quotes before any work begins.',
    answerEs: 'Absolutamente! Nos enorgullecemos de tener precios transparentes. Todos nuestros precios de servicios y baterias estan listados claramente en nuestro sitio web. El precio que ve incluye piezas y mano de obra sin cargos ocultos o sorpresas. Proporcionamos cotizaciones detalladas antes de comenzar cualquier trabajo.',
    category: 'Pricing',
    categoryEs: 'Precios'
  },
  // Warranty
  {
    id: 'faq-16',
    question: 'Do you offer warranties on your batteries?',
    questionEs: 'Ofrecen garantias en sus baterias?',
    answer: 'Yes! All our hybrid batteries come with a comprehensive warranty. Our rebuilt batteries include a 1-year warranty covering parts and labor. We stand behind the quality of our work and will address any issues promptly during the warranty period.',
    answerEs: 'Si! Todas nuestras baterias hibridas vienen con una garantia integral. Nuestras baterias reconstruidas incluyen una garantia de 1 ano que cubre piezas y mano de obra. Respaldamos la calidad de nuestro trabajo y abordaremos cualquier problema de manera oportuna durante el periodo de garantia.',
    category: 'Warranty',
    categoryEs: 'Garantia'
  },
  {
    id: 'faq-17',
    question: 'What if the battery fails after installation?',
    questionEs: 'Que pasa si la bateria falla despues de la instalacion?',
    answer: 'If your battery experiences issues during the warranty period, bring your vehicle back to us and we will diagnose the problem at no additional cost. If the battery is found to be defective, we will replace or repair it under our warranty terms. We want to ensure your complete satisfaction.',
    answerEs: 'Si su bateria experimenta problemas durante el periodo de garantia, traiga su vehiculo de vuelta y diagnosticaremos el problema sin costo adicional. Si se determina que la bateria es defectuosa, la reemplazaremos o repararemos bajo los terminos de nuestra garantia. Queremos asegurar su completa satisfaccion.',
    category: 'Warranty',
    categoryEs: 'Garantia'
  },
  {
    id: 'faq-18',
    question: 'What does the warranty cover?',
    questionEs: 'Que cubre la garantia?',
    answer: 'Our warranty covers defects in materials and workmanship of the hybrid battery pack. This includes cell failure, capacity loss beyond normal degradation, and installation-related issues. Normal wear and tear, damage from accidents, or modifications to the vehicle are not covered. For full warranty details, visit our warranty policy page.',
    answerEs: 'Nuestra garantia cubre defectos en materiales y mano de obra del paquete de bateria hibrida. Esto incluye fallo de celdas, perdida de capacidad mas alla de la degradacion normal, y problemas relacionados con la instalacion. El desgaste normal, danos por accidentes o modificaciones al vehiculo no estan cubiertos. Para detalles completos de la garantia, visite nuestra pagina de politica de garantia.',
    category: 'Warranty',
    categoryEs: 'Garantia'
  },
]
