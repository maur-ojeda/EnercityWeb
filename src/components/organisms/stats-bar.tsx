import { Users, Shield, Award, Leaf } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import styles from './stats-bar.module.css';

const stats = [
  {
    icon: Users,
    value: "500+",
    label: "Proyectos Instalados",
    description: "Hogares y empresas en Chile"
  },

  {
    icon: Shield,
    value: "15MW",
    label: "Capacidad generada",
    description: "En paneles y equipos"
  },
  {
    icon: Award,
    value: "8+",
    label: "Años Experiencia",
    description: "Instaladores autorizados"
  },
  {
    icon: Leaf,
    value: "100%",
    label: "Compromiso",
    description: "En cada proyecto de principio a fin"
  }
];

export function StatsBar() {
  return (
    <section className={styles.statsBar}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className={styles.cardContent}>
                <div className={styles.iconContainer}>
                  <stat.icon className={styles.icon} />
                </div>
                <p className={styles.statValue}>{stat.value}</p>
                <p className={styles.statLabel}>{stat.label}</p>
                <p className={styles.statDescription}>{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
