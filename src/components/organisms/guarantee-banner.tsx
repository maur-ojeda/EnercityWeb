import { ShieldCheck, Zap, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const doubleGuarantee = [
  {
    title: "Inversión Protegida",
    subtitle: "Hasta 120 meses",
    description: "Cubrimos la instalación y los equipos hasta la recuperación total de tu inversión (ROI), con un máximo de 10 años.",
    tag: "Garantía de ROI",
    icon: ShieldCheck,
    color: "#F07E04",
  },
  {
    title: "Extensión Técnica",
    subtitle: "Hasta 10 años",
    description: "Si recuperas tu inversión antes de los 10 años (lo habitual), extendemos la garantía de tus equipos sin costo extra.",
    tag: "Sin costo adicional",
    icon: Zap,
    color: "#4AAF4D",
  }
];

export function GuaranteeBanner() {
  return (
    <section className="py-24 relative overflow-hidden" 
      style={{ background: 'linear-gradient(135deg, #0A1929 0%, #154660 60%, #0D2D3E 100%)' }}>
      
      {/* ── TU FONDO DE GRILLA TÉCNICA ── */}
      <div 
        className="absolute inset-0 opacity-[0.05] pointer-events-none" 
        style={{ 
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.8) 1px, transparent 1px), 
            linear-gradient(90deg, rgba(255, 255, 255, 0.8) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px' 
        }} 
      />
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-black font-sans uppercase tracking-[0.25em] mb-4 text-[#4AAF4D]">
            Nuestro Diferenciador
          </p>
          <h2 className="text-4xl md:text-5xl font-semibold font-sans text-white mb-6 leading-tight">
            La Doble Garantía <span style={{ color: '#F09C0A' }}>Enercity</span>
          </h2>
          <p className="text-white/60 text-lg">
            Nos involucramos de principio a fin. Si nosotros no confiamos en la instalación, no te la vendemos.
          </p>
        </div>

        {/* 2 Guarantee Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {doubleGuarantee.map((card, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="relative p-8 md:p-10 rounded-[2.5rem] overflow-hidden border backdrop-blur-sm"
              style={{ 
                background: 'rgba(255,255,255,0.03)', 
                borderColor: `${card.color}30`
              }}
            >
              <div className="flex items-start gap-6 mb-8">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border shadow-lg"
                  style={{ 
                    backgroundColor: `${card.color}15`, 
                    borderColor: `${card.color}40`,
                    color: card.color 
                  }}
                >
                  <card.icon className="w-8 h-8" />
                </div>
                <div>
                  <div className="text-[10px] font-bold font-sans uppercase tracking-[0.2em] mb-2" style={{ color: card.color }}>
                    {card.subtitle}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold font-sans text-white tracking-tight">
                    {card.title}
                  </h3>
                </div>
              </div>

              <p className="text-white/50 leading-relaxed mb-8 text-lg">
                {card.description}
              </p>

              <div 
                className="flex items-center gap-3 px-5 py-4 rounded-2xl border"
                style={{ 
                  backgroundColor: `${card.color}08`, 
                  borderColor: `${card.color}20` 
                }}
              >
                <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: card.color }} />
                <span className="font-black font-sans text-sm text-white/90">
                  {card.tag}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}