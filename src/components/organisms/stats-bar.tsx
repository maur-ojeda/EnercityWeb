import { useEffect, useState, useRef } from 'react';
import { Users, Award, CheckCircle, Zap } from 'lucide-react';
import { motion, useInView, animate } from 'framer-motion';

// Componente individual para el número que cuenta
function Counter({ value, duration = 2 }: { value: string, duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  // Extraemos solo los números del string (ej: "500+" -> 500)
  const numericValue = parseInt(value.replace(/\D/g, ''));
  const suffix = value.replace(/[0-9]/g, '');

  useEffect(() => {
    if (isInView) {
      // Animación del conteo de números simple y directa
      const controls = animate(0, numericValue, {
        duration: duration,
        ease: "easeOut",
        onUpdate: (latest) => setDisplayValue(Math.floor(latest)),
      });
      return () => controls.stop();
    }
  }, [isInView, numericValue, duration]);

  return (
    <span ref={ref}>
      {displayValue}{suffix}
    </span>
  );
}

const stats = [
  {
    value: "500+",
    label: "Proyectos Instalados",
    description: "Hogares y empresas",
    icon: <Users className="w-5 h-5" />
  },
  {
    value: "15MW",
    label: "Capacidad Generada",
    description: "Energía limpia total",
    icon: <Zap className="w-5 h-5" />
  },
  {
    value: "8+",
    label: "Años Experiencia",
    description: "Ingeniería experta",
    icon: <Award className="w-5 h-5" />
  },
  {
    value: "99%",
    label: "Clientes Satisfechos",
    description: "Post-venta garantizada",
    icon: <CheckCircle className="w-5 h-5" />
  }
];

export function StatsBar() {
  const durationConteo = 2; // Segundos que tarda en contar

  return (
    <section className="bg-white border-b border-gray-100 py-16 relative z-20">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group text-center flex flex-col items-center relative"
            >
              {/* Icono sutil */}
              <div className="mb-4 p-3 rounded-xl bg-[#F07E04]/5 text-[#F07E04] group-hover:scale-110 transition-transform duration-300">
                {stat.icon}
              </div>

              {/* Contenedor del número con la animación "HeartBeat" (Latido Final) */}
              <motion.div 
                className="text-4xl md:text-5xl font-black text-[#F07E04] mb-2 tracking-tighter min-w-[130px] inline-block"
                whileInView={{ 
                  // Secuencia de escala inspirada en heartBeat: normal, grande, pequeña, normal
                  scale: [1, 1.3, 0.95, 1.1, 1], 
                }}
                viewport={{ once: true }}
                transition={{ 
                  // Sincronización: Empieza casi al final del conteo
                  delay: (index * 0.1) + (durationConteo - 0.2), 
                  type: "spring", 
                  visualDuration: 0.6, // Un poco más largo para que se note el rebote
                  bounce: 0.6 // Mucho rebote elástico
                }}
              >
                <Counter value={stat.value} duration={durationConteo} />
              </motion.div>

              {/* Label */}
              <div className="font-bold uppercase tracking-[0.15em] text-[10px] md:text-xs text-[#154660] mb-2">
                {stat.label}
              </div>

              {/* Descripción */}
              <p className="text-gray-400 text-sm leading-tight max-w-[150px]">
                {stat.description}
              </p>

              {/* Separador visual (Desktop) */}
              {index < stats.length - 1 && (
                <div className="absolute -right-4 top-1/2 -translate-y-1/2 h-12 w-px bg-gray-100 hidden lg:block" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}