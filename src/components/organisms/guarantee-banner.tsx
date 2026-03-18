import { Shield, CheckCircle2, Wrench } from 'lucide-react';
import styles from './guarantee-banner.module.css';

const guarantees = [
  {
    icon: Shield,
    title: "Certificación SEC",
    description: "Todos nuestros instaladores están certificados por la Superintendencia de Electricidad y Combustibles."
  },
  {
    icon: CheckCircle2,
    title: "Garantía Técnica",
    description: "25 años de garantía en paneles, 10 años en inversores y estructura. Cobertura total."
  },
  {
    icon: Wrench,
    title: "Instalación Certificada",
    description: "Cumplimos con todas las normas de seguridad y normativas locales. Instalación profesional garantizada."
  }
];

export function GuaranteeBanner() {
  return (
    <section className={styles.guaranteeBanner}>
      <div className={styles.container}>
        <div className={styles.bannerHeader}>
          <h2 className={styles.bannerTitle}>
            Confianza y Seguridad
          </h2>
          <p className={styles.bannerSubtitle}>
            Tu inversión está protegida. Trabajamos con los más altos estándares de calidad.
          </p>
        </div>

        <div className={styles.featuresGrid}>
          {guarantees.map((guarantee, index) => (
            <div key={index} className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <guarantee.icon className="w-8 h-8" />
              </div>
              <h3 className={styles.featureTitle}>{guarantee.title}</h3>
              <p className={styles.featureDescription}>{guarantee.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
