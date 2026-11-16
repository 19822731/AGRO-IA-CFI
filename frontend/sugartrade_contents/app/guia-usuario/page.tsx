import Link from "next/link"

export default function GuiaUsuario() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-6">Guía de Usuario - Sugar Trade</h1>

      <div className="bg-[#111936] rounded-lg p-6 border border-[#1a2040] mb-8">
        <h2 className="text-xl font-bold text-[#00a8ff] mb-4">Bienvenido a Sugar Trade</h2>
        <p className="text-gray-300 mb-4">
          Esta plataforma está diseñada para facilitar todas sus operaciones relacionadas con el comercio de azúcar. A
          continuación, encontrará una explicación detallada de cada sección de la aplicación.
        </p>
      </div>

      <div className="space-y-8">
        <Section
          title="Dashboard"
          icon={
            <div className="w-10 h-10 rounded-full bg-[#1a2040] flex items-center justify-center text-[#00a8ff]">D</div>
          }
          description="El Dashboard es su centro de control principal donde podrá visualizar:"
          items={[
            "Precios actuales del azúcar en el mercado",
            "Gráficos de evolución de precios",
            "Tendencias del mercado",
            "Resumen de su portafolio",
            "Alertas y notificaciones importantes",
          ]}
          link="/dashboard"
        />

        <Section
          title="Portafolio"
          icon={
            <div className="w-10 h-10 rounded-full bg-[#1a2040] flex items-center justify-center text-[#00a8ff]">P</div>
          }
          description="En la sección de Portafolio podrá gestionar todas sus inversiones y posiciones:"
          items={[
            "Visualización de sus contratos actuales",
            "Seguimiento del rendimiento de sus inversiones",
            "Balance general de ganancias y pérdidas",
            "Historial de operaciones",
            "Análisis de rendimiento por período",
          ]}
          link="/portafolio"
        />

        <Section
          title="Operar"
          icon={
            <div className="w-10 h-10 rounded-full bg-[#1a2040] flex items-center justify-center text-[#00a8ff]">O</div>
          }
          description="La sección de Operar le permite ejecutar transacciones en el mercado:"
          items={[
            "Compra y venta de contratos de azúcar",
            "Establecimiento de órdenes limitadas",
            "Acceso al libro de órdenes en tiempo real",
            "Ejecución rápida de operaciones",
            "Confirmación y seguimiento de transacciones",
          ]}
          link="/operar"
        />

        <h2 className="text-xl font-bold text-white mt-12 mb-6">Utilidades</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UtilityCard
            title="Canje"
            description="Gestione operaciones de intercambio de productos por insumos o servicios sin utilizar dinero en efectivo."
            link="/utilidades/canje"
          />

          <UtilityCard
            title="Cobertura"
            description="Herramientas para proteger sus operaciones contra la volatilidad de precios mediante contratos de futuros y opciones."
            link="/utilidades/cobertura"
          />

          <UtilityCard
            title="Warrants"
            description="Gestione certificados de depósito que le permiten utilizar mercadería almacenada como garantía para financiamiento."
            link="/utilidades/warrants"
          />

          <UtilityCard
            title="Financiación"
            description="Acceda a opciones de crédito y financiamiento específicas para el sector azucarero y sus operaciones comerciales."
            link="/utilidades/financiacion"
          />

          <UtilityCard
            title="Insumos"
            description="Gestione la compra y seguimiento de insumos necesarios para la producción y procesamiento de azúcar."
            link="/utilidades/insumos"
          />

          <UtilityCard
            title="Almacenaje"
            description="Administre espacios de almacenamiento, controle inventario y gestione la logística de sus productos."
            link="/utilidades/almacenaje"
          />

          <UtilityCard
            title="Flete"
            description="Coordine el transporte de su mercadería, compare costos y gestione la logística de distribución."
            link="/utilidades/flete"
          />

          <UtilityCard
            title="Depósito Fiscal"
            description="Gestione almacenamiento en depósitos con beneficios fiscales para operaciones de exportación e importación."
            link="/utilidades/deposito-fiscal"
          />

          <UtilityCard
            title="Seguro agropecuario"
            description="Proteja sus cultivos, instalaciones y operaciones con seguros específicos para el sector azucarero."
            link="/utilidades/seguros"
          />
        </div>
      </div>
    </div>
  )
}

function Section({ title, icon, description, items, link }) {
  return (
    <div className="bg-[#111936] rounded-lg p-6 border border-[#1a2040]">
      <div className="flex items-center mb-4">
        {icon}
        <h2 className="text-xl font-bold text-white ml-3">{title}</h2>
      </div>

      <p className="text-gray-300 mb-3">{description}</p>

      <ul className="list-disc pl-5 mb-4 space-y-1">
        {items.map((item, index) => (
          <li key={index} className="text-gray-300">
            {item}
          </li>
        ))}
      </ul>

      <Link
        href={link}
        className="inline-block px-4 py-2 bg-[#1a2040] text-[#00a8ff] rounded hover:bg-[#2a3050] transition-colors"
      >
        Ir a {title}
      </Link>
    </div>
  )
}

function UtilityCard({ title, description, link }) {
  return (
    <div className="bg-[#111936] rounded-lg p-5 border border-[#1a2040] hover:border-[#00a8ff] transition-colors">
      <h3 className="text-lg font-semibold text-[#00a8ff] mb-2">{title}</h3>
      <p className="text-gray-300 text-sm mb-4">{description}</p>
      <Link href={link} className="text-sm text-white hover:text-[#00a8ff] transition-colors">
        Explorar →
      </Link>
    </div>
  )
}
