import { Carrito } from "../models/Carrito.js";
import { Categoria } from "../models/Categoria.js";
import { Cliente } from "../models/Cliente.js";
import { Pedido } from "../models/Pedido.js";
import { Producto } from "../models/Producto.js";

export interface CatalogoEntry {
  producto: Producto;
  categoria: Categoria;
  imagenUrl: string;
  imagenAlt: string;
  etiqueta: string;
  imagenMeta: CatalogImageMeta;
}

export interface CatalogImageMeta {
  sourceName: string;
  sourcePageUrl: string;
  creatorName: string;
  creatorUrl?: string | null;
  licenseLabel: string;
  width: number;
  height: number;
  verifiedRealPhoto: boolean;
  verifiedHd: boolean;
}

export interface CatalogoViewState {
  entries: CatalogoEntry[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  selectedProductId: string | null;
}

export interface ProductoDetalleState {
  entry: CatalogoEntry | null;
  selectedVariantId: string | null;
  canAddToCart: boolean;
  stockMessage: string;
  maxQuantity: number;
}

export interface CarritoViewState {
  carrito: Carrito;
  usuarioActual: Cliente | null;
}

export interface AuthViewState {
  usuarioActual: Cliente | null;
  sesionExpiracion: Date | null;
  historial: Pedido[];
  credencialesDemo: {
    email: string;
    password: string;
  };
}

export interface RegistroInput {
  nombre: string;
  email: string;
  password: string;
  fechaNacimiento: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface PasswordRecoveryInput {
  email: string;
}

export interface PasswordResetInput {
  password: string;
  confirmPassword: string;
}

export type NotificationType = "success" | "error" | "info";

export type RouteName = "catalogo" | "detalle" | "login" | "reset";
export type AuthMode = "login" | "register" | "recover";

export interface AppRoute {
  name: RouteName;
  productId?: string;
  token?: string;
}

export interface NavbarState {
  searchQuery: string;
  cartCount: number;
  currentRoute: RouteName;
  usuarioActual: Cliente | null;
}

export interface CatalogPageState {
  entries: CatalogoEntry[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  searchQuery: string;
  categories: CategoryFilterOption[];
  selectedCategoryId: string | null;
}

export interface ProductPageState {
  entry: CatalogoEntry;
  selectedVariantId: string | null;
  canAddToCart: boolean;
  buttonLabel: string;
  stockLabel: string;
  maxQuantity: number;
}

export interface AuthPageState {
  mode: AuthMode;
  usuarioActual: Cliente | null;
  historial: Pedido[];
  recoveryInbox: RecoveryInboxItem[];
}

export interface PasswordResetPageState {
  email: string | null;
  expiresAt: Date | null;
  status: "valid" | "expired" | "used" | "missing";
}

export interface CategoryFilterOption {
  id: string;
  nombre: string;
  cantidadProductos: number;
}

export interface RecoveryInboxItem {
  id: string;
  email: string;
  expiresAt: Date;
  resetPath: string;
  status: "pending" | "expired" | "used";
}

export interface CartDrawerState {
  isOpen: boolean;
  carrito: Carrito;
  usuarioActual: Cliente | null;
}

export interface SessionModalState {
  isOpen: boolean;
}

export interface CartChangedDetail {
  total: number;
  totalItems: number;
}

export const CART_CHANGED_EVENT = "cart:changed";
