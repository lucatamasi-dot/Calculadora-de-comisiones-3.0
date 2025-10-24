
import React, { useState, useCallback, useMemo } from 'react';
import type { CantidadCuotas, CanalDeVenta, ResultadoCalculo, CanalDeVentaNormal } from './types';
// FIX: `CUOTAS_OPTIONS` is exported from `constants.ts`, not `types.ts`. The import has been moved.
import { CANAL_EMPRETIENDA, CANAL_QR, CANALES_DE_VENTA_NORMAL } from './types';
import { IVA_RATE, COMISION_NORMAL, COMISION_EMPRETIENDA, COMISION_QR, CFTS, CUOTAS_OPTIONS } from './constants';

// --- Helper Functions ---
const formatCurrency = (value: number) => {
  return value.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatPercentage = (value: number) => {
  return `${value.toFixed(2).replace('.', ',')} %`;
};

// --- SVG Icons ---
const CalculatorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-6 w-6"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><line x1="16" x2="12" y1="14" y2="14"/><line x1="12" x2="12" y1="14" y2="18"/><line x1="8" x2="8" y1="14" y2="18"/></svg>
);
const ArrowRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 h-5 w-5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
);
const ArrowLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
);
const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
);
const RefreshCwIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
);


// --- Main Application ---
export default function App() {
  const [step, setStep] = useState(1);
  const [monto, setMonto] = useState('');
  const [cuotas, setCuotas] = useState<CantidadCuotas>(1);
  const [canal, setCanal] = useState<CanalDeVenta>('link de pago');
  const [resultado, setResultado] = useState<ResultadoCalculo | null>(null);
  const [error, setError] = useState('');
  const [qrCorrectionMessage, setQrCorrectionMessage] = useState<string | null>(null);

  const handleMontoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      setError('Por favor, ingresá un monto válido y mayor a cero.');
      return;
    }
    setError('');
    setStep(2);
  };
  
  const handleCalculate = useCallback(() => {
    let finalCuotas = cuotas;
    let finalMonto = parseFloat(monto);

    if (canal === CANAL_QR && cuotas > 1) {
      finalCuotas = 1;
      setQrCorrectionMessage('Las ventas por QR no permiten cuotas. Se corrigió el cálculo a 1 pago.');
    } else {
      setQrCorrectionMessage(null);
    }
    
    let comisionPct: number;
    if (CANALES_DE_VENTA_NORMAL.includes(canal as CanalDeVentaNormal)) {
        comisionPct = COMISION_NORMAL;
    } else if (canal === CANAL_EMPRETIENDA) {
        comisionPct = COMISION_EMPRETIENDA;
    } else {
        comisionPct = COMISION_QR;
    }

    const arancel = finalMonto * comisionPct;
    const ivaArancel = arancel * IVA_RATE;

    const aplicaCft = finalCuotas > 1 && canal !== CANAL_QR;
    const cftPct = aplicaCft ? (CFTS[finalCuotas] || 0) : 0;
    const cftMonto = finalMonto * cftPct;
    const ivaCft = cftMonto * IVA_RATE;

    const comisionTotalCobrada = arancel + ivaArancel + cftMonto + ivaCft;
    const montoTotalAAcreditar = finalMonto - comisionTotalCobrada;
    
    const pctComisionCobradaSinIva = (comisionPct + cftPct) * 100;
    const pctComisionCobradaConIva = ((comisionPct * (1 + IVA_RATE)) + (cftPct * (1 + IVA_RATE))) * 100;

    setResultado({
      montoOriginal: finalMonto,
      cantidadCuotas: finalCuotas,
      canalDeVenta: canal,
      pctComisionCobradaSinIva,
      pctComisionCobradaConIva,
      arancel,
      ivaArancel,
      cftMonto,
      ivaCft,
      comisionTotalCobrada,
      montoTotalAAcreditar,
      aplicaCft,
    });
    setStep(4);
  }, [monto, cuotas, canal]);

  const handleReset = () => {
    setStep(1);
    setMonto('');
    setCuotas(1);
    setCanal('link de pago');
    setResultado(null);
    setError('');
    setQrCorrectionMessage(null);
  };
  
  const progress = useMemo(() => {
    if (step === 4) return 100;
    return ((step - 1) / 3) * 100;
  }, [step]);
  
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
            <form onSubmit={handleMontoSubmit}>
                <h2 className="text-xl font-semibold text-slate-700 mb-2">Paso 1: Monto de la venta</h2>
                <p className="text-slate-500 mb-6">Ingresá el valor total de la operación.</p>
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">$</span>
                    <input
                        type="number"
                        value={monto}
                        onChange={(e) => { setMonto(e.target.value); setError(''); }}
                        placeholder="10000"
                        className="w-full pl-7 pr-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        autoFocus
                    />
                </div>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                <button type="submit" className="w-full mt-6 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center transition-transform transform hover:scale-105">
                    Siguiente <ArrowRightIcon/>
                </button>
            </form>
        );
      case 2:
        return (
            <div>
                <h2 className="text-xl font-semibold text-slate-700 mb-2">Paso 2: Cantidad de cuotas</h2>
                <p className="text-slate-500 mb-6">Seleccioná el plan de pagos.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {CUOTAS_OPTIONS.map((c) => (
                        <button key={c} onClick={() => setCuotas(c)} className={`p-4 rounded-lg border-2 transition text-center font-semibold ${cuotas === c ? 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-300' : 'bg-white hover:border-blue-500 border-slate-300'}`}>
                            {c} {c === 1 ? 'pago' : 'cuotas'}
                        </button>
                    ))}
                </div>
                <div className="flex justify-between mt-6 space-x-4">
                    <button onClick={() => setStep(1)} className="w-1/2 bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-lg hover:bg-slate-300 flex items-center justify-center transition-transform transform hover:scale-105">
                       <ArrowLeftIcon/> Atrás
                    </button>
                    <button onClick={() => setStep(3)} className="w-1/2 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center transition-transform transform hover:scale-105">
                        Siguiente <ArrowRightIcon/>
                    </button>
                </div>
            </div>
        );
      case 3:
        const canales = [...CANALES_DE_VENTA_NORMAL, CANAL_EMPRETIENDA, CANAL_QR];
        return (
            <div>
                <h2 className="text-xl font-semibold text-slate-700 mb-2">Paso 3: Canal de venta</h2>
                <p className="text-slate-500 mb-6">Elegí por dónde se realizó la venta.</p>
                <div className="space-y-3">
                    {canales.map((c) => (
                        <button key={c} onClick={() => setCanal(c)} className={`w-full p-4 rounded-lg border-2 transition text-left font-semibold flex items-center ${canal === c ? 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-300' : 'bg-white hover:border-blue-500 border-slate-300'}`}>
                            <span className={`w-4 h-4 rounded-full mr-3 ${canal === c ? 'bg-white' : 'bg-slate-300'}`}></span>
                            {c}
                        </button>
                    ))}
                </div>
                <div className="flex justify-between mt-6 space-x-4">
                    <button onClick={() => setStep(2)} className="w-1/2 bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-lg hover:bg-slate-300 flex items-center justify-center transition-transform transform hover:scale-105">
                        <ArrowLeftIcon/> Atrás
                    </button>
                    <button onClick={handleCalculate} className="w-1/2 bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center transition-transform transform hover:scale-105">
                        <CheckCircleIcon/> Calcular
                    </button>
                </div>
            </div>
        );
      case 4:
        if (!resultado) return null;
        return (
            <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-4 text-center">Resultados de la operación</h2>
                {qrCorrectionMessage && (
                    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md mb-4" role="alert">
                        <p className="font-bold">Aviso</p>
                        <p>{qrCorrectionMessage}</p>
                    </div>
                )}
                <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <p className="text-sm text-blue-800">Monto original de la venta</p>
                        <p className="text-3xl font-bold text-blue-900">{formatCurrency(resultado.montoOriginal)}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="bg-slate-100 p-3 rounded">
                            <p className="text-slate-600">% Comisión cobrada (+IVA)</p>
                            <p className="font-bold text-slate-800 text-lg">{formatPercentage(resultado.pctComisionCobradaConIva)}</p>
                        </div>
                        <div className="bg-slate-100 p-3 rounded">
                            <p className="text-slate-600">% Comisión cobrada (sin IVA)</p>
                            <p className="font-bold text-slate-800 text-lg">{formatPercentage(resultado.pctComisionCobradaSinIva)} + IVA</p>
                        </div>
                    </div>

                    <div className="border-t border-slate-200 pt-4 space-y-2">
                        <div className="flex justify-between items-center"><span className="text-slate-600">Arancel</span> <span className="font-medium">{formatCurrency(resultado.arancel)}</span></div>
                        <div className="flex justify-between items-center"><span className="text-slate-600">IVA Arancel</span> <span className="font-medium">{formatCurrency(resultado.ivaArancel)}</span></div>
                        {resultado.aplicaCft && (
                            <>
                                <div className="flex justify-between items-center"><span className="text-slate-600">CFT ({resultado.cantidadCuotas} cuotas)</span> <span className="font-medium">{formatCurrency(resultado.cftMonto)}</span></div>
                                <div className="flex justify-between items-center"><span className="text-slate-600">IVA CFT</span> <span className="font-medium">{formatCurrency(resultado.ivaCft)}</span></div>
                            </>
                        )}
                    </div>
                    
                    <div className="border-t border-slate-200 pt-4 space-y-3">
                        <div className="flex justify-between items-center text-red-700 p-2 bg-red-50 rounded-md">
                            <span className="font-bold">👉 Comisión total cobrada</span>
                            <span className="font-bold text-lg">{formatCurrency(resultado.comisionTotalCobrada)}</span>
                        </div>
                        <div className="flex justify-between items-center text-green-700 p-3 bg-green-50 rounded-md">
                            <span className="font-bold">💰 Monto total a acreditar</span>
                            <span className="font-bold text-2xl">{formatCurrency(resultado.montoTotalAAcreditar)}</span>
                        </div>
                    </div>
                </div>
                <button onClick={handleReset} className="w-full mt-6 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center transition-transform transform hover:scale-105">
                    <RefreshCwIcon/> Calcular de nuevo
                </button>
            </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 font-sans">
      <main className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 transform transition-all duration-500">
            <header className="flex items-center justify-center mb-6 text-2xl font-bold text-slate-700">
                <CalculatorIcon />
                <h1>Calculadora de Comisiones</h1>
            </header>
            
            {step < 4 && (
              <div className="mb-6">
                <div className="w-full bg-slate-200 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
            )}
          
            <div className="transition-opacity duration-300">
              {renderStep()}
            </div>
        </div>
        <footer className="text-center mt-6 text-sm text-slate-500">
          <p>Gracias por usar la Calculadora 2.0.</p>
          <p>Ante cualquier inconveniente o falla, no duden en reportarlo.</p>
        </footer>
      </main>
    </div>
  );
}
