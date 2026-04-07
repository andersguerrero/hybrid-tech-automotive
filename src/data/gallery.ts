export interface GalleryItem {
  id: string
  title: string
  titleEs: string
  description: string
  descriptionEs: string
  category: 'installation' | 'diagnostic' | 'repair'
  vehicle: string
  image: string
  date: string
}

export const galleryItems: GalleryItem[] = [
  {
    id: '1',
    title: 'Hybrid Battery Installation',
    titleEs: 'Instalación de Batería Híbrida',
    description: 'Professional hybrid battery pack installation with our certified technicians.',
    descriptionEs: 'Instalación profesional de batería híbrida con nuestros técnicos certificados.',
    category: 'installation',
    vehicle: 'Toyota Prius',
    image: '/images/services/suspension-1767753861435.JPG',
    date: '2024-12-15'
  },
  {
    id: '2',
    title: 'Battery Cell Testing',
    titleEs: 'Prueba de Celdas de Batería',
    description: 'Individual cell testing and balancing for optimal battery performance.',
    descriptionEs: 'Prueba y balanceo individual de celdas para un rendimiento óptimo.',
    category: 'diagnostic',
    vehicle: 'Toyota Camry Hybrid',
    image: '/images/services/batteryDiagnostic-1767753970669.JPG',
    date: '2024-11-20'
  },
  {
    id: '3',
    title: 'Battery Compartment Service',
    titleEs: 'Servicio de Compartimiento de Batería',
    description: 'Complete battery compartment inspection and battery replacement.',
    descriptionEs: 'Inspección completa del compartimiento y reemplazo de batería.',
    category: 'installation',
    vehicle: 'Toyota Highlander Hybrid',
    image: '/images/services/batteryDiagnostic-1767754017589.JPG',
    date: '2024-10-05'
  },
  {
    id: '4',
    title: 'Hybrid System Diagnostic',
    titleEs: 'Diagnóstico de Sistema Híbrido',
    description: 'Advanced diagnostic software analysis of hybrid battery performance.',
    descriptionEs: 'Análisis avanzado con software de diagnóstico del rendimiento de la batería.',
    category: 'diagnostic',
    vehicle: 'Lexus RX 450h',
    image: '/images/services/coolantFlush-1767754162075.jpg',
    date: '2024-09-18'
  },
  {
    id: '5',
    title: 'Battery Pack Replacement',
    titleEs: 'Reemplazo de Pack de Batería',
    description: 'Full hybrid battery pack replacement with brand new components.',
    descriptionEs: 'Reemplazo completo del pack de batería con componentes nuevos.',
    category: 'repair',
    vehicle: 'Honda Civic Hybrid',
    image: '/images/services/transmissionService-1767754000072.JPG',
    date: '2024-08-22'
  },
  {
    id: '6',
    title: 'Prius Hybrid Service',
    titleEs: 'Servicio Híbrido Prius',
    description: 'Comprehensive Prius hybrid system repair with component replacement.',
    descriptionEs: 'Reparación integral del sistema híbrido Prius con reemplazo de componentes.',
    category: 'repair',
    vehicle: 'Toyota Prius',
    image: '/images/services/service-1767759615153.jpg',
    date: '2024-07-10'
  },
  {
    id: '7',
    title: 'Brake System Service',
    titleEs: 'Servicio de Sistema de Frenos',
    description: 'Professional brake inspection and rotor replacement on hybrid vehicles.',
    descriptionEs: 'Inspección profesional de frenos y reemplazo de rotores en vehículos híbridos.',
    category: 'repair',
    vehicle: 'Toyota Prius',
    image: '/images/services/service-1767759674413.jpg',
    date: '2024-06-15'
  },
  {
    id: '8',
    title: 'Engine Bay Inspection',
    titleEs: 'Inspección del Motor',
    description: 'Thorough engine bay inspection and maintenance service.',
    descriptionEs: 'Inspección exhaustiva del compartimiento del motor y servicio de mantenimiento.',
    category: 'diagnostic',
    vehicle: 'Toyota Camry Hybrid',
    image: '/images/services/coolantFlush-1762314634420.jpg',
    date: '2024-05-20'
  }
]
