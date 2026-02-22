import { Product, Sale, User } from "./api";

export const DEMO_MODE = false;

export const demoProducts: Product[] = [
  { id: 1, name: "Base Líquida Matte", costPrice: 89.90, stock: 24 },
  { id: 2, name: "Batom Cremoso Rose", costPrice: 45.50, stock: 38 },
  { id: 3, name: "Paleta de Sombras Nude", costPrice: 129.90, stock: 12 },
  { id: 4, name: "Máscara de Cílios Volume", costPrice: 59.90, stock: 31 },
  { id: 5, name: "Pó Compacto Translúcido", costPrice: 68.00, stock: 19 },
  { id: 6, name: "Primer Facial Hidratante", costPrice: 75.00, stock: 15 },
  { id: 7, name: "Blush em Pó Pêssego", costPrice: 52.90, stock: 27 },
  { id: 8, name: "Delineador Líquido Preto", costPrice: 34.90, stock: 42 },
];

const today = new Date().toISOString();

export const demoSales: Sale[] = [
  { id: 1, client: "Maria Silva", date: today, totalValue: 265.30, status: "active" },
  { id: 2, client: "Ana Oliveira", date: today, totalValue: 129.90, status: "active" },
  { id: 3, client: "Carla Santos", date: "2026-02-21T14:00:00Z", totalValue: 180.40, status: "active" },
  { id: 4, client: "Juliana Costa", date: "2026-02-20T10:30:00Z", totalValue: 95.40, status: "canceled" },
  { id: 5, client: "Fernanda Lima", date: "2026-02-19T16:45:00Z", totalValue: 314.70, status: "active" },
];

export const demoUsers: User[] = [
  { id: 1, name: "Alice Glow", email: "alice@aliceglow.com", perfils: ["ADMIN"] },
  { id: 2, name: "Pedro Santiago", email: "pedro@aliceglow.com", perfils: ["ADMIN"] },
  { id: 3, name: "Maria Vendedora", email: "maria@aliceglow.com", perfils: [] },
];
