'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

const warrantyTranslations = {
  en: {
    overview: "At Hybrid Tech Auto, we stand behind our work and the products we install. Our warranty policy is designed to give you confidence in our services and protect your investment in hybrid battery technology.",
    newBatteriesTitle: "New Batteries",
    newBatteriesDesc: "All new hybrid batteries come with a 3-year warranty covering defects in materials and workmanship. This warranty provides comprehensive coverage for your peace of mind.",
    refurbishedBatteriesTitle: "Refurbished Batteries",
    refurbishedBatteriesDesc: "All refurbished hybrid batteries come with a 6-month warranty covering defects in materials and workmanship. Refurbished batteries provide a cost-effective solution while maintaining quality standards.",
    whatsCovered: "Our battery warranties cover:",
    whatsNotCovered: "Warranty coverage does not include:",
    mobileInstallation: "Important: Home/Mobile Installation Service",
    mobileInstallationDesc: "If the battery is installed at your location (mobile/home service), warranty coverage will be honored at our service facility. Please bring your vehicle to our location for any warranty-related services or claims.",
    contactDesc: "If you have questions about our warranty policy or need to file a warranty claim, please contact us:",
    returnHome: "Return to Home"
  },
  es: {
    overview: "En Hybrid Tech Auto, respaldamos nuestro trabajo y los productos que instalamos. Nuestra política de garantía está diseñada para darle confianza en nuestros servicios y proteger su inversión en tecnología de baterías híbridas.",
    newBatteriesTitle: "Baterías Nuevas",
    newBatteriesDesc: "Todas las baterías híbridas nuevas vienen con una garantía de 3 años que cubre defectos en materiales y mano de obra. Esta garantía proporciona una cobertura integral para su tranquilidad.",
    refurbishedBatteriesTitle: "Baterías Reconstruidas",
    refurbishedBatteriesDesc: "Todas las baterías híbridas reconstruidas vienen con una garantía de 6 meses que cubre defectos en materiales y mano de obra. Las baterías reconstruidas proporcionan una solución económica manteniendo estándares de calidad.",
    whatsCovered: "Nuestras garantías de baterías cubren:",
    whatsNotCovered: "La cobertura de garantía no incluye:",
    mobileInstallation: "Importante: Servicio de Instalación Móvil/Domiciliario",
    mobileInstallationDesc: "Si la batería se instala en su ubicación (servicio móvil/domiciliario), la cobertura de garantía se cumplirá en nuestras instalaciones de servicio. Por favor traiga su vehículo a nuestra ubicación para cualquier servicio o reclamo relacionado con garantía.",
    contactDesc: "Si tiene preguntas sobre nuestra política de garantía o necesita presentar un reclamo de garantía, comuníquese con nosotros:",
    returnHome: "Volver al Inicio"
  }
}

export default function WarrantyPage() {
  const { t, locale } = useLanguage()
  const isSpanish = locale === 'es'
  const content = warrantyTranslations[locale]
  
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-primary-500 text-white section-padding">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {t.warranty?.title || 'Warranty Policy'}
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            {t.warranty?.subtitle || 'Comprehensive warranty coverage for your peace of mind'}
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom max-w-4xl">
          <div className="card prose prose-lg max-w-none">
            <p className="text-gray-600 mb-8">
              <strong>{isSpanish ? 'Última Actualización:' : 'Last Updated:'}</strong> {new Date().toLocaleDateString(isSpanish ? 'es-ES' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{isSpanish ? '1. Resumen de Garantía' : '1. Warranty Overview'}</h2>
                <p className="text-gray-700 leading-relaxed">{content.overview}</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{isSpanish ? '2. Garantías de Baterías Híbridas' : '2. Hybrid Battery Warranties'}</h2>
                
                <div className="bg-green-50 border-l-4 border-secondary-500 p-6 my-6 rounded-r-lg">
                  <div className="flex items-start mb-4">
                    <div className="w-12 h-12 bg-secondary-500 rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                      <span className="text-white font-bold text-xl">✓</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{content.newBatteriesTitle}</h3>
                      <p className="text-gray-700 leading-relaxed">
                        <strong className="text-secondary-600">{isSpanish ? '3 años de garantía' : '3-year warranty'}</strong> {isSpanish ? 'cubriendo defectos en materiales y mano de obra. Esta garantía proporciona una cobertura integral para su tranquilidad.' : 'covering defects in materials and workmanship. This warranty provides comprehensive coverage for your peace of mind.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border-l-4 border-primary-500 p-6 my-6 rounded-r-lg">
                  <div className="flex items-start mb-4">
                    <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                      <span className="text-white font-bold text-xl">✓</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{content.refurbishedBatteriesTitle}</h3>
                      <p className="text-gray-700 leading-relaxed">
                        <strong className="text-primary-600">{isSpanish ? '6 meses de garantía' : '6-month warranty'}</strong> {isSpanish ? 'cubriendo defectos en materiales y mano de obra. Las baterías reconstruidas proporcionan una solución económica manteniendo estándares de calidad.' : 'covering defects in materials and workmanship. Refurbished batteries provide a cost-effective solution while maintaining quality standards.'}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{isSpanish ? '3. Lo que está Cubierto' : '3. What\'s Covered'}</h2>
                <p className="text-gray-700 leading-relaxed mb-4">{content.whatsCovered}</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>{isSpanish ? 'Defectos de fabricación en celdas o módulos de batería' : 'Manufacturing defects in battery cells or modules'}</li>
                  <li>{isSpanish ? 'Pérdida prematura de capacidad no atribuible al desgaste normal' : 'Premature capacity loss not attributable to normal wear'}</li>
                  <li>{isSpanish ? 'Fallo debido a materiales defectuosos o mano de obra' : 'Failure due to defective materials or workmanship'}</li>
                  <li>{isSpanish ? 'Fallas del sistema de gestión de batería (BMS)' : 'Battery management system (BMS) failures'}</li>
                  <li>{isSpanish ? 'Instalación inadecuada por nuestros técnicos' : 'Improper installation by our technicians'}</li>
                  <li>{isSpanish ? 'Reemplazo de componentes defectuosos de la batería' : 'Replacement of defective battery components'}</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{isSpanish ? '4. Lo que NO está Cubierto' : '4. What\'s Not Covered'}</h2>
                <p className="text-gray-700 leading-relaxed mb-4">{content.whatsNotCovered}</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>{isSpanish ? 'Desgaste normal o pérdida gradual de capacidad con el tiempo' : 'Normal wear and tear or gradual capacity loss over time'}</li>
                  <li>{isSpanish ? 'Daño por accidentes, colisiones o impacto' : 'Damage from accidents, collisions, or impact'}</li>
                  <li>{isSpanish ? 'Daño por mal uso, abuso o negligencia' : 'Damage from misuse, abuse, or neglect'}</li>
                  <li>{isSpanish ? 'Daño por modificaciones o instalación inadecuada por terceros' : 'Damage from modifications or improper installation by third parties'}</li>
                  <li>{isSpanish ? 'Daño por condiciones climáticas extremas o factores ambientales' : 'Damage from extreme weather conditions or environmental factors'}</li>
                  <li>{isSpanish ? 'Daño por agua o exposición a sustancias corrosivas' : 'Water damage or exposure to corrosive substances'}</li>
                  <li>{isSpanish ? 'Daño por fallas del sistema eléctrico no relacionadas con la batería' : 'Damage from electrical system failures not related to the battery'}</li>
                  <li>{isSpanish ? 'Tarifas de extracción e reinstalación de la batería (a menos que sea reparación de garantía)' : 'Battery removal and reinstillation fees (unless warranty repair)'}</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{isSpanish ? '5. Cobertura de Instalación Móvil' : '5. Mobile Installation Coverage'}</h2>
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 my-6 rounded-r-lg">
                  <p className="text-gray-700 leading-relaxed font-semibold mb-2">{content.mobileInstallation}</p>
                  <p className="text-gray-700 leading-relaxed">{content.mobileInstallationDesc}</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{isSpanish ? '6. Proceso de Servicio de Garantía' : '6. Warranty Service Process'}</h2>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center flex-shrink-0 mr-4 mt-1">
                      <span className="font-bold">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">{isSpanish ? 'Contáctenos' : 'Contact Us'}</h4>
                      <p className="text-gray-700">{isSpanish ? 'Comuníquese con nosotros tan pronto como note algún problema con su batería.' : 'Reach out to us as soon as you notice any issues with your battery.'}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center flex-shrink-0 mr-4 mt-1">
                      <span className="font-bold">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">{isSpanish ? 'Inspección de Diagnóstico' : 'Diagnostic Inspection'}</h4>
                      <p className="text-gray-700">{isSpanish ? 'Inspeccionaremos su batería para determinar si el problema está cubierto por la garantía.' : 'We will inspect your battery to determine if the issue is covered under warranty.'}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center flex-shrink-0 mr-4 mt-1">
                      <span className="font-bold">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">{isSpanish ? 'Reparación o Reemplazo de Garantía' : 'Warranty Repair or Replacement'}</h4>
                      <p className="text-gray-700">{isSpanish ? 'Si está cubierto, repararemos o reemplazaremos la batería sin costo adicional para usted.' : 'If covered, we will repair or replace the battery at no additional cost to you.'}</p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{isSpanish ? '7. Transferencia de Garantía y Documentación' : '7. Warranty Transfer and Documentation'}</h2>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>{isSpanish ? 'Mantenga toda la documentación de garantía y registros de servicio' : 'Keep all warranty documentation and service records'}</li>
                  <li>{isSpanish ? 'La garantía es transferible con el vehículo (durante el período de garantía)' : 'Warranty is transferable with the vehicle (for the warranty period)'}</li>
                  <li>{isSpanish ? 'Presente la tarjeta de garantía o recibo de servicio para reclamos de garantía' : 'Present warranty card or service receipt for warranty claims'}</li>
                  <li>{isSpanish ? 'El mantenimiento regular puede ser requerido para mantener la cobertura de garantía' : 'Regular maintenance may be required to maintain warranty coverage'}</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{isSpanish ? '8. Garantía de Otros Servicios' : '8. Other Services Warranty'}</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {isSpanish ? 'La cobertura de garantía para otros servicios automotrices varía según el tipo de servicio:' : 'Warranty coverage for other automotive services varies by service type:'}
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>{isSpanish ? 'La cobertura de garantía de piezas se describirá en el momento del servicio' : 'Parts warranty coverage will be outlined at the time of service'}</li>
                  <li>{isSpanish ? 'La garantía de mano de obra generalmente cubre la calidad del trabajo por 90 días o 3,000 millas' : 'Labor warranty typically covers workmanship for 90 days or 3,000 miles'}</li>
                  <li>{isSpanish ? 'Los términos específicos de garantía se proporcionarán con su documentación de servicio' : 'Specific warranty terms will be provided with your service documentation'}</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{isSpanish ? '9. Limitaciones y Exenciones' : '9. Limitations and Disclaimers'}</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {isSpanish ? 'Esta garantía es la garantía exclusiva proporcionada para nuestros servicios. En la medida máxima permitida por la ley:' : 'This warranty is the exclusive warranty provided for our services. To the fullest extent permitted by law:'}
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>{isSpanish ? 'Esta garantía reemplaza a todas las demás garantías, expresas o implícitas' : 'This warranty is in lieu of all other warranties, express or implied'}</li>
                  <li>{isSpanish ? 'Nuestra responsabilidad se limita a la reparación o reemplazo de piezas defectuosas' : 'Our liability is limited to the repair or replacement of defective parts'}</li>
                  <li>{isSpanish ? 'No somos responsables de daños consecuentes o incidentales' : 'We are not liable for consequential or incidental damages'}</li>
                  <li>{isSpanish ? 'Algunos estados no permiten limitaciones en garantías implícitas o daños incidentales' : 'Some states do not allow limitations on implied warranties or incidental damages'}</li>
                </ul>
              </section>

              <section className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{isSpanish ? 'Contáctenos' : 'Contact Us'}</h2>
                <p className="text-gray-700 leading-relaxed mb-2">{content.contactDesc}</p>
                <p className="text-gray-700 leading-relaxed">
                  <strong>Hybrid Tech Automotive LLC</strong><br />
                  {isSpanish ? 'Haciendo negocio como' : 'DBA'}: Hybrid Tech Auto<br />
                  24422 Starview Landing Ct, Spring, TX 77373<br />
                  {isSpanish ? 'Teléfono:' : 'Phone:'} <a href="tel:+18327625299" className="text-primary-600 hover:underline">(832) 762-5299</a><br />
                  {isSpanish ? 'Correo:' : 'Email:'} <a href="mailto:info@hybridtechauto.com" className="text-primary-600 hover:underline">info@hybridtechauto.com</a>
                </p>
              </section>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-300 text-center">
              <Link href="/" className="btn-primary">
                {content.returnHome}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
