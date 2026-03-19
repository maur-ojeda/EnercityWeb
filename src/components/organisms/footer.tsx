import { Sun, Facebook, Instagram, Linkedin, Mail, Phone, MapPin, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0A1929] text-white py-20 font-sans">
      <div className="container mx-auto px-6">
        
        {/* Grid 4 columnas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Columna 1: Branding & Social */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="relative w-8 h-8 flex items-center justify-center">
                {/* Círculo animado con Framer Motion */}
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-2 border-dashed border-[#F09C0A] rounded-full" 
                />
                <Sun className="w-5 h-5 text-[#F09C0A]" fill="#F09C0A" />
              </div>
              <span className="font-black text-white tracking-tighter text-xl">ENERCITY</span>
            </div>
            
            <p className="text-white/60 leading-relaxed mb-6">
              Expertos en soluciones fotovoltaicas innovadoras y respetuosas 
              con el medio ambiente en todo Chile.
            </p>
            
            {/* Social Icons */}
            <div className="flex gap-3">
              {[
                { icon: <Facebook className="w-4 h-4" />, href: "#" },
                { icon: <Linkedin className="w-4 h-4" />, href: "#" },
                { icon: <Instagram className="w-4 h-4" />, href: "#" }
              ].map((social, idx) => (
                <a 
                  key={idx}
                  href={social.href}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center 
                            cursor-pointer hover:bg-[#F07E04] transition-colors"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Columna 2: Navegación */}
          <div>
            <h5 className="font-bold text-xl mb-8 text-white">Navegación</h5>
            <ul className="space-y-4 text-white/60">
              {['Inicio', 'Soluciones', 'Simulador', 'Proyectos'].map((link) => (
                <li key={link}>
                  <a href="#" className="hover:text-[#F09C0A] transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 3: Contacto */}
          <div>
            <h5 className="font-bold text-xl mb-8 text-white">Contacto</h5>
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
          </div>

          {/* Columna 4: Newsletter */}
          <div>
            <h5 className="font-bold text-xl mb-8 text-white">Newsletter</h5>
            <p className="text-white/60 mb-6">
              Recibe las últimas noticias sobre energía renovable.
            </p>
            
            <div className="flex flex-col gap-3">
              <input 
                type="email" 
                placeholder="Tu Email" 
                className="px-5 py-3 rounded-xl outline-none text-white placeholder-white/40 border border-white/10 bg-white/5 focus:border-[#4AAF4D] transition-all"
              />
              <button 
                className="py-3 rounded-xl font-bold transition-colors text-white bg-[#4AAF4D] hover:bg-[#3d8f3f]"
              >
                Suscribirse
              </button>
            </div>
          </div>
        </div>

        {/* Línea de Copyright */}
        <div className="pt-8 border-t border-white/10 text-center text-white/40 text-sm">
          <p>&copy; {currentYear} Enercity SpA. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}