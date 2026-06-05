export type UserRole = "PRODUCTEUR" | "ACHETEUR" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  department?: string;
  commune?: string;
  avatar?: string;
  createdAt: unknown;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  unit: string;
  quantity: number;
  category: string;
  department: string;
  commune: string;
  images: string[];
  available: boolean;
  sellerId: string;
  sellerName: string;
  sellerPhone?: string;
  createdAt: unknown;
}

export interface Order {
  id: string;
  productId: string;
  productTitle: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  quantity: number;
  totalPrice: number;
  status: "EN_ATTENTE" | "CONFIRME" | "EN_LIVRAISON" | "LIVRE" | "ANNULE";
  createdAt: unknown;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: unknown;
}