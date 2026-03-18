import { ArrowDown, Sun, Zap, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import styles from './hero.module.css';

export function Hero() {
  const scrollToSimulator = () => {
    const element = document.getElementById('simulador');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className={styles.hero}>
      {/* Background Pattern */}
      <div className={styles.backgroundPattern}>
        <div className={styles.backgroundPattern} style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className={styles.container}>
        <div className={styles.content}>
          {/* Badge */}
          <div className={styles.badge}>
            <Zap className="w-4 h-4" />
            <span>8 años de Industria fotovoltaica</span>
          </div>

          {/* H1 */}
          <h1 className={styles.title}>
            Tu inversión solar garantizada {' '}
            <span>hasta que se pague sola.</span>
          </h1>

          {/* Subtítulo */}
          <p className={styles.subtitle}>
            Expertos en industria fotovoltaica con 8 años de trayectoria. Diseñamos soluciones que generan ahorro real y seguridad financiera para tu hogar.
          </p>

          {/* CTA Buttons */}
          <div className={styles.buttons}>
            <Button 
              onClick={scrollToSimulator}
              size="lg" 
              className={styles.primaryButton}
            >
              Simular ahorro hogar
              <ArrowDown className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className={styles.secondaryButton}
            >
              Ver proyectos industriales
            </Button>
          </div>
        </div>

        {/* Hero Image Placeholder */}
        <div className={styles.imagePlaceholder}>
          <div className={styles.imageContainer}>
            <div className={styles.imageWrapper}>
              <div className={styles.imageContent}>
                <Sun className="w-24 h-24 text-emerald-400 mx-auto mb-4" />
                <p className="text-emerald-700 font-medium">
                  Imagen de instalación solar residencial
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
