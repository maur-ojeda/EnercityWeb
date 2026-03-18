import { Building2, Pickaxe, Sprout, Truck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import styles from './feature-industrial.module.css';

const features = [
  {
    icon: Building2,
    title: "Plantas Solares Industriales",
    description: "Sistemas de gran escala para fábricas y centros comerciales. Genera tu propia energía y reduce costos operativos."
  },
  {
    icon: Pickaxe,
    title: "Minería",
    description: "Soluciones energéticas para la industria minera. Alimentación de faenas remotas con energía limpia."
  },
  {
    icon: Sprout,
    title: "Agricultura",
    description: "Sistemas de bombeo solar y electrificación de invernaderos. Reduces costos de riego y producción."
  },
  {
    icon: Truck,
    title: "Logística",
    description: "Carga de flotas eléctricas y sistemas de iluminación LED. Optimiza tu operación con energía renovable."
  }
];

export function FeatureIndustrial() {
  return (
    <section className={styles.featureIndustrial} id="servicios">
      <div className={styles.container}>
        <div className={styles.industrialHeader}>
          <h2 className={styles.industrialTitle}>
            Soluciones Energéticas B2B
          </h2>
          <p className={styles.industrialSubtitle}>
            Llevamos energía solar a todos los sectores industriales. 
            Diseñamos sistemas personalizados para cada necesidad.
          </p>
        </div>

        <div className={styles.featuresGrid}>
          {features.map((feature, index) => (
            <Card key={index} className={styles.featureCard}>
              <CardHeader className={styles.cardHeader}>
                <div className={styles.featureIcon}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <CardTitle className={styles.cardTitle}>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className={styles.cardContent}>
                <p className={styles.cardDescription}>{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className={styles.ctaSection}>
          <p className={styles.ctaText}>
            ¿Tienes un proyecto industrial? Hablemos de tu caso específico.
          </p>
          <a 
            href="#contacto" 
            className={styles.ctaLink}
          >
            Consultar Proyecto Industrial
          </a>
        </div>
      </div>
    </section>
  );
}
