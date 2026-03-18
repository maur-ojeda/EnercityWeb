import { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import styles from './contact-cta.module.css';

export function ContactCta() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    mensaje: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Aquí iría la lógica de envío
    setTimeout(() => setLoading(false), 1000);
  };

  const contactInfo = [
    { icon: Phone, label: "Teléfono", value: "+56 9 1234 5678" },
    { icon: Mail, label: "Email", value: "contacto@enercity.cl" },
    { icon: MapPin, label: "Dirección", value: "Santiago, Chile" }
  ];

  return (
    <section className={styles.contactCta} id="contacto">
      <div className={styles.container}>
        <div className={styles.ctaHeader}>
          <h2 className={styles.ctaTitle}>
            ¿Tienes dudas? Hablemos
          </h2>
          <p className={styles.ctaSubtitle}>
            Nuestro equipo está listo para ayudarte. 
            Contesta el formulario y te contactaremos a la brevedad.
          </p>
        </div>

        <div className={styles.contactGrid}>
          {/* Formulario */}
          <Card className={styles.formCard}>
            <CardHeader className={styles.formHeader}>
              <CardTitle className={styles.formTitle}>Envíanos un mensaje</CardTitle>
              <CardDescription className={styles.formDescription}>
                Completa tus datos y te responderemos en menos de 24 horas.
              </CardDescription>
            </CardHeader>
            <CardContent className={styles.formContent}>
              <form onSubmit={handleSubmit} className={styles.formContent}>
                <div className={styles.formGrid}>
                  <div className={styles.formField}>
                    <Input 
                      placeholder="Nombre completo" 
                      value={formData.nombre}
                      onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                      required
                    />
                  </div>
                  <div className={styles.formField}>
                    <Input 
                      placeholder="Teléfono" 
                      type="tel"
                      value={formData.telefono}
                      onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                    />
                  </div>
                </div>
                <div className={styles.formField}>
                  <Input 
                    placeholder="Email" 
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                <div className={styles.formField}>
                  <Textarea 
                    placeholder="¿En qué podemos ayudarte?" 
                    rows={4}
                    value={formData.mensaje}
                    onChange={(e) => setFormData({...formData, mensaje: e.target.value})}
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  className={styles.submitButton}
                  disabled={loading}
                >
                  {loading ? (
                    "Enviando..."
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Enviar Mensaje
                    </>
                  )}
                </button>
              </form>
            </CardContent>
          </Card>

          {/* Info de contacto */}
          <div className={styles.contactSection}>
            <Card className={styles.infoCard}>
              <CardHeader className={styles.infoHeader}>
                <CardTitle className={styles.infoTitle}>Información de contacto</CardTitle>
              </CardHeader>
              <CardContent className={styles.infoContent}>
                {contactInfo.map((info, index) => (
                  <div key={index} className={styles.contactItem}>
                    <div className={styles.contactIcon}>
                      <info.icon className="w-5 h-5" />
                    </div>
                    <div className={styles.contactDetails}>
                      <p className={styles.contactLabel}>{info.label}</p>
                      <p className={styles.contactValue}>{info.value}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className={styles.callCard}>
              <CardContent className={styles.callContent}>
                <div className={styles.callPreference}>
                  <h4 className={styles.callPreferenceTitle}>
                    ¿Prefieres hablar directamente?
                  </h4>
                  <p className={styles.callPreferenceDescription}>
                    Nuestro equipo de ventas está disponible de lunes a viernes de 9:00 a 18:00 hrs.
                  </p>
                  <Button variant="outline" className={styles.callButton}>
                    <Phone className="w-4 h-4 mr-2" />
                    Llamar Ahora
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
