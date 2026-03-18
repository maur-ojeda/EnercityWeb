import { Sun, Facebook, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import styles from './footer.module.css';

const footerLinks = {
  servicios: [
    { label: "Solar Residencial", href: "#" },
    { label: "Solar Comercial", href: "#" },
    { label: "Solar Industrial", href: "#" },
    { label: "Mantenimiento", href: "#" },
  ],
  empresa: [
    { label: "Nosotros", href: "#" },
    { label: "Proyectos", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Trabaja con nosotros", href: "#" },
  ],
  legal: [
    { label: "Términos y Condiciones", href: "#" },
    { label: "Política de Privacidad", href: "#" },
    { label: "Política de Cookies", href: "#" },
  ]
};

export function Footer() {
  return (
    <footer className={styles.footer}>
      {/* Main Footer */}
      <div className={styles.container}>
        <div className={styles.footerGrid}>
          {/* Brand */}
          <div className={styles.brandSection}>
            <div className={styles.brandLogo}>
              <div className={styles.brandIcon}>
                <Sun className="w-6 h-6 text-white" />
              </div>
              <span className={styles.brandName}>Enercity</span>
            </div>
            <p className={styles.brandDescription}>
              Lideres en energía solar para Chile. Transformamos hogares y empresas 
              hacia un futuro más sostenible y económicamente eficiente.
            </p>
            
            {/* Contact Info */}
            <div className={styles.contactInfo}>
              <div className={styles.contactItem}>
                <Phone className="w-4 h-4" />
                <span className={styles.contactText}>+56 9 1234 5678</span>
              </div>
              <div className={styles.contactItem}>
                <Mail className="w-4 h-4" />
                <span className={styles.contactText}>contacto@enercity.cl</span>
              </div>
              <div className={styles.contactItem}>
                <MapPin className="w-4 h-4" />
                <span className={styles.contactText}>Santiago, Chile</span>
              </div>
            </div>
          </div>

          {/* Links - Servicios */}
          <div>
            <h4 className={styles.sectionTitle}>Servicios</h4>
            <ul className={styles.linkList}>
              {footerLinks.servicios.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className={styles.linkItem}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Links - Empresa */}
          <div>
            <h4 className={styles.sectionTitle}>Empresa</h4>
            <ul className={styles.linkList}>
              {footerLinks.empresa.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className={styles.linkItem}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Links - Legal */}
          <div>
            <h4 className={styles.sectionTitle}>Legal</h4>
            <ul className={styles.linkList}>
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className={styles.linkItem}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className={styles.footerBottom}>
        <div className={styles.bottomContainer}>
          <p className={styles.bottomText}>
            © {new Date().getFullYear()} Enercity. Todos los derechos reservados.
          </p>
          
          {/* Social Links */}
          <div className={styles.socialLinks}>
            <button className={styles.socialButton}>
              <Facebook className="w-5 h-5" />
            </button>
            <button className={styles.socialButton}>
              <Instagram className="w-5 h-5" />
            </button>
            <button className={styles.socialButton}>
              <Linkedin className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
