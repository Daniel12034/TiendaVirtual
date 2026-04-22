export type UUID = string;
export type Decimal = number;
export type Integer = number;
export type DateTime = Date;

export interface VarianteProductoSnapshot {
  id: UUID;
  nombre: string;
  valor: string;
  stock: Integer;
}

export interface ProductoSnapshot {
  id: UUID;
  nombre: string;
  descripcion: string;
  precio: Decimal;
  estado: boolean;
  stock: Integer;
  variantes: VarianteProductoSnapshot[];
}

export interface ItemCarritoSnapshot {
  id: UUID;
  cantidad: Integer;
  precioUnitario: Decimal;
  producto: ProductoSnapshot;
  variante?: VarianteProductoSnapshot;
}

export interface CarritoSnapshot {
  id: UUID;
  fechaCreacion: string;
  items: ItemCarritoSnapshot[];
  total: Decimal;
}

export interface DetallePedidoSnapshot {
  cantidad: Integer;
  precioUnitario: Decimal;
  productoNombre: string;
  varianteSeleccionada?: string;
}

export interface PedidoSnapshot {
  id: UUID;
  fecha: string;
  total: Decimal;
  detalles: DetallePedidoSnapshot[];
}

export interface SesionSnapshot {
  id: UUID;
  token: string;
  fechaInicio: string;
  fechaExpiracion: string;
  activa: boolean;
}

export interface UsuarioSnapshot {
  id: UUID;
  nombre: string;
  email: string;
  password: string;
  fechaNacimiento: string;
  estado: boolean;
  sesionActiva: SesionSnapshot | null;
}

export interface ClienteSnapshot extends UsuarioSnapshot {
  historialPedidos: PedidoSnapshot[];
}

export interface PasswordRecoveryRequestSnapshot {
  id: UUID;
  email: string;
  token: string;
  createdAt: string;
  expiresAt: string;
  consumedAt: string | null;
}
