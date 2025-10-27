
import type { CantidadCuotas } from './types';

export const IVA_RATE = 0.21;

export const COMISION_NORMAL = 0.049;
export const COMISION_DEBITO = 0.029;
export const COMISION_EMPRETIENDA = 0.044;
export const COMISION_QR = 0.008;

export const CFTS: Partial<Record<CantidadCuotas, number>> = {
  2: 0.0740,
  3: 0.1200,
  6: 0.1890,
  9: 0.2570,
  12: 0.3200,
};

export const CUOTAS_OPTIONS: CantidadCuotas[] = [1, 2, 3, 6, 9, 12];