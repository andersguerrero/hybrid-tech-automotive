'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

const privacyTranslations = {
  en: {
    intro: "At Hybrid Tech Auto, we value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, services, or interact with our business.",
    infoCollectPersonal: "Personal Information:",
    infoCollectAuto: "Automatically Collected Information:",
    useInfoTitle: "We use the information we collect to:",
    shareInfoTitle: "We do not sell your personal information. We may share your information only in the following circumstances:",
    security: "We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.",
    rightsTitle: "You have the right to:",
    cookies: "We use cookies and similar tracking technologies to improve your browsing experience, analyze site traffic, and understand where our visitors come from. You can control cookie preferences through your browser settings. Disabling cookies may affect the functionality of our website.",
    thirdParty: "Our website may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to review the privacy policies of any third-party sites you visit.",
    children: "Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If we become aware that we have collected information from a child, we will take steps to delete such information.",
    changes: "We may update this Privacy Policy from time to time. The most current version will be posted on this page with an updated 'Last Updated' date. We encourage you to review this policy periodically to stay informed about how we protect your information.",
    contactDesc: "If you have questions about this Privacy Policy or wish to exercise your privacy rights, please contact us:",
    returnHome: "Return to Home"
  },
  es: {
    intro: "En Hybrid Tech Auto, valoramos su privacidad y nos comprometemos a proteger su información personal. Esta Política de Privacidad explica cómo recopilamos, usamos, divulgamos y protegemos su información cuando utiliza nuestro sitio web, servicios o interactúa con nuestro negocio.",
    infoCollectPersonal: "Información Personal:",
    infoCollectAuto: "Información Recopilada Automáticamente:",
    useInfoTitle: "Utilizamos la información que recopilamos para:",
    shareInfoTitle: "No vendemos su información personal. Solo podemos compartir su información en las siguientes circunstancias:",
    security: "Implementamos medidas de seguridad técnicas y organizacionales apropiadas para proteger su información personal contra acceso no autorizado, alteración, divulgación o destrucción. Sin embargo, ningún método de transmisión por internet o almacenamiento electrónico es 100% seguro, y no podemos garantizar seguridad absoluta.",
    rightsTitle: "Usted tiene derecho a:",
    cookies: "Utilizamos cookies y tecnologías de seguimiento similares para mejorar su experiencia de navegación, analizar el tráfico del sitio y entender de dónde vienen nuestros visitantes. Puede controlar las preferencias de cookies a través de la configuración de su navegador. Deshabilitar las cookies puede afectar la funcionalidad de nuestro sitio web.",
    thirdParty: "Nuestro sitio web puede contener enlaces a sitios web de terceros. No somos responsables de las prácticas de privacidad de estos sitios externos. Le recomendamos revisar las políticas de privacidad de cualquier sitio de terceros que visite.",
    children: "Nuestros servicios no están dirigidos a personas menores de 18 años. No recopilamos intencionalmente información personal de niños. Si nos damos cuenta de que hemos recopilado información de un niño, tomaremos medidas para eliminar dicha información.",
    changes: "Podemos actualizar esta Política de Privacidad de vez en cuando. La versión más actual se publicará en esta página con una fecha de 'Última Actualización' actualizada. Le recomendamos revisar esta política periódicamente para mantenerse informado sobre cómo protegemos su información.",
    contactDesc: "Si tiene preguntas sobre esta Política de Privacidad o desea ejercer sus derechos de privacidad, comuníquese con nosotros:",
    returnHome: "Volver al Inicio"
  }
}

export default function PrivacyPage() {
  const { t, locale } = useLanguage()
  const isSpanish = locale === 'es'
  const content = privacyTranslations[locale]
  
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-primary-500 text-white section-padding">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {t.privacy?.title || 'Privacy Policy'}
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            {t.privacy?.subtitle || 'How we collect, use, and protect your personal information'}
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
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{isSpanish ? '1. Introducción' : '1. Introduction'}</h2>
                <p className="text-gray-700 leading-relaxed">{content.intro}</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{isSpanish ? '2. Información que Recopilamos' : '2. Information We Collect'}</h2>
                <div className="bg-blue-50 border-l-4 border-primary-500 p-4 my-4">
                  <p className="text-gray-700 leading-relaxed font-semibold mb-2">{content.infoCollectPersonal}</p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>{isSpanish ? 'Nombre e información de contacto (correo electrónico, teléfono, dirección)' : 'Name and contact information (email, phone number, address)'}</li>
                    <li>{isSpanish ? 'Información del vehículo (marca, modelo, año, VIN)' : 'Vehicle information (make, model, year, VIN)'}</li>
                    <li>{isSpanish ? 'Historial y registros de servicio' : 'Service history and records'}</li>
                    <li>{isSpanish ? 'Información de pago (procesada de forma segura a través de proveedores de terceros)' : 'Payment information (processed securely through third-party providers)'}</li>
                    <li>{isSpanish ? 'Detalles de citas y reservas' : 'Appointment and booking details'}</li>
                  </ul>
                </div>
                <div className="bg-gray-50 border-l-4 border-gray-400 p-4 my-4">
                  <p className="text-gray-700 leading-relaxed font-semibold mb-2">{content.infoCollectAuto}</p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>{isSpanish ? 'Datos de uso del sitio web y análisis' : 'Website usage data and analytics'}</li>
                    <li>{isSpanish ? 'Dirección IP e información del dispositivo' : 'IP address and device information'}</li>
                    <li>{isSpanish ? 'Tipo de navegador y preferencias' : 'Browser type and preferences'}</li>
                    <li>{isSpanish ? 'Páginas visitadas y tiempo en nuestro sitio' : 'Pages visited and time spent on our site'}</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{isSpanish ? '3. Cómo Usamos su Información' : '3. How We Use Your Information'}</h2>
                <p className="text-gray-700 leading-relaxed mb-4">{content.useInfoTitle}</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>{isSpanish ? 'Proporcionar, mantener y mejorar nuestros servicios automotrices' : 'Provide, maintain, and improve our automotive services'}</li>
                  <li>{isSpanish ? 'Procesar citas y solicitudes de servicio' : 'Process appointments and service requests'}</li>
                  <li>{isSpanish ? 'Enviar confirmaciones y recordatorios de citas' : 'Send appointment confirmations and reminders'}</li>
                  <li>{isSpanish ? 'Comunicarnos con usted sobre su vehículo y servicios' : 'Communicate with you about your vehicle and services'}</li>
                  <li>{isSpanish ? 'Procesar pagos y gestionar facturación' : 'Process payments and manage billing'}</li>
                  <li>{isSpanish ? 'Mantener registros de servicio y garantías precisos' : 'Maintain accurate service records and warranties'}</li>
                  <li>{isSpanish ? 'Enviar comunicaciones de marketing (con su consentimiento)' : 'Send marketing communications (with your consent)'}</li>
                  <li>{isSpanish ? 'Responder a consultas de servicio al cliente' : 'Respond to customer service inquiries'}</li>
                  <li>{isSpanish ? 'Cumplir con obligaciones legales' : 'Comply with legal obligations'}</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{isSpanish ? '4. Cómo Compartimos su Información' : '4. How We Share Your Information'}</h2>
                <p className="text-gray-700 leading-relaxed mb-4">{content.shareInfoTitle}</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li><strong>{isSpanish ? 'Proveedores de Servicios:' : 'Service Providers:'}</strong> {isSpanish ? 'Con proveedores de servicios de terceros confiables que ayudan en las operaciones (procesamiento de pagos, servicios de TI)' : 'With trusted third-party service providers who assist in operations (payment processing, IT services)'}</li>
                  <li><strong>{isSpanish ? 'Requisitos Legales:' : 'Legal Requirements:'}</strong> {isSpanish ? 'Cuando sea requerido por ley o en respuesta a procesos legales' : 'When required by law or in response to legal process'}</li>
                  <li><strong>{isSpanish ? 'Transferencias Comerciales:' : 'Business Transfers:'}</strong> {isSpanish ? 'En relación con cualquier fusión, adquisición o venta de activos' : 'In connection with any merger, acquisition, or sale of assets'}</li>
                  <li><strong>{isSpanish ? 'Consentimiento:' : 'Consent:'}</strong> {isSpanish ? 'Con su consentimiento explícito para cualquier otro propósito' : 'With your explicit consent for any other purpose'}</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{isSpanish ? '5. Seguridad de Datos' : '5. Data Security'}</h2>
                <p className="text-gray-700 leading-relaxed">{content.security}</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{isSpanish ? '6. Sus Derechos y Opciones' : '6. Your Rights and Choices'}</h2>
                <p className="text-gray-700 leading-relaxed mb-4">{content.rightsTitle}</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>{isSpanish ? 'Acceder y revisar su información personal' : 'Access and review your personal information'}</li>
                  <li>{isSpanish ? 'Solicitar correcciones a información inexacta' : 'Request corrections to inaccurate information'}</li>
                  <li>{isSpanish ? 'Solicitar eliminación de su información personal' : 'Request deletion of your personal information'}</li>
                  <li>{isSpanish ? 'Optar por no recibir comunicaciones de marketing' : 'Opt-out of marketing communications'}</li>
                  <li>{isSpanish ? 'Retirar el consentimiento para el procesamiento de datos (cuando corresponda)' : 'Withdraw consent for data processing (where applicable)'}</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{isSpanish ? '7. Cookies y Tecnologías de Seguimiento' : '7. Cookies and Tracking Technologies'}</h2>
                <p className="text-gray-700 leading-relaxed">{content.cookies}</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{isSpanish ? '8. Enlaces de Terceros' : '8. Third-Party Links'}</h2>
                <p className="text-gray-700 leading-relaxed">{content.thirdParty}</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{isSpanish ? '9. Privacidad de Menores' : '9. Children\'s Privacy'}</h2>
                <p className="text-gray-700 leading-relaxed">{content.children}</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{isSpanish ? '10. Cambios a Esta Política de Privacidad' : '10. Changes to This Privacy Policy'}</h2>
                <p className="text-gray-700 leading-relaxed">{content.changes}</p>
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
