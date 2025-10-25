
export type CantidadCuotas = 1 | 2 | 3 | 6 | 9 | 12;

export const CANALES_DE_VENTA_NORMAL = ['Link de pago', 'POS pro', 'POS mini', 'Tienda nube', 'API', 'Otras'] as const;
export const CANAL_EMPRETIENDA = 'Empretienda' as const;
export const CANAL_QR = 'QR' as const;

export type CanalDeVentaNormal = typeof CANALES_DE_VENTA_NORMAL[number];
export type CanalDeVenta = CanalDeVentaNormal | typeof CANAL_EMPRETIENDA | typeof CANAL_QR;

export interface ResultadoCalculo {
  montoOriginal: number;
  cantidadCuotas: CantidadCuotas;
  canalDeVenta: CanalDeVenta;
  pctComisionCobradaSinIva: number;
  pctComisionCobradaConIva: number;
  arancel: number;
  ivaArancel: number;
  cftMonto: number;
  ivaCft: number;
  comisionTotalCobrada: number;
  montoTotalAAcreditar: number;
  aplicaCft: boolean;
}
