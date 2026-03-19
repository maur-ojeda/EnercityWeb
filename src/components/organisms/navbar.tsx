import { useState, useEffect } from 'react';
import { Menu, X, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Efecto para cambiar el estilo al hacer scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSimulator = () => {
    const el = document.getElementById('simulador-section');
    el?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  const navLinks = [
    { name: 'Inicio', href: '#inicio' },
    { name: 'Nosotros', href: '#nosotros' },
    { name: 'Soluciones', href: '#soluciones' },
    { name: 'Simulador', href: '#simulador-section' },
  ];

  return (
    <div className={`fixed w-full z-50 transition-all duration-500 px-6 ${scrolled ? 'top-4' : 'top-0'}`}>
      <nav className={`mx-auto max-w-7xl transition-all duration-500 border border-white/10 
        ${scrolled 
          ? 'bg-[#0A1929]/80 backdrop-blur-md rounded-2xl py-3 px-6 shadow-2xl' 
          : 'bg-transparent py-6 px-0 border-transparent'}`}>
        
        <div className="flex justify-between items-center gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="relative w-8 h-8 flex items-center justify-center">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-2 border-dashed border-[#F09C0A] rounded-full" 
              />
              <Sun className="w-5 h-5 text-[#F09C0A]" fill="#F09C0A" />
            </div>
            <span className="font-black text-white tracking-tighter text-xl">ENERCITY</span>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a 
                key={link.name}
                href={link.href} 
                className="text-sm font-medium text-white/80 hover:text-[#F09C0A] transition-colors"
              >
                {link.name}
              </a>
            ))}
            <button 
              onClick={scrollToSimulator}
              className="bg-[#4AAF4D] hover:bg-[#3d8f3f] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all transform hover:scale-105 active:scale-95"
            >
              Simular mi ahorro
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full left-0 right-0 mt-2 rounded-2xl overflow-hidden bg-[#0A1929] border border-white/10 shadow-2xl md:hidden"
            >
              <div className="flex flex-col p-6 gap-5">
                {navLinks.map((link) => (
                  <a 
                    key={link.name}
                    href={link.href} 
                    onClick={() => setIsMenuOpen(false)}
                    className="text-lg font-medium text-white/70 hover:text-[#F09C0A]"
                  >
                    {link.name}
                  </a>
                ))}
                <button 
                  onClick={scrollToSimulator}
                  className="w-full bg-[#4AAF4D] text-white py-4 rounded-xl font-bold text-center"
                >
                  Simular mi ahorro ahora
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </div>
  );
}