'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

const termsTranslations = {
  en: {
    acceptance: "By accessing and using Hybrid Tech Auto's services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our services.",
    servicesSpecializes: "Hybrid Tech Auto specializes in:",
    warrantyNew: "All new batteries come with a ",
    warrantyRefurbished: "All refurbished batteries come with a ",
    warrantyCovers: " covering defects in materials and workmanship. Warranty does not cover damage from accidents, misuse, or improper installation by third parties.",
    pricing: "Pricing:",
    pricingDesc: "All prices are quoted in USD and are subject to change. Transparent pricing is provided before service begins. Final pricing may vary based on vehicle condition and additional services needed.",
    paymentMethods: "Payment Methods:",
    paymentDesc: "We accept cash, Zelle, and credit/debit cards. Payment is due upon service completion unless prior arrangements have been made.",
    cancellation: "We request at least 24 hours notice for appointment cancellations. Failure to cancel or show up for a scheduled appointment may result in a cancellation fee.",
    liabilityTitle: "Hybrid Tech Auto's liability is limited to the cost of services provided. We are not liable for:",
    responsibilitiesTitle: "Vehicle owner responsibilities:",
    privacyDesc: "Your personal information is handled according to our Privacy Policy. By using our services, you consent to our collection and use of information as described in that policy.",
    dispute: "Any disputes arising from our services will be resolved through mutual discussion. We strive to ensure customer satisfaction and will work with you to resolve any concerns.",
    changes: "We reserve the right to modify these terms at any time. Continued use of our services after changes constitutes acceptance of the new terms.",
    contactDesc: "For questions about these terms, please contact us:",
    returnHome: "Return to Home"
  },
  es: {
    acceptance: "Al acceder y utilizar los servicios de Hybrid Tech Auto, usted acepta y se compromete a cumplir con los términos y disposiciones de este acuerdo. Si no está de acuerdo con estos términos, por favor no utilice nuestros servicios.",
    servicesSpecializes: "Hybrid Tech Auto se especializa en:",
    warrantyNew: "Todas las baterías nuevas vienen con una garantía de ",
    warrantyRefurbished: "Todas las baterías reconstruidas vienen con una garantía de ",
    warrantyCovers: " que cubre defectos en materiales y mano de obra. La garantía no cubre daños por accidentes, mal uso o instalación inadecuada por terceros.",
    pricing: "Precios:",
    pricingDesc: "Todos los precios cotizados en USD y están sujetos a cambios. Los precios transparentes se proporcionan antes de que comience el servicio. Los precios finales pueden variar según la condición del vehículo y los servicios adicionales necesarios.",
    paymentMethods: "Métodos de Pago:",
    paymentDesc: "Aceptamos efectivo, Zelle y tarjetas de crédito/débito. El pago se realiza al completar el servicio a menos que se hayan hecho arreglos previos.",
    cancellation: "Solicitamos al menos 24 horas de anticipación para cancelaciones de citas. La falta de cancelación o no presentarse a una cita programada puede resultar en una tarifa de cancelación.",
    liabilityTitle: "La responsabilidad de Hybrid Tech Auto se limita al costo de los servicios proporcionados. No somos responsables de:",
    responsibilitiesTitle: "Responsabilidades del propietario del vehículo:",
    privacyDesc: "Su información personal se maneja de acuerdo con nuestra Política de Privacidad. Al usar nuestros servicios, usted acepta nuestra recopilación y uso de información como se describe en esa política.",
    dispute: "Cualquier disputa que surja de nuestros servicios se resolverá mediante discusión mutua. Nos esforzamos por garantizar la satisfacción del cliente y trabajaremos con usted para resolver cualquier inquietud.",
    changes: "Nos reservamos el derecho de modificar estos términos en cualquier momento. El uso continuo de nuestros servicios después de los cambios constituye la aceptación de los nuevos términos.",
    contactDesc: "Para preguntas sobre estos términos, comuníquese con nosotros:",
    returnHome: "Volver al Inicio"
  }
}

export default function TermsPage() {
  const { t, locale } = useLanguage()
  const isSpanish = locale === 'es'
  const content = termsTranslations[locale]
  
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-primary-500 text-white section-padding">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {t.terms?.title || 'Terms of Service'}
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            {t.terms?.subtitle || 'Please read these terms carefully before using our services'}
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
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{isSpanish ? '1. Aceptación de Términos' : '1. Acceptance of Terms'}</h2>
                <p className="text-gray-700 leading-relaxed">{content.acceptance}</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{isSpanish ? '2. Servicios Proporcionados' : '2. Services Provided'}</h2>
                <p className="text-gray-700 leading-relaxed mb-4">{content.servicesSpecializes}</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>{isSpanish ? 'Reemplazo de baterías híbridas y diagnósticos' : 'Hybrid battery replacement and diagnostics'}</li>
                  <li>{isSpanish ? 'Servicios automotrices generales, incluyendo reemplazo de frenos, reparación de suspensión, servicios de transmisión y purga de refrigerante' : 'General automotive services including brake replacement, suspension repair, transmission services, and coolant flush'}</li>
                  <li>{isSpanish ? 'Diagnósticos e inspecciones de vehículos' : 'Vehicle diagnostics and inspections'}</li>
                  <li>{isSpanish ? 'Reserva de citas en línea' : 'Online appointment booking'}</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{isSpanish ? '3. Información de Garantía' : '3. Warranty Information'}</h2>
                <div className="bg-green-50 border-l-4 border-secondary-500 p-4 my-4">
                  <p className="text-gray-700 leading-relaxed font-semibold mb-2">{isSpanish ? 'Baterías Nuevas:' : 'New Batteries:'}</p>
                  <p className="text-gray-700 leading-relaxed">
                    {content.warrantyNew}<strong>{isSpanish ? '3 años' : '3-year warranty'}</strong>{content.warrantyCovers}
                  </p>
                </div>
                <div className="bg-blue-50 border-l-4 border-primary-500 p-4 my-4">
                  <p className="text-gray-700 leading-relaxed font-semibold mb-2">{isSpanish ? 'Baterías Reconstruidas:' : 'Refurbished Batteries:'}</p>
                  <p className="text-gray-700 leading-relaxed">
                    {content.warrantyRefurbished}<strong>{isSpanish ? '6 meses' : '6-month warranty'}</strong>{content.warrantyCovers}
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{isSpanish ? '4. Precios y Pago' : '4. Pricing and Payment'}</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  <strong>{content.pricing}</strong> {content.pricingDesc}
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  <strong>{content.paymentMethods}</strong> {content.paymentDesc}
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{isSpanish ? '5. Cancelación de Citas' : '5. Appointment Cancellation'}</h2>
                <p className="text-gray-700 leading-relaxed">{content.cancellation}</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{isSpanish ? '6. Limitación de Responsabilidad' : '6. Limitation of Liability'}</h2>
                <p className="text-gray-700 leading-relaxed mb-4">{content.liabilityTitle}</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>{isSpanish ? 'Daños consecuentes, indirectos o incidentales' : 'Consequential, indirect, or incidental damages'}</li>
                  <li>{isSpanish ? 'Condiciones preexistentes del vehículo' : 'Pre-existing vehicle conditions'}</li>
                  <li>{isSpanish ? 'Daños resultantes de mal uso o modificación por el cliente' : 'Damage resulting from customer misuse or modification'}</li>
                  <li>{isSpanish ? 'Problemas derivados de piezas de repuesto no suministradas por nosotros' : 'Issues arising from aftermarket parts not supplied by us'}</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{isSpanish ? '7. Responsabilidades del Propietario del Vehículo' : '7. Vehicle Owner Responsibilities'}</h2>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>{isSpanish ? 'Proporcionar información precisa del vehículo e historial de servicio' : 'Provide accurate vehicle information and service history'}</li>
                  <li>{isSpanish ? 'Notificarnos de cualquier modificación o trabajo previo realizado al vehículo' : 'Notify us of any modifications or previous work done to the vehicle'}</li>
                  <li>{isSpanish ? 'Recoger su vehículo oportunamente después de completar el servicio' : 'Pick up your vehicle promptly after service completion'}</li>
                  <li>{isSpanish ? 'Mantener documentación adecuada del vehículo para reclamos de garantía' : 'Maintain proper vehicle documentation for warranty claims'}</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{isSpanish ? '8. Política de Privacidad' : '8. Privacy Policy'}</h2>
                <p className="text-gray-700 leading-relaxed">{content.privacyDesc}</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{isSpanish ? '9. Resolución de Disputas' : '9. Dispute Resolution'}</h2>
                <p className="text-gray-700 leading-relaxed">{content.dispute}</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{isSpanish ? '10. Cambios a los Términos' : '10. Changes to Terms'}</h2>
                <p className="text-gray-700 leading-relaxed">{content.changes}</p>
              </section>

              <section className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{isSpanish ? 'Información de Contacto' : 'Contact Information'}</h2>
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
