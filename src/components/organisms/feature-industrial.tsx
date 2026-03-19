import { useState } from 'react';
import { 
  Building2, Leaf, ChevronLeft, ChevronRight, 
  CheckCircle2, ShieldCheck, BarChart3 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PROJECTS = [
  {
    id: 1,
    name: "Planta Industrial Maipú",
    type: "Logística",
    image: "https://images.unsplash.com/photo-1509391366360-fe5bb629550d?auto=format&fit=crop&q=80",
    saving: "45%",
    savingLabel: "Ahorro Mensual",
    alt: "Instalación solar en galpón industrial Enercity Maipú"
  },
  {
    id: 2,
    name: "Viña del Maipo",
    type: "Agricultura",
    image: "https://images.unsplash.com/photo-1466611653911-95282fc3656b?auto=format&fit=crop&q=80",
    saving: "$12M",
    savingLabel: "Ahorro Anual",
    alt: "Paneles solares Enercity en viñedo chileno"
  },
  {
    id: 3,
    name: "Clínica San Borja",
    type: "Salud",
    image: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&q=80",
    saving: "220kWp",
    savingLabel: "Potencia Instalada",
    alt: "Sistema solar Enercity en techo de edificio comercial Santiago"
  }
];

export function FeatureIndustrial() {
  const [activeProject, setActiveProject] = useState(0);

  const goNext = () => setActiveProject((prev) => (prev + 1) % PROJECTS.length);
  const goPrev = () => setActiveProject((prev) => (prev - 1 + PROJECTS.length) % PROJECTS.length);

  return (
    <section id="nosotros" className="py-24 bg-[#F8FAFC] overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          
          {/* ── COLUMNA IZQUIERDA: CAROUSEL DINÁMICO CON ZOOM ────────────────── */}
          <div className="relative group/carousel"> {/* group/carousel para controlar el hover de la imagen */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative rounded-[2.5rem] overflow-hidden shadow-[0_40px_80px_-20px_rgba(10,25,41,0.15)] aspect-[4/3] bg-gray-100 border-4 border-white"
            >
              <AnimatePresence mode="wait">
                <motion.img 
                  key={PROJECTS[activeProject].id}
                  src={PROJECTS[activeProject].image}
                  alt={PROJECTS[activeProject].alt}
                  className="absolute inset-0 w-full h-full object-cover"
                  initial={{ opacity: 0, scale: 1.15 }} // Empieza un poco más grande para el efecto de entrada
                  animate={{ opacity: 1, scale: 1 }} // Se ajusta a tamaño normal
                  exit={{ opacity: 0, scale: 0.95 }} // Sale encogiéndose un poco
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} // Ease suave
                  // EFECTO ZOOM AL HOVER (Controlado por el grupo padre)
                  whileHover={{ scale: 1.08 }} // Zoom sutil del 8%
                />
              </AnimatePresence>
              
              {/* Overlay Gradiente Dinámico (se oscurece un poco al hover para legibilidad) */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A1929]/90 via-[#0A1929]/20 to-transparent group-hover/carousel:from-[#0A1929]/95 transition-all duration-500" />
              
              {/* Project Label Badge (Bottom Left) - Siempre visible y claro */}
              <div className="absolute bottom-8 left-8 px-6 py-4 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center gap-4 text-white z-10 shadow-2xl">
                <div className="w-12 h-12 rounded-2xl bg-[#F07E0415] flex items-center justify-center border border-[#F07E04]/20">
                  <Building2 className="w-6 h-6 text-[#F07E04]" />
                </div>
                <div className="flex flex-col">
                  <AnimatePresence mode="wait">
                    <motion.span 
                      key={PROJECTS[activeProject].id + '-name'}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="font-black text-lg leading-tight tracking-tight"
                    >
                      {PROJECTS[activeProject].name}
                    </motion.span>
                  </AnimatePresence>
                  <span className="text-[11px] uppercase tracking-[0.25em] text-[#F07E04] font-bold mt-1.5">
                    {PROJECTS[activeProject].type}
                  </span>
                </div>
              </div>

              {/* Botones de Navegación (Aparecen sutilmente al hover) */}
              <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-6 pointer-events-none z-10 opacitiy-0 group-hover/carousel:opacity-100 transition-opacity duration-300">
                <button 
                  onClick={goPrev} 
                  className="pointer-events-auto w-14 h-14 rounded-full bg-white/10 backdrop-blur-lg border border-white/20 flex items-center justify-center hover:bg-[#F07E04] hover:border-[#F07E04] transition-all group/btn shadow-xl"
                  aria-label="Proyecto anterior"
                >
                  <ChevronLeft className="w-7 h-7 text-white group-hover/btn:scale-110 transition-transform" />
                </button>
                <button 
                onClick={goNext} 
                  className="pointer-events-auto w-14 h-14 rounded-full bg-white/10 backdrop-blur-lg border border-white/20 flex items-center justify-center hover:bg-[#F07E04] hover:border-[#F07E04] transition-all group/btn shadow-xl"
                  aria-label="Siguiente proyecto"
                >
                  <ChevronRight className="w-7 h-7 text-white group-hover/btn:scale-110 transition-transform" />
                </button>
              </div>
            </motion.div>

            {/* Floating Saving Badge (Top Right) - Con levitación y pulso sutil */}
            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-8 -right-8 hidden lg:flex items-center gap-5 px-7 py-5 rounded-[2rem] bg-white shadow-[0_25px_50px_-12px_rgba(10,25,41,0.12)] border border-gray-100 z-20 group/badge"
            >
              <div className="relative w-14 h-14 rounded-2xl bg-[#4AAF4D15] flex items-center justify-center text-[#4AAF4D]">
                <Leaf className="w-7 h-7 group-hover/badge:rotate-12 transition-transform duration-300" fill="currentColor" />
                {/* Efecto pulso sutil detrás del icono */}
                <div className="absolute inset-0 rounded-2xl bg-[#4AAF4D]/10 animate-pulse scale-110" />
              </div>
              <div>
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={PROJECTS[activeProject].id + '-badge'}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: "spring", bounce: 0.4 }}
                  >
                    <div className="font-black text-3xl text-[#154660] leading-none tracking-tighter">
                      {PROJECTS[activeProject].saving}
                    </div>
                    <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400 mt-2">
                      {PROJECTS[activeProject].savingLabel}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Dot Indicators */}
            <div className="flex items-center justify-center gap-3 mt-10">
              {PROJECTS.map((p, i) => (
                <button 
                  key={p.id}
                  onClick={() => setActiveProject(i)}
                  className={`transition-all duration-500 h-2.5 rounded-full ${i === activeProject ? 'w-12 bg-[#F07E04]' : 'w-2.5 bg-[#15466020]'}`}
                  aria-label={`Ir al proyecto ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* ── COLUMNA DERECHA: TEXTO Y CARACTERÍSTICAS (Estático con mejoras) ── */}
          <motion.div
             initial={{ opacity: 0, x: 50 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true, amount: 0.3 }} // amount para disparar cuando el 30% es visible
             transition={{ duration: 0.7 }}
          >
            <p className="text-sm font-black uppercase tracking-[0.4em] mb-4 text-[#F07E04]">
              Confianza de Escala Industrial
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.05] mb-8 text-[#154660] tracking-tighter drop-shadow-sm">
              Si lo hacemos para plantas,{' '}
              <span className="text-[#F07E04]">imagina lo que hacemos por ti.</span>
            </h2>
            <p className="text-lg text-gray-500 leading-relaxed mb-12 max-w-2xl">
              Desde pastelerías industriales hasta clínicas, viñas y centros logísticos en todo Chile. 
              Cada proyecto residencial que ejecutamos lleva el mismo rigor de ingeniería certificada, monitoreo 
              proactivo y post-venta garantizada que aplicamos en soluciones B2B de gran escala.
            </p>

            <div className="space-y-7">
              {[
                { icon: <CheckCircle2 />, text: "Ingeniería de precisión para hogares e industrias", color: "#4AAF4D" },
                { icon: <ShieldCheck />, text: "Instalaciones certificadas bajo estricta normativa SEC", color: "#4AAF4D" },
                { icon: <BarChart3 />, text: "ROI documentado y monitoreo de ahorro en tiempo real", color: "#4AAF4D" }
              ].map((item, idx) => (
                <motion.div 
                    key={idx} 
                    className="flex items-center gap-6 group/item"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.15 + 0.3 }}
                >
                  <div className="w-14 h-14 rounded-[1.25rem] flex items-center justify-center bg-[#4AAF4D10] text-[#4AAF4D] group-hover/item:bg-[#4AAF4D] group-hover/item:text-white transition-all duration-400 shadow-sm border border-[#4AAF4D15]">
                    {item.icon}
                  </div>
                  <span className="text-[#154660] font-bold text-xl tracking-tight group-hover/item:translate-x-1.5 transition-transform duration-300">
                    {item.text}
                  </span>
                </motion.div>
              ))}
            </div>
            
            <button className="mt-14 px-12 py-5 rounded-2xl bg-[#154660] text-white font-black text-xl hover:bg-[#0A1929] transition-all transform hover:scale-105 active:scale-95 shadow-2xl shadow-[#154660]/30 group/cta">
              Ver Catálogo de Proyectos
              <span className="inline-block ml-2 group-hover/cta:translate-x-1 transition-transform">→</span>
            </button>
          </motion.div>

        </div>
      </div>
    </section>
  );
}