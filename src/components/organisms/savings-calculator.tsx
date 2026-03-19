"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { Check, ChevronLeft, ChevronRight, Loader2, Info, Zap, BarChart3, Shield, Sun,
Building, 
  House, 
  Settings, 
  ShieldCheck, 
  ShieldAlert

 } from 'lucide-react';

interface Comuna {
  id: number;
  nombre: string;
  activa: boolean;
  region?: string;
  radiacion_ghi: string;
  tarifa_est: string;
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
            className="space-y-6"
          >
            <div>
              <h3 className="text-xl font-bold text-white">¿Dónde se encuentra tu techo?</h3>
              <p className="text-white/60 text-sm">Selecciona tu comuna para obtener datos precisos</p>
            </div>

            <div className="relative">
              <Select
                value={formData.comunaId.toString()}
                onValueChange={(value) => setFormData({ ...formData, comunaId: parseInt(value) })}
              >
                <SelectTrigger 
                  className="w-full px-5 py-4 h-auto bg-white/5 border border-white/10 rounded-2xl focus:ring-0 focus:border-[#F07E04] text-white/50 data-[placeholder]:text-white/50 flex justify-between items-center transition-all"
                >
                  <SelectValue placeholder="Selecciona una comuna" />
                </SelectTrigger>
                <SelectContent className="bg-[#154660] border-white/10 text-white rounded-xl">
                  {comunas.filter((c: Comuna) => c.activa).map((comuna: Comuna) => (
                    <SelectItem key={comuna.id} value={comuna.id.toString()} className="focus:bg-[#F07E04] focus:text-white cursor-pointer">
                      {comuna.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(() => {
              const comunaSeleccionada = comunas.find(c => c.id === formData.comunaId);
              if (!comunaSeleccionada) return null;
              return (
                <div className="bg-[#4AAF4D]/10 border border-[#4AAF4D]/20 p-4 rounded-2xl flex items-center gap-4 text-[#4AAF4D] animate-in fade-in zoom-in duration-300">
                  <Sun className="w-5 h-5 shrink-0" />
                  <div className="flex flex-col text-sm">
                    <span className="text-[10px] uppercase font-black opacity-70 tracking-widest">Radiación Detectada</span>
                    <b>{comunaSeleccionada.nombre}: {comunaSeleccionada.radiacion_ghi} kWh/m²/día</b>
                  </div>
                </div>
              );
            })()}

            <button 
              onClick={handleNext} 
              disabled={!formData.comunaId}
              className="w-full bg-[#F07E04] text-white py-4 rounded-2xl font-black text-lg hover:bg-[#F09C0A] transition-colors disabled:opacity-50"
            >
              Continuar →
            </button>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-white">¿Cuánto pagas de luz actualmente?</h3>
              <p className="text-white/60 text-sm">Ajusta el monto promedio de tu boleta mensual.</p>
            </div>

            {/* Display de Consumo Estilo test.html */}
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] py-10 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-[#F07E04]/5 to-transparent" />
              <div className="relative z-10">
                <div className="text-5xl font-black  tracking-tighter">
                  {formatCLP(formData.montoBoleta || 100000)}
                </div>
                <div className="text-[10px] uppercase font-black text-white/40 tracking-[0.2em] mt-2">
                  monto mensual promedio
                </div>
              </div>
            </div>

            {/* Slider Personalizado */}
            <div className="px-2 space-y-4">
              <input 
                type="range" 
                min="30000" 
                max="230000" 
                step="5000"
                value={formData.montoBoleta || 100000}
                onChange={(e) => setFormData({ ...formData, montoBoleta: parseInt(e.target.value) })}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#F07E04]"
                style={{
                  background: `linear-gradient(to right, #F07E04 0%, #F07E04 ${(((formData.montoBoleta || 100000) - 30000) * 100) / (230000 - 30000)}%, rgba(255,255,255,0.1) ${(((formData.montoBoleta || 100000) - 30000) * 100) / (230000 - 30000)}%, rgba(255,255,255,0.1) 100%)`
                }}
              />
              <div className="flex justify-between text-[10px] font-black text-white/30 uppercase tracking-widest">
                <span>$30.000</span>
                <span>$230.000+</span>
              </div>
            </div>

            {/* Alertas Lógicas del HTML */}
            <div className="min-h-[60px]">
              <AnimatePresence mode="wait">
                {formData.montoBoleta > 0 && formData.montoBoleta < 50000 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="bg-[#4AAF4D]/10 border border-[#4AAF4D]/20 p-4 rounded-2xl flex items-center gap-3 text-[#4AAF4D] text-xs">
                    <Check className="w-4 h-4" />
                    <p>Tu consumo es eficiente. Hablemos para un proyecto a medida.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex gap-4">
              <button onClick={handleBack} className="w-16 h-14 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white"><ChevronLeft /></button>
              <button onClick={handleNext} disabled={!canProceed()} className="flex-grow bg-[#F07E04] text-white font-black rounded-2xl hover:bg-[#F09C0A] transition-all disabled:opacity-30">
                CONTINUAR
              </button>
            </div>
          </motion.div>
        );

    
case 3:
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold text-white uppercase tracking-tight">Configuración Técnica</h3>
        <p className="text-white/40 text-xs italic">Detalles finales para tu presupuesto certificado SEC.</p>
      </div>

      {/* SELECCIÓN DE TECHO (Building | House | Settings) */}
      <div className="space-y-4">
        <label className="text-[10px] font-black text-[#F07E04] uppercase tracking-[0.2em] ml-2">Tipo de Techumbre</label>
        <div className="grid grid-cols-3 gap-3">
          {TIPOS_TECHO.map((techo) => (
            <button
              key={techo.value}
              onClick={() => setFormData({ ...formData, tipoTecho: techo.value as TipoTecho })}
              className={cn(
                "p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 text-center group",
                formData.tipoTecho === techo.value 
                  ? "border-[#F07E04] bg-[#F07E04]/10 text-white shadow-[0_0_20px_rgba(240,126,4,0.15)]" 
                  : "border-white/5 bg-white/5 text-white/40 hover:border-white/20"
              )}
            >
              <div className={cn(
                "transition-transform duration-300 group-hover:scale-110",
                formData.tipoTecho === techo.value ? "text-[#F07E04]" : "text-white/20 group-hover:text-white/40"
              )}>
                {techo.value === "Losa" && <Building className="w-6 h-6 stroke-[1.5]" />}
                {techo.value === "Teja Chilena" && <House className="w-6 h-6 stroke-[1.5]" />}
                {techo.value === "Otro" && <Settings className="w-6 h-6 stroke-[1.5]" />}
              </div>
              <span className="text-[10px] font-black uppercase leading-tight tracking-wider">
                {techo.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* UBICACIÓN DEL MEDIDOR */}
      <div className="space-y-4">
        <label className="text-[10px] font-black text-[#F07E04] uppercase tracking-[0.2em] ml-2">Ubicación del Medidor</label>
        <div className="grid grid-cols-2 gap-3">
          {TIPOS_MEDIDOR.map((medidor) => (
            <button
              key={medidor.value}
              onClick={() => setFormData({ ...formData, tipoMedidor: medidor.value as TipoMedidor })}
              className={cn(
                "p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 text-center group",
                formData.tipoMedidor === medidor.value 
                  ? "border-[#F07E04] bg-[#F07E04]/10 text-white shadow-[0_0_20px_rgba(240,126,4,0.1)]" 
                  : "border-white/5 bg-white/5 text-white/40 hover:border-white/20"
              )}
            >
              <div className={cn(
                "transition-colors",
                formData.tipoMedidor === medidor.value ? "text-[#F07E04]" : "text-white/20 group-hover:text-white/40"
              )}>
                {medidor.value === "Normal" ? <ShieldCheck className="w-6 h-6 stroke-[1.5]" /> : <ShieldAlert className="w-6 h-6 stroke-[1.5]" />}
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-black uppercase tracking-widest">{medidor.label}</span>
                <span className="text-[9px] opacity-40 font-bold uppercase tracking-tighter">
                  {medidor.value === "Normal" ? "Interior Propiedad" : "Perímetro Exterior"}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* ALERTA KIT ADECUACIÓN SEC */}
        <AnimatePresence>
          {formData.tipoMedidor === "Reja/Fuera" && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-[#F07E04]/10 border border-[#F07E04]/30 p-5 rounded-3xl mt-2 relative overflow-hidden group">
                <div className="relative z-10 space-y-2">
                  <div className="flex items-center gap-2 text-[#F07E04]">
                    <ShieldAlert className="w-4 h-4" />
                    <span className="text-[11px] font-black uppercase tracking-[0.15em]">Kit de Adecuación Normativa SEC</span>
                  </div>
                  <p className="text-white/60 text-[11px] leading-relaxed italic">
                    Incluye canalización blindada y protecciones adicionales para cumplir con la norma de seguridad en medidores fuera del perímetro.
                  </p>
                  <div className="pt-2 flex justify-between items-center border-t border-white/5 mt-1">
                    <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Valor Adicional</span>
                    <span className="text-sm font-black text-white">$350.000</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* NAVEGACIÓN */}
      <div className="flex gap-4 pt-4">
        <button 
          onClick={handleBack} 
          className="w-16 h-14 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
        >
          <ChevronLeft className="w-6 h-6 stroke-[1.5]" />
        </button>
        <button 
          onClick={handleNext} 
          disabled={isCalculating || !canProceed()}
          className="flex-grow bg-[#F07E04] text-white font-black rounded-2xl hover:bg-[#F09C0A] transition-all flex items-center justify-center gap-3 shadow-lg shadow-[#F07E04]/20"
        >
          {isCalculating ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>VER RESULTADOS <ChevronRight className="w-5 h-5 stroke-[2]" /></>
          )}
        </button>
      </div>
    </motion.div>
  );
      
      case 4:
        return (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
            {renderResults()}
          </motion.div>
        );
    }
  };

const renderResults = () => {
  // 1. EL CARGADOR "MÁGICO" (Muestra el sol mientras espera el resultado)
  if (!result) {
    return (
      <div className="py-16 flex flex-col items-center justify-center text-center">
        <div className="relative mb-8">
          {/* Resplandor de fondo */}
          <div className="absolute inset-0 bg-[#F07E04] blur-[60px] opacity-20 animate-pulse" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="relative z-10 text-[#F07E04]"
          >
            <Sun className="w-24 h-24 stroke-[1]" />
          </motion.div>
        </div>
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Analizando Potencial</h3>
          <p className="text-white/40 text-sm max-w-[280px] mx-auto leading-relaxed">
            Cruzando datos de radiación para la comuna de <span className="text-white font-bold">{comunas.find(c => c.id === formData.comunaId)?.nombre}</span>...
          </p>
        </motion.div>
      </div>
    );
  }

  // 2. LÓGICA DE DATOS
  const calculo = result.calculo!;
  const kit = result.kit!;
  const comuna = result.datosComuna!;
  const resumen = result.resumenInversion!;
  const clasificacionStyles = getClasificacionStyles(resumen.clasificacion);
  

  if (leadCreated) {
    return (
       <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10 space-y-6">
         <div className="w-20 h-20 bg-[#4AAF4D] rounded-full flex items-center justify-center mx-auto shadow-lg shadow-[#4AAF4D]/20">
           <Check className="text-white w-10 h-10 stroke-[3]" />
         </div>
         <h2 className="text-3xl font-black text-white">¡Presupuesto Enviado!</h2>
         <p className="text-white/50 text-sm">Revisa tu correo. Un asesor se conectará contigo pronto.</p>
       </motion.div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* SECCIÓN 1: EL GANCHO (Ahorro Mensual) */}
      <div className="text-center space-y-1">
        <h2 className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">Tu Diagnóstico Enercity</h2>
        <h3 className="text-2xl font-black text-white uppercase tracking-tight">Tu Inversión Solar</h3>
      </div>

      <div className="bg-gradient-to-br from-[#F07E04] to-[#F09C0A] rounded-[2.5rem] p-8 text-white shadow-2xl shadow-[#F07E04]/30 relative overflow-hidden">
        <div className="relative z-10 text-center">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Ahorro Mensual</span>
          <div className="text-6xl font-black tracking-tighter my-2">{formatCLP(resumen.ahorroMensual)}</div>
          <p className="text-xs font-bold bg-black/10 inline-block px-4 py-1 rounded-full uppercase">Por mes</p>
        </div>
        <Zap className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10 rotate-12" />
      </div>

      {/* SECCIÓN 2: RETORNO Y CLASIFICACIÓN (Comparativa) */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 border border-white/10 p-5 rounded-[2rem] flex flex-col items-center justify-center text-center">
          <span className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Años para recuperar</span>
          <span className="text-xl font-black text-white italic">{resumen.anosRecuperacion} Años</span>
        </div>
        <div className={cn(
          "p-5 rounded-[2rem] border-2 flex items-center justify-center text-center font-black text-[10px] uppercase tracking-widest leading-tight transition-all",
          resumen.clasificacion === "ALTA_RETORNO" ? "border-[#4AAF4D] bg-[#4AAF4D]/10 text-[#4AAF4D]" : "border-white/10 bg-white/5 text-white/60"
        )}>
          {clasificacionStyles.label}
        </div>
      </div>

      {/* SECCIÓN 3: COBERTURA (Visual) */}
      <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 space-y-4">
        <div className="flex justify-between items-end px-1">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Cobertura Energética</span>
            <div className="text-3xl font-black text-white">{resumen.cobertura}%</div>
          </div>
          <div className="text-right text-[10px] font-bold text-[#4AAF4D] bg-[#4AAF4D]/10 px-3 py-1 rounded-full">
            {calculo.generacionAnualKwh.toLocaleString("es-CL")} kWh/año generados
          </div>
        </div>
        <div className="h-4 bg-white/5 rounded-full p-1 border border-white/5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(resumen.cobertura, 100)}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-[#4AAF4D] to-[#86efac] rounded-full shadow-[0_0_15px_rgba(74,175,77,0.4)]"
          />
        </div>
      </div>

      {/* SECCIÓN 4: DESGLOSE TÉCNICO (El detalle para los analíticos) */}
      <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-4">
        <h4 className="text-[10px] font-black text-[#F07E04] uppercase tracking-[0.3em] mb-4 text-center">Ficha Técnica del Sistema</h4>
        <div className="space-y-3">
          {[
            { label: "Comuna", val: comuna.nombre },
            { label: "Sistema", val: `${kit.kwp} kWP / ${kit.paneles} paneles` },
            { label: "Inversor", val: `${kit.inversorKw} kW` },
            { label: "Generación anual", val: `${calculo.generacionAnualKwh.toLocaleString("es-CL")} kWh` }
          ].map((item, i) => (
            <div key={i} className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-0">
              <span className="text-white/40 font-medium">{item.label}</span>
              <span className="text-white font-bold">{item.val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SECCIÓN 5: EL CIERRE (Inversión vs Ahorro) */}
      <div className="bg-[#154660] border-t border-white/10 rounded-[2.5rem] p-8 shadow-2xl space-y-6">
        <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Inversión Total (IVA inc.)</span>
            <div className="text-2xl font-black text-white">{formatCLP(calculo.precioFinalIva)}</div>
          </div>
          <div className="text-right">
             <span className="text-[9px] font-black text-[#F07E04] uppercase">Ahorro Anual</span>
             <div className="text-sm font-bold text-white italic">{formatCLP(resumen.ahorroAnual)}/año</div>
          </div>
        </div>

        {/* Captura de Leads (Formulario) */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <Input 
              value={formData.nombre} 
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              placeholder="Tu nombre completo" 
              className="bg-white/10 border-white/10 h-14 rounded-2xl text-white placeholder:text-white/30 px-6 focus:border-[#F07E04] transition-all" 
            />
            <Input 
              type="email"
              value={formData.email} 
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="tu@email.com" 
              className="bg-white/10 border-white/10 h-14 rounded-2xl text-white placeholder:text-white/30 px-6 focus:border-[#F07E04] transition-all" 
            />
          </div>
          <Button 
            onClick={handleSubmitLead} 
            disabled={isSubmitting}
            className="w-full h-16 bg-[#F07E04] hover:bg-[#F09C0A] text-white font-black rounded-2xl shadow-xl shadow-[#F07E04]/20 transition-all text-lg group"
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : (
              <span className="flex items-center gap-2">
                SOLICITAR PRESUPUESTO FINAL <ChevronRight className="group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </Button>
          <p className="text-[10px] text-white/20 text-center uppercase font-bold tracking-widest">
            Incluye visita técnica gratuita y factibilidad SEC
          </p>
        </div>
      </div>
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

     
    <section id="simulador-section" className="py-24 bg-[#F8FAFC]">
      <div className="container mx-auto px-6">
        
        {/* Header con tu estilo exacto */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-sm font-bold uppercase tracking-[0.25em] mb-4 text-[#F07E04]">
            Calculadora de Ahorro
          </p>
          <h2 className="text-4xl md:text-5xl font-black mb-6 text-[#154660] leading-tight">
            Descubre cuánto puedes <span className="text-[#F07E04]">ahorrar este año.</span>
          </h2>
          <p className="text-gray-500 text-lg">
            Responde 3 preguntas y obtén tu diagnóstico personalizado en 60 segundos.
          </p>
        </div>

        {/* Glosario de Tooltips Interactivos */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
          {[
            { label: "kWp", desc: "Potencia máxima de tus paneles" },
            { label: "Net Billing", desc: "Ley que permite vender luz sobrante" },
            { label: "Inversor", desc: "Cerebro que convierte energía solar" },
            { label: "Medidor", desc: "Equipo bidireccional certificado SEC" }
          ].map((item, i) => (
            <div 
              key={i} 
              className="group relative flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider cursor-help hover:border-[#F07E04] hover:text-[#F07E04] transition-all"
            >
              <Info className="w-3.5 h-3.5" />
              {item.label}
              
              {/* Tooltip Real (Pure CSS) */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-[#154660] text-white text-[10px] leading-relaxed rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-xl">
                {item.desc}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-[#154660]" />
              </div>
            </div>
          ))}
        </div>

        <div className="max-w-xl mx-auto">
  

<section id="simulador" className="py-20 bg-slate-50 min-h-screen flex items-center">
  <div className="container mx-auto px-6 max-w-xl">
    {/* Tarjeta Principal */}
    <div className="bg-[#154660] rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10 text-white">
      
      {/* Header del Diseñador */}
      <div className="p-8 pb-4 flex justify-between items-end">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#F07E04] bg-[#F07E04]/10 px-3 py-1 rounded-full border border-[#F07E04]/20">
            Simulador Solar
          </span>
          <h2 className="text-2xl font-black mt-3">Paso {step} de 4</h2>
        </div>
        
        {/* Step Dots (Pintura estática) */}
        <div className="flex gap-2 mb-2">
          {[1, 2, 3, 4].map((num) => (
            <div 
              key={num} 
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step === num ? "w-8 bg-[#F07E04]" : "w-2 bg-white/20"
              }`} 
            />
          ))}
        </div>
      </div>

      {/* Cuerpo del Simulador */}
      <div className="p-8 pt-4">
        {renderStepContent()}
      </div>
    </div>
  </div>
</section>


        </div>

  {/* Footer del simulador: Confianza */}
        <div className="mt-12 flex justify-center items-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all">
           <div className="flex items-center gap-2 text-xs font-bold text-[#154660]">
             <Shield className="w-4 h-4" /> DATOS PROTEGIDOS
           </div>
           <div className="flex items-center gap-2 text-xs font-bold text-[#154660]">
             <Zap className="w-4 h-4" /> CÁLCULO EN TIEMPO REAL
           </div>
        </div>
      </div>
    </section>

  );
}
