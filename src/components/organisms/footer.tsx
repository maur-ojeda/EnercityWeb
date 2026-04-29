"use client";

import { Facebook, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import logoEnercity from '/src/assets/logoEnercity.png?url';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const prefersReduced = useReducedMotion();

  const sectionVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
  };

  return (
    <footer className="bg-[#0A1929] text-white py-20 font-sans">
      <div className="container mx-auto px-6">
        
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={prefersReduced ? undefined : { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } } }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-16 pl-8 md:pl-12 lg:pl-16"
        >
          
          {/* Columna 1: Branding & Social */}
          <motion.div variants={prefersReduced ? undefined : sectionVariant}>
            <div className="flex items-center gap-3 mb-8">
              <img 
                src={logoEnercity} 
                alt="Enercity Logo" 
                className="w-[200px] md:w-[240px] h-auto" 
                width={240}
                height={116}
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            
            <p className="text-white/60 leading-relaxed mb-6">
              Expertos en soluciones fotovoltaicas innovadoras y respetuosas 
              con el medio ambiente en todo Chile.
            </p>
            
            {/* Social Icons */}
            <div className="flex gap-3">
              {[
                { icon: <Facebook className="w-4 h-4" />, href: "#", label: "Facebook (próximamente)" },
                { icon: <Linkedin className="w-4 h-4" />, href: "#", label: "LinkedIn (próximamente)" },
                { icon: <Instagram className="w-4 h-4" />, href: "#", label: "Instagram (próximamente)" }
              ].map((social, idx) => (
                <motion.a 
                  key={idx}
                  href={social.href}
                  aria-label={social.label}
                  aria-disabled="true"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center 
                            cursor-pointer hover:bg-[#F07E04] transition-colors opacity-50"
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Columna 2: Navegación */}
          <motion.div variants={prefersReduced ? undefined : sectionVariant}>
            <h5 className="font-bold font-sans text-xl mb-8 text-white">Navegación</h5>
            <ul className="space-y-4 text-white/60">
              {[
                { label: 'Inicio', href: '/#inicio' },
                { label: 'Soluciones', href: '/#soluciones' },
                { label: 'Simulador', href: '/#simulador-section' },
                { label: 'Proyectos', href: '/#proyectos' },
              ].map((link) => (
                <li key={link.label}>
                  <motion.a 
                    href={link.href} 
                    whileHover={{ x: 4, transition: { duration: 0.15 } }}
                    className="hover:text-[#F09C0A] transition-colors inline-block"
                  >
                    {link.label}
                  </motion.a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Columna 3: Contacto */}
          <motion.div variants={prefersReduced ? undefined : sectionVariant}>
            <h5 className="font-bold font-sans text-xl mb-8 text-white">Contacto</h5>
            <ul className="space-y-4">
              <li className="flex items-start gap-4 text-white/60">
                <MapPin className="w-5 h-5 shrink-0 mt-0.5 text-[#4AAF4D]" />
                <span>Av. Providencia 1208, Of. 404, Santiago, Chile</span>
              </li>
              <li className="flex items-start gap-4 text-white/60">
                <Phone className="w-5 h-5 shrink-0 mt-0.5 text-[#4AAF4D]" />
                <span>+56 9 1234 5678</span>
              </li>
              <li className="flex items-start gap-4 text-white/60">
                <Mail className="w-5 h-5 shrink-0 mt-0.5 text-[#4AAF4D]" />
                <span>contacto@enercity.cl</span>
              </li>
            </ul>
          </motion.div>
        </motion.div>

        {/* Línea de Copyright */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="pt-8 border-t border-white/10 text-center text-white/40 text-sm"
        >
          <p>&copy; {currentYear} Enercity SpA. Todos los derechos reservados.</p>
        </motion.div>
      </div>
    </footer>
  );
}