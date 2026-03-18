"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import styles from "./savings-calculator.module.css";

interface Comuna {
  id: number;
  nombre: string;
  activa: boolean;
  region?: string;
}

type TipoTecho = "Losa" | "Teja Chilena" | "Otro";
type TipoMedidor = "Normal" | "Reja/Fuera";
type EstadoResultado = "OK" | "NO_VIABLE" | "EJECUTIVO" | "ERROR";
type Clasificacion = "ALTA_RETORNO" | "MEDIO_RETORNO" | "BAJA_RETORNO";

interface QuoteResult {
  estado: EstadoResultado;
  mensaje?: string;
  input?: {
    montoBoleta: number;
    comunaId: number;
    tipoTecho: string;
    tipoMedidor: string;
  };
  datosComuna?: {
    id: number;
    nombre: string;
    region: string;
    radiacionGhi: number;
    tarifaEst: number;
  };
  kit?: {
    id: number;
    consumoBruto: number;
    inversorKw: number;
    paneles: number;
    kwp: number;
    precioNetoBase: number;
  };
  calculo?: {
    consumoKwhAnual: number;
    generacionAnualKwh: number;
    ahorroAnual: number;
    ahorroMensual: number;
    coberturaPorcentaje: number;
    precioBase: number;
    factorTecho: number;
    recargoTecho: number;
    costoMedidor: number;
    precioSinIva: number;
    iva: number;
    precioFinalIva: number;
    paybackAnos: number;
  };
  resumenInversion?: {
    ahorroMensual: number;
    ahorroAnual: number;
    inversionTotal: number;
    anosRecuperacion: number;
    cobertura: number;
    clasificacion: Clasificacion;
  };
}

type Step = 1 | 2 | 3 | 4;

const STEPS = [
  { num: 1, label: "Tu Comuna" },
  { num: 2, label: "Tu Consumo" },
  { num: 3, label: "Detalles" },
  { num: 4, label: "Resultados" },
];

const TIPOS_TECHO = [
  { value: "Losa", label: "Losa", desc: "Sin recargo", recargo: 0 },
  { value: "Teja Chilena", label: "Teja Chilena", desc: "+14% recargo", recargo: 14 },
  { value: "Otro", label: "Otro", desc: "Sin recargo", recargo: 0 },
];

const TIPOS_MEDIDOR = [
  { value: "Normal", label: "Normal", desc: "Dentro de la propiedad", costo: 0 },
  { value: "Reja/Fuera", label: "Reja/Fuera", desc: "Fuera de la propiedad", costo: 350000 },
];

function formatCLP(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(amount);
}

interface SavingsCalculatorProps {
  comunas: Comuna[];
}

export function SavingsCalculator({ comunas }: SavingsCalculatorProps) {
  const [step, setStep] = useState<Step>(1);
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<QuoteResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [leadCreated, setLeadCreated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    comunaId: 0,
    montoBoleta: 0,
    tipoTecho: "Losa" as TipoTecho,
    tipoMedidor: "Normal" as TipoMedidor,
    nombre: "",
    email: "",
    telefono: "",
  });

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.comunaId > 0;
      case 2:
        return formData.montoBoleta >= 50000;
      case 3:
        return !!formData.tipoTecho && !!formData.tipoMedidor;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (step === 3) {
      setIsCalculating(true);
      setError(null);

      try {
        const response = await fetch("/api/calculate-quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            montoBoleta: formData.montoBoleta,
            comunaId: formData.comunaId,
            tipoTecho: formData.tipoTecho,
            tipoMedidor: formData.tipoMedidor,
          }),
        });

        const data: QuoteResult = await response.json();

        if (!response.ok || data.estado === "ERROR") {
          throw new Error(data.mensaje || "Error al calcular");
        }

        setResult(data);
        setStep(4);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setIsCalculating(false);
      }
    } else if (step < 4) {
      setStep((step + 1) as Step);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep((step - 1) as Step);
  };

  const handleSubmitLead = async () => {
    if (!result || result.estado !== "OK" || !result.calculo) return;
    if (!formData.nombre || !formData.email) {
      setError("Por favor completa tu nombre y email");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const apiResponse = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formData.nombre,
          email: formData.email,
          telefono: formData.telefono,
          comunaId: formData.comunaId || null,
          montoBoletaIngresado: formData.montoBoleta,
          kitId: result.kit?.id,
          factorTechoAplicado: result.calculo.factorTecho,
          costoMedidorAplicado: result.calculo.costoMedidor,
          precioFinalIva: result.calculo.precioFinalIva,
        }),
      });

      const responseData = await apiResponse.json();

      if (!apiResponse.ok) {
        throw new Error(responseData.error || "Error al crear lead");
      }

      setLeadCreated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getClasificacionStyles = (clasificacion: Clasificacion) => {
    switch (clasificacion) {
      case "ALTA_RETORNO":
        return { bg: "bg-green-100", text: "text-green-800", border: "border-green-300", label: "EXCELENTE INVERSION" };
      case "MEDIO_RETORNO":
        return { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-300", label: "BUENA INVERSION" };
      case "BAJA_RETORNO":
        return { bg: "bg-red-100", text: "text-red-800", border: "border-red-300", label: "INVERSION A LARGO PLAZO" };
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={styles.stepContent}
          >
            <h2 className={styles.stepTitle}>En que comuna vives?</h2>
            <p className={styles.stepDescription}>Selecciona tu comuna para verificar cobertura</p>
            <Select
              value={formData.comunaId.toString()}
              onValueChange={(value) => setFormData({ ...formData, comunaId: parseInt(value) })}
            >
              <SelectTrigger className={styles.formSelect}>
                <SelectValue placeholder="Selecciona una comuna" />
              </SelectTrigger>
              <SelectContent>
                {comunas.filter((c: Comuna) => c.activa).map((comuna: Comuna) => (
                  <SelectItem key={comuna.id} value={comuna.id.toString()}>
                    {comuna.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={styles.stepContent}
          >
            <h2 className={styles.stepTitle}>Cual es tu monto de luz mensual?</h2>
            <p className={styles.stepDescription}>Ingresa el valor de tu ultima boleta de electricidad</p>
            <div className={styles.inputWithPrefix}>
              <span className={styles.inputPrefix}>$</span>
              <Input
                type="number"
                value={formData.montoBoleta || ""}
                onChange={(e) => setFormData({ ...formData, montoBoleta: parseInt(e.target.value) || 0 })}
                placeholder="Ej: 85000"
                className={styles.formInput}
              />
            </div>
            <div className={styles.alertWarning}>
              <strong>Rango valido:</strong> $50.000 - $230.000
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={styles.stepContent}
          >
            <h2 className={styles.stepTitle}>Detalles de tu instalacion</h2>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Tipo de techo</p>
              <div className={styles.optionGroup}>
                {TIPOS_TECHO.map((techo) => (
                  <button
                    key={techo.value}
                    onClick={() => setFormData({ ...formData, tipoTecho: techo.value as TipoTecho })}
                    className={cn(
                      "option-button",
                      formData.tipoTecho === techo.value ? "selected" : ""
                    )}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">{techo.label}</span>
                      <span className={cn("option-badge", techo.recargo > 0 ? "negative" : "positive")}>
                        {techo.desc}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Ubicacion del medidor</p>
              <div className={styles.optionGroup}>
                {TIPOS_MEDIDOR.map((medidor) => (
                  <button
                    key={medidor.value}
                    onClick={() => setFormData({ ...formData, tipoMedidor: medidor.value as TipoMedidor })}
                    className={cn(
                      "option-button",
                      formData.tipoMedidor === medidor.value ? "selected" : ""
                    )}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">{medidor.label}</span>
                      <span className={cn("option-badge", medidor.costo > 0 ? "negative" : "positive")}>
                        {medidor.desc}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={styles.stepContent}
          >
            {renderResults()}
          </motion.div>
        );
    }
  };

const renderResults = () => {
    if (!result) {
      return <div className="text-center py-8">Cargando resultados...</div>;
    }

    if (result.estado === "NO_VIABLE" || result.estado === "EJECUTIVO") {
      return (
        <div className="text-center space-y-4">
          <div className="text-6xl">{result.estado === "NO_VIABLE" ? "⚠️" : "📞"}</div>
          <h2 className="text-2xl font-bold text-gray-800">
            {result.estado === "NO_VIABLE" ? "Monto no viable" : "Tu caso es especial!"}
          </h2>
          <p className="text-gray-600">{result.mensaje}</p>
        </div>
      );
    }

    if (result.estado === "ERROR") {
      return (
        <div className="text-center space-y-4">
          <div className="text-6xl">❌</div>
          <h2 className="text-2xl font-bold text-gray-800">Error</h2>
          <p className="text-gray-600">{result.mensaje}</p>
        </div>
      );
    }

    if (leadCreated) {
      const resumen = result.resumenInversion!;
      return (
        <div className="text-center space-y-4">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl success-icon">
            ✅
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-800">Solicitud Enviada!</h2>
          <p className="text-gray-600">Hemos enviado los detalles a tu email.</p>
          <p className="text-emerald-600 font-semibold text-lg">
            Inversion total: {formatCLP(resumen.inversionTotal)}
          </p>
          <p className="text-gray-500 text-sm mt-4">
            Un ejecutivo te contactara pronto para finalizar la instalacion.
          </p>
        </div>
      );
    }

    const calculo = result.calculo!;
    const kit = result.kit!;
    const comuna = result.datosComuna!;
    const resumen = result.resumenInversion!;
    const clasificacionStyles = getClasificacionStyles(resumen.clasificacion);

    return (
      <div className="space-y-6">
        <h2 className={styles.resultsTitle}>Tu Inversion Solar</h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={styles.savingsDisplay}
        >
          <p className="text-emerald-100 text-sm font-medium uppercase tracking-wider">Ahorro Mensual</p>
          <p className={styles.savingsValue}>{formatCLP(resumen.ahorroMensual)}</p>
          <p className={styles.savingsPerMonth}>por mes</p>
        </motion.div>

        <div className={styles.resultsGrid}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className={styles.resultCard}
          >
            <p className={styles.resultLabel}>Anos para recuperar</p>
            <p className={styles.resultValue}>{resumen.anosRecuperacion} anos</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className={cn(
              "result-card",
              clasificacionStyles.bg,
              clasificacionStyles.text,
              clasificacionStyles.border
            )}
          >
            <p className="text-sm font-medium">{clasificacionStyles.label}</p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={styles.summaryCard}
        >
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Cobertura Energetica</span>
            <span className={styles.summaryValue}>{resumen.cobertura}%</span>
          </div>
          <div className={styles.coverageBar}>
            <div
              className={styles.coverageFill}
              style={{ width: `${Math.min(resumen.cobertura, 100)}%` }}
            />
          </div>
          <p className={styles.coverageDetails}>
            {calculo.generacionAnualKwh.toLocaleString("es-CL")} kWh/ano generados
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className={styles.summaryCard}
        >
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Comuna</span>
            <span className={styles.summaryValue}>{comuna.nombre}</span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Sistema</span>
            <span className={styles.summaryValue}>{kit.kwp} kWP / {kit.paneles} paneles</span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Inversor</span>
            <span className={styles.summaryValue}>{kit.inversorKw} kW</span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Generacion anual</span>
            <span className={styles.summaryValue}>{calculo.generacionAnualKwh.toLocaleString("es-CL")} kWh</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={styles.summaryCard}
        >
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Inversion Total (inc. IVA)</span>
            <span className={styles.summaryValue}>{formatCLP(calculo.precioFinalIva)}</span>
          </div>
          <div className={`${styles.summaryRow} ${styles.summaryRowSmall}`}>
            <span className={styles.summaryLabel}>Ahorro anual</span>
            <span className={styles.summaryValue}>{formatCLP(resumen.ahorroAnual)}/ano</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className={styles.contactForm}
        >
          <h3 className="font-semibold text-gray-800">Tus datos de contacto</h3>
          <div className={styles.formField}>
            <Input
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Nombre completo"
              className={styles.formInput}
            />
          </div>
          <div className={styles.formField}>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Email"
              className={styles.formInput}
            />
          </div>
          <div className={styles.formField}>
            <Input
              type="tel"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              placeholder="Telefono (opcional)"
              className={styles.formInput}
            />
          </div>
        </motion.div>

        {error && (
          <div className={styles.errorMessage}>{error}</div>
        )}

        <Button onClick={handleSubmitLead} disabled={isSubmitting} className={styles.submitButton}>
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Enviando...
            </>
          ) : (
            "Solicitar Presupuesto"
          )}
        </Button>
      </div>
    );
  };

  const renderSkeleton = () => (
    <div className="space-y-6">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  );

  return (
    <section className={styles.savingsCalculator} id="simulador">
      <div className={styles.container}>
        <div className={styles.calculatorHeader}>
          <h2 className={styles.calculatorTitle}>Calcula tu ahorro solar</h2>
          <p className={styles.calculatorSubtitle}>
            En solo 3 pasos conoce tu inversion, ahorro mensual y tiempo de recuperacion.
          </p>
        </div>

        <div className={styles.calculatorWrapper}>
          <Card className={styles.calculatorCard}>
            <div className={styles.cardHeader}>
              <h1 className={styles.cardHeaderTitle}>Simulador Solar Enercity</h1>
            </div>

            <div className={styles.progressBar}>
              <div className={styles.progressContainer}>
                {STEPS.map((s) => (
                  <div
                    key={s.num}
                    className={cn(
                      "progress-step",
                      step === s.num ? "active" : step > s.num ? "completed" : ""
                    )}
                  >
                    <div className="progress-number">
                      {step > s.num ? <Check className="w-4 h-4" /> : s.num}
                    </div>
                    <span className="progress-label">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <CardContent className={styles.cardContent}>
              <AnimatePresence mode="wait">
                {isCalculating ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {renderSkeleton()}
                  </motion.div>
                ) : (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {renderStepContent()}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>

            {step < 4 && (
              <div className={styles.buttonGroup}>
                {step > 1 && (
                  <button className={styles.secondaryButton} onClick={handleBack} disabled={isCalculating}>
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Atras
                  </button>
                )}
                <button
                  className={styles.primaryButton}
                  onClick={handleNext}
                  disabled={!canProceed() || isCalculating}
                >
                  {step === 3 ? (
                    isCalculating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Calculando...
                      </>
                    ) : (
                      "Calcular"
                    )
                  ) : (
                    <>
                      Continuar
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </section>
  );
}
