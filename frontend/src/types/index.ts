// src/types/index.ts

export interface Campaign {
  id: number;
  title: string;
  description: string;
  goal: number;
  amountRaised: number;
  currency: string;
  paymentPointer: string;
  createdAt: string;
  creatorUsername?: string;
}

export interface IlpStreamConnection {
  ilpAddress: string;
  sharedSecret: string;
}

// La respuesta que esperamos de nuestro backend al iniciar una donación
export interface DonationResponse {
  id: string;
  paymentPointer: string;
  ilpStreamConnection: IlpStreamConnection;
}
