import { useState } from 'react';
import type { Comuna, Kit } from '../types/simulation';

interface QuoteResult {
  estado: 'OK' | 'NO_VIABLE' | 'EJECUTIVO' | 'ERROR';
  mensaje?: string;
  kit?: Kit;
  desglose?: {
    precioBase: number;
    factorTecho: number;
    recargoTecho: number;
    costoFijoMedidor: number;
    precioSinIva: number;
    precioFinal: number;
  };
  precioFinal?: number;
}

interface WizardProps {
  comunas: Comuna[];
}

type Step = 1 | 2 | 3 | 4 | 5;

const STEPS = [
  { num: 1, label: 'Tu Comuna' },
  { num: 2, label: 'Tu Consumo' },
  { num: 3, label: 'Detalles' },
  { num: 4, label: 'Calculando' },
  { num: 5, label: 'Resultados' },
];

const TIPOS_TECHO = [
  { value: 'Losa', label: 'Losa', desc: 'Sin recargo', recargo: 0 },
  { value: 'Teja Chilena', label: 'Teja Chilena', desc: '+14% recargo', recargo: 14 },
  { value: 'Otro', label: 'Otro', desc: 'Sin recargo', recargo: 0 },
];

const TIPOS_MEDIDOR = [
  { value: 'Normal', label: 'Normal', desc: 'Dentro de la propiedad', costo: 0 },
  { value: 'Reja/Fuera', label: 'Reja/Fuera', desc: 'Fuera de la propiedad', costo: 350000 },
];

function formatCLP(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function SolarWizard({ comunas }: WizardProps) {
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState<QuoteResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [leadCreated, setLeadCreated] = useState(false);

  const [formData, setFormData] = useState({
    comunaId: 0,
    montoBoleta: 0,
    tipoTecho: 'Losa' as const,
    tipoMedidor: 'Normal' as const,
    nombre: '',
    email: '',
    telefono: '',
  });

  const canProceed = () => {
    switch (step) {
      case 1: return formData.comunaId > 0;
      case 2: return formData.montoBoleta >= 50000;
      case 3: return !!formData.tipoTecho && !!formData.tipoMedidor;
      case 4: return false;
      case 5: return true;
      default: return false;
    }
  };

  const handleNext = async () => {
    if (step === 3) {
      setStep(4);
      setCalculating(true);
      setError(null);
      
      try {
        const response = await fetch('/api/calculate-quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            montoBoleta: formData.montoBoleta,
            tipoTecho: formData.tipoTecho,
            tipoMedidor: formData.tipoMedidor,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Error al calcular');
        }

        setResult(data);
        
        if (data.estado === 'OK') {
          setStep(5);
        } else if (data.estado === 'NO_VIIBLE' || data.estado === 'EJECUTIVO') {
          setStep(5);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setStep(3);
      } finally {
        setCalculating(false);
      }
    } else if (step < 5) {
      setStep((step + 1) as Step);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep((step - 1) as Step);
  };

  const handleSubmitLead = async () => {
    if (!result || result.estado !== 'OK' || !result.desglose) return;
    if (!formData.nombre || !formData.email) {
      setError('Por favor completa tu nombre y email');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formData.nombre,
          email: formData.email,
          telefono: formData.telefono,
          comunaId: formData.comunaId || null,
          montoBoletaIngresado: formData.montoBoleta,
          kitId: result.kit?.id,
          factorTechoAplicado: result.desglose.factorTecho,
          costoFijoMedidorAplicado: result.desglose.costoFijoMedidor,
          precioFinalIva: result.desglose.precioFinal,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear lead');
      }

      setLeadCreated(true);

      if (result.desglose) {
        const pdfData = {
          nombre: formData.nombre,
          email: formData.email,
          telefono: formData.telefono,
          montoBoleta: formData.montoBoleta,
          kit: {
            kwp: result.kit?.kwp || 0,
            paneles: result.kit?.paneles || 0,
            inversorKw: result.kit?.inversorKw || 0,
          },
          tipoTecho: formData.tipoTecho,
          tipoMedidor: formData.tipoMedidor,
          precioBase: result.desglose.precioBase,
          recargoTecho: result.desglose.recargoTecho,
          costoFijoMedidor: result.desglose.costoFijoMedidor,
          precioFinal: result.desglose.precioFinal,
          fecha: new Date().toLocaleDateString('es-CL'),
        };
        
        const { generatePDF } = await import('../lib/pdfGenerator');
        generatePDF(pdfData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">¿En qué comuna vives?</h2>
      <p className="text-gray-600">Selecciona tu comuna para verificar cobertura</p>
      <select
        value={formData.comunaId}
        onChange={(e) => setFormData({ ...formData, comunaId: parseInt(e.target.value) })}
        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none bg-white"
      >
        <option value={0}>Selecciona una comuna</option>
        {comunas.filter(c => c.activa).map((comuna) => (
          <option key={comuna.id} value={comuna.id}>
            {comuna.nombre}
          </option>
        ))}
      </select>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">¿Cuál es tu monto de luz mensual?</h2>
      <p className="text-gray-600">Ingresa el valor de tu última boleta de electricidad</p>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl">$</span>
        <input
          type="number"
          value={formData.montoBoleta || ''}
          onChange={(e) => setFormData({ ...formData, montoBoleta: parseInt(e.target.value) || 0 })}
          placeholder="Ej: 85000"
          className="w-full pl-10 pr-4 py-4 text-2xl border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition"
        />
      </div>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
        <strong>Rango válido:</strong> $50.000 - $230.000
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Detalles de tu instalación</h2>
      
      <div>
        <p className="text-sm font-medium text-gray-700 mb-3">Tipo de techo</p>
        <div className="grid gap-3">
          {TIPOS_TECHO.map((techo) => (
            <button
              key={techo.value}
              onClick={() => setFormData({ ...formData, tipoTecho: techo.value as typeof formData.tipoTecho })}
              className={`p-4 border-2 rounded-xl text-left transition ${
                formData.tipoTecho === techo.value
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 hover:border-emerald-300'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold">{techo.label}</span>
                <span className={`text-sm ${techo.recargo > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                  {techo.desc}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-gray-700 mb-3">Ubicación del medidor</p>
        <div className="grid gap-3">
          {TIPOS_MEDIDOR.map((medidor) => (
            <button
              key={medidor.value}
              onClick={() => setFormData({ ...formData, tipoMedidor: medidor.value as typeof formData.tipoMedidor })}
              className={`p-4 border-2 rounded-xl text-left transition ${
                formData.tipoMedidor === medidor.value
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 hover:border-emerald-300'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold">{medidor.label}</span>
                <span className={`text-sm ${medidor.costo > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                  {medidor.desc}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="text-center py-8 space-y-4">
      <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto"></div>
      <p className="text-gray-600">Calculando tu presupuesto...</p>
    </div>
  );

  const renderStep5 = () => {
    if (!result) {
      return <div className="text-center py-8">Cargando resultados...</div>;
    }

    if (result.estado === 'NO_VIABLE' || result.estado === 'EJECUTIVO') {
      return (
        <div className="text-center space-y-4">
          <div className="text-6xl">{result.estado === 'NO_VIABLE' ? '⚠️' : '📞'}</div>
          <h2 className="text-2xl font-bold text-gray-800">
            {result.estado === 'NO_VIABLE' ? 'Monto no viable' : '¡Tu caso es especial!'}
          </h2>
          <p className="text-gray-600">{result.mensaje}</p>
        </div>
      );
    }

    if (result.estado === 'ERROR') {
      return (
        <div className="text-center space-y-4">
          <div className="text-6xl">❌</div>
          <h2 className="text-2xl font-bold text-gray-800">Error</h2>
          <p className="text-gray-600">{result.mensaje}</p>
        </div>
      );
    }

    if (leadCreated) {
      const desglose = result.desglose!;
      return (
        <div className="text-center space-y-4">
          <div className="text-6xl">✅</div>
          <h2 className="text-2xl font-bold text-gray-800">¡Solicitud Enviada!</h2>
          <p className="text-gray-600">Hemos enviado los detalles a tu email.</p>
          <p className="text-emerald-600 font-semibold text-lg">
            Precio final: {formatCLP(desglose.precioFinal)}
          </p>
          <p className="text-gray-500 text-sm mt-4">
            Un ejecutivo te contactará pronto para finalizar la instalación.
          </p>
        </div>
      );
    }

    const desglose = result.desglose!;
    const kit = result.kit!;

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 text-center">Tu Presupuesto</h2>
        
        <div className="bg-gray-50 rounded-xl p-6 space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Kit recomendado</span>
            <span className="font-semibold">{kit.kwp} kWP / {kit.paneles} paneles</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Inversor</span>
            <span className="font-semibold">{kit.inversorKw} kW</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Precio base</span>
            <span>{formatCLP(desglose.precioBase)}</span>
          </div>
          {desglose.recargoTecho > 0 && (
            <div className="flex justify-between text-amber-600">
              <span>Recargo Teja Chilena (+14%)</span>
              <span>+{formatCLP(desglose.recargoTecho)}</span>
            </div>
          )}
          {desglose.costoFijoMedidor > 0 && (
            <div className="flex justify-between text-amber-600">
              <span>Medidor Reja/Fuera</span>
              <span>+{formatCLP(desglose.costoFijoMedidor)}</span>
            </div>
          )}
          <div className="border-t pt-4 flex justify-between text-lg font-bold">
            <span>Precio final (inc. IVA)</span>
            <span className="text-emerald-600">{formatCLP(desglose.precioFinal)}</span>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800">Tus datos de contacto</h3>
          <div>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"
              placeholder="Nombre completo"
            />
          </div>
          <div>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"
              placeholder="Email"
            />
          </div>
          <div>
            <input
              type="tel"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"
              placeholder="Teléfono (opcional)"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmitLead}
          disabled={loading}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition disabled:opacity-50"
        >
          {loading ? 'Enviando...' : 'Solicitar Presupuesto PDF'}
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="bg-emerald-600 px-6 py-4">
        <h1 className="text-white text-xl font-bold">Simulador Solar Enercity</h1>
      </div>
      
      <div className="bg-gray-100 px-6 py-3">
        <div className="flex justify-between">
          {STEPS.map((s) => (
            <div
              key={s.num}
              className={`flex flex-col items-center ${
                step === s.num ? 'text-emerald-600' : step > s.num ? 'text-emerald-400' : 'text-gray-400'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step === s.num ? 'bg-emerald-600 text-white' : step > s.num ? 'bg-emerald-400 text-white' : 'bg-gray-300'
              }`}>
                {step > s.num ? '✓' : s.num}
              </div>
              <span className="text-xs mt-1 hidden sm:block">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && renderStep5()}
      </div>

      {step < 5 && (
        <div className="px-6 pb-6 flex gap-4">
          {step > 1 && step !== 4 && (
            <button
              onClick={handleBack}
              className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition"
            >
              Atrás
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!canProceed() || calculating}
            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {step === 3 ? (calculating ? 'Calculando...' : 'Calcular') : 'Continuar'}
          </button>
        </div>
      )}
    </div>
  );
}
