import { Home, Building, Factory } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import styles from './solutions-grid.module.css';

const solutions = [
  {
    icon: Home,
    title: "Residencial",
    description: "Para tu hogar",
    features: [
      "Ahorro de hasta 70% en tu boleta",
      "Sistema desde 3.3 kWp",
      "Financiamiento disponible",
      "Instalación en 1-2 días"
    ],
    cta: "Calcular Ahorro",
    highlight: false
  },
  {
    icon: Building,
    title: "Comercial",
    description: "Para empresas",
    features: [
      "Deducción de impuestos",
      "Sistemas desde 10 kWp",
      "ROI en 4-6 años",
      "Gestión de permisos"
    ],
    cta: "Solicitar Cotización",
    highlight: true
  },
  {
    icon: Factory,
    title: "Industrial",
    description: "Para industrias",
    features: [
      "Plantas de gran escala",
      "Peak shaving",
      "Medición neta",
      "Monitoreo remoto"
    ],
    cta: "Consultar Proyecto",
    highlight: false
  }
];

export function SolutionsGrid() {
  return (
    <section className={styles.solutionsGrid}>
      <div className={styles.container}>
        <div className={styles.solutionsHeader}>
          <h2 className={styles.solutionsTitle}>
            Elige tu solución solar
          </h2>
          <p className={styles.solutionsSubtitle}>
            Contamos con sistemas para cada tipo de necesidad. 
            Desde el hogar hasta la industria pesada.
          </p>
        </div>

        <div className={styles.solutionsContainer}>
          {solutions.map((solution, index) => (
            <Card 
              key={index} 
              className={`solution-card ${solution.highlight ? 'highlighted' : ''}`}
            >
              {solution.highlight && (
                <div className={styles.solutionBadge}>
                  Más Popular
                </div>
              )}
              
              <CardHeader className={styles.solutionHeader}>
                <div className={`solution-icon ${solution.highlight ? 'highlighted' : ''}`}>
                  <solution.icon className="w-8 h-8" />
                </div>
                <CardTitle className="text-2xl">{solution.title}</CardTitle>
                <CardDescription className="text-base">{solution.description}</CardDescription>
              </CardHeader>
              
              <CardContent className={styles.solutionContent}>
                <ul className={styles.featuresList}>
                  {solution.features.map((feature, fIndex) => (
                    <li key={fIndex} className={styles.featureItem}>
                      <div className={styles.featureBullet} />
                      <span className={styles.featureText}>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button className={`solution-cta ${solution.highlight ? 'highlighted' : ''}`}>
                  {solution.cta}
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
