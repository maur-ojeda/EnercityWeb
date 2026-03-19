import { useState, useEffect } from 'react';
import { ArrowRight, Zap, Sun } from 'lucide-react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

export function Hero() {
  // Variables para el efecto Parallax del mouse
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Mapeamos el movimiento del mouse a un ligero desplazamiento de la imagen
  const bgX = useTransform(mouseX, [-500, 500], [10, -10]);
  const bgY = useTransform(mouseY, [-500, 500], [10, -10]);

  function handleMouseMove(event: React.MouseEvent) {
    const { clientX, clientY } = event;
    const { innerWidth, innerHeight } = window;
    mouseX.set(clientX - innerWidth / 2);
    mouseY.set(clientY - innerHeight / 2);
  }

  const scrollToSimulator = () => {
    const element = document.getElementById('simulador-section');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section 
      id="inicio" 
      onMouseMove={handleMouseMove}
      className="relative h-screen min-h-[700px] w-full flex items-center overflow-hidden bg-[#0A1929]"
    >
      
      {/* ── BACKGROUND CON PARALLAX ────────────────────────────────────── */}
      <motion.div 
        style={{ x: bgX, y: bgY, scale: 1.1 }}
        className="absolute inset-0 w-full h-full z-0"
      >
        <img 
          src="https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&q=80" 
          alt="Granja solar Enercity" 
          className="w-full h-full object-cover"
        />
        {/* Overlay ultra-oscuro para asegurar que el texto blanco se vea sí o sí */}
        <div className="absolute inset-0 bg-[#0A1929]/70 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#0A1929] via-transparent to-black/40" />
      </motion.div>

      {/* ── CONTENIDO PRINCIPAL (Z-10 para estar sobre el fondo) ────────── */}
      <div className="container mx-auto px-6 relative z-10 pt-20">
        <div className="max-w-4xl">
          
          {/* Badge de confianza */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-4 py-2 rounded-full mb-8 bg-white/10 backdrop-blur-md border border-white/20 shadow-xl"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-[#4AAF4D] animate-pulse" />
            <span className="text-xs md:text-sm font-bold tracking-[0.2em] uppercase text-white">
              8 años de ingeniería fotovoltaica
            </span>
          </motion.div>

          {/* Headline con sombra de texto para legibilidad extrema */}
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[1.05] mb-8 tracking-tighter drop-shadow-2xl"
          >
            Tu inversión solar <br />
            <span className="text-[#F07E04]">garantizada.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg md:text-2xl text-white/90 mb-12 leading-relaxed max-w-2xl font-medium drop-shadow-md"
          >
            Expertos en energía fotovoltaica. Diseñamos soluciones que generan 
            ahorro real hasta que tu proyecto <span className="text-white font-bold border-b-2 border-[#4AAF4D]">se pague solo.</span>
          </motion.p>

          {/* Botones de Acción */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-5"
          >
            <button 
              onClick={scrollToSimulator} 
              className="group flex items-center justify-center gap-3 px-10 py-5 rounded-2xl font-black text-lg text-white bg-[#4AAF4D] hover:bg-[#3d8f3f] transition-all transform hover:scale-105 shadow-2xl shadow-[#4AAF4D]/40"
            >
              Simular mi ahorro ahora 
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
            <a 
              href="#proyectos" 
              className="flex items-center justify-center px-10 py-5 rounded-2xl font-bold text-lg text-white bg-white/5 border border-white/20 backdrop-blur-md hover:bg-white/20 transition-all shadow-xl"
            >
              Ver proyectos industriales
            </a>
          </motion.div>
        </div>

        {/* ── TARJETA FLOTANTE (Desktop Only) ───────────────────────────── */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, type: "spring" }}
          className="absolute right-6 top-1/2 -translate-y-1/2 hidden lg:block p-8 rounded-[2.5rem] bg-[#0A1929]/80 backdrop-blur-2xl border border-white/10 shadow-[0_32px_64px_-15px_rgba(0,0,0,0.5)] w-80"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-[#4AAF4D] flex items-center justify-center shadow-lg shadow-[#4AAF4D]/20">
              <Zap className="w-6 h-6 text-white" fill="white" />
            </div>
            <div>
              <div className="text-xl font-black text-white">Doble</div>
              <div className="text-[#4AAF4D] text-xs font-black uppercase tracking-widest">Garantía Real</div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-white/5 rounded-2xl p-5 border border-white/5 group hover:bg-white/10 transition-colors">
              <div className="text-4xl font-black text-white">120</div>
              <div className="text-white/40 text-[10px] uppercase tracking-tighter font-bold">Meses ROI Estimado</div>
            </div>
            <div className="bg-white/5 rounded-2xl p-5 border border-white/5 group hover:bg-white/10 transition-colors">
              <div className="text-4xl font-black text-white">10 Años</div>
              <div className="text-white/40 text-[10px] uppercase tracking-tighter font-bold">Soporte Técnico Especializado</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── INDICADOR DE SCROLL MEJORADO ────────────────────────────────── */}
      <motion.div 
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-20"
      >
        <span className="text-white/40 text-[9px] font-black tracking-[0.4em] uppercase">Desliza</span>
        <div className="w-[3px] h-14 bg-gradient-to-b from-[#F09C0A] via-[#F09C0A]/40 to-transparent rounded-full" />
      </motion.div>
    </section>
  );
}