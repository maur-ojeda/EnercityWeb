import { Sun, Battery, Zap, Wrench, CheckCircle2, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const solutions = [
  {
    id: "on-grid",
    title: "Sistemas On-Grid",
    badge: "Más popular",
    description: "Energía inteligente para ciudades. Genera, consume y vende tus excedentes legalmente con Net Billing.",
    icon: Sun,
    features: ["Conexión a red pública", "Inyección de excedentes", "Sin baterías requeridas", "Máxima rentabilidad"],
    color: 'rgb(240, 126, 4)',
    colorbg: 'rgba(240, 126, 4, 0.08)',
    tooltip: 'Sistema conectado a la red pública. Genera energía del sol durante el día, consume de la red por la noche, e inyecta excedentes con Net Billing.'
  },
  {
    id: "off-grid",
    title: "Sistemas Off-Grid",
    badge: "Independencia total",
    description: "La solución definitiva para parcelas o zonas sin acceso a la red eléctrica tradicional.",
    icon: Battery,
    features: ["Autonomía energética", "Baterías de alta densidad", "Ideal para zonas rurales", "Cero facturas eléctricas"],
    color:"rgb(74, 175, 77)",
    colorbg:"rgba(74, 175, 77, 0.08)",
    tooltip: 'Sistema autónomo con baterías. Ideal para zonas rurales sin acceso a red eléctrica. Almacena energía para usar 24/7.'
  },
  {
    id: "hybrid",
    title: "Sistemas Híbridos",
    badge: "Lo mejor de dos mundos",
    description: "Mantén la conexión a la red pero con respaldo de baterías para cortes de luz.",
    icon: Zap,
    features: ["Respaldo ante apagones", "Optimización de consumo", "Gestión inteligente", "Continuidad operativa"],
    color:"rgb(240, 126, 4)",
    colorbg:"rgba(240, 126, 4, 0.08)",
    tooltip:'Combina paneles, baterías y conexión a red. Inyecta excedentes y tiene respaldo automático ante cortes de suministro.'
  },
  {
    id: "maintenance",
    title: "Mantención",
    badge: "Protege tu inversión",
    description: "Limpieza técnica y revisión de sistemas para asegurar el 100% de rendimiento.",
    icon: Wrench,
    features: ["Limpieza técnica", "Termografía de paneles", "Informe de rendimiento", "Extensión de vida útil"],
    color:"rgb(21, 70, 96)",
    colorbg:"rgb(21, 70, 96, 0.08)",
    tooltip: 'Servicio de limpieza y revisión técnica profesional para mantener tus paneles al 100% de rendimiento todo el año.'

  }
];

export function SolutionsGrid() {
  // Variantes para animar la lista de checkmarks uno por uno
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <section id="soluciones" className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-6">
        
        {/* Header con Animación de Entrada */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <p className="text-sm font-black font-sans uppercase tracking-[0.25em] mb-4 text-[#F07E04]">
            Nuestras Soluciones
          </p>
          <h2 className="text-4xl md:text-5xl font-semibold font-sans mb-6 text-[#154660] leading-tight">
            Cuatro soluciones, un solo objetivo:<br />
            <span style={{color: '#F07E04'}}>tu independencia energética.</span>
          </h2>
        </motion.div>

        {/* Grid de Tarjetas */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {solutions.map((item, index) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ 
                duration: 0.5, 
                delay: index * 0.15, // Efecto cascada entre tarjetas
                ease: [0.21, 0.47, 0.32, 0.98] // Cubic-bezier para un slide suave
              }}
              whileHover={{ y: -10 }} // Pequeño salto al pasar el mouse
              className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-50 flex flex-col h-full"
              style={{
                borderWidth: '4px 1px 1px',
                borderStyle: 'solid',
                borderColor: `${item.color} ${item.colorbg} ${item.colorbg}`,
              }}
            >
              {/* Badge superior */}
              <div className="mb-5">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black font-sans" 
                       style={{backgroundColor: item.colorbg, color: item.color}}>
                  {item.badge}
                </span>
              </div>
              
              {/* Contenedor de Icono con pulso sutil */}
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                style={{ "--accent-color": item.color }} 
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 bg-[var(--accent-color)]/10"
              >
                <item.icon className="w-7 h-7 text-[var(--accent-color)]" />
              </motion.div>

              {/* Título y Tooltip */}
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-xl font-bold font-sans text-[#154660]">{item.title}</h3>
                <div className="relative group inline-flex items-center">
                  <Info className="w-4 h-4 text-gray-400 cursor-help hover:text-[#154660] transition-colors" />
                  <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 flex flex-col items-center invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50">
                    <div className="relative bg-[#154660] text-white text-xs p-3 rounded-lg shadow-xl max-w-[250px] sm:max-w-[300px] w-max text-center leading-relaxed">
                      {item.tooltip}
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-[#154660]"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-500 leading-relaxed mb-6 text-sm flex-grow">
                {item.description}
              </p>

              {/* Lista de Features con animación escalonada */}
              <motion.ul 
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="space-y-3"
              >
                {item.features.map((feature, i) => (
                  <motion.li 
                    key={i}
                    variants={itemVariants}
                    className="flex items-center gap-2.5 text-sm"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0" style={{color: item.color}} />
                    <span className="text-gray-600">{feature}</span>
                  </motion.li>
                ))}
              </motion.ul>            
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}