export interface PaymentResponse {
  accountName: string;
  accountNumber: string;
  amount: number;
  bin: string;
  checkoutUrl: string;
  currency: string;
  description: string;
  orderCode: number;
  paymentLinkId: string;
  qrCode: string;
  status: 'PENDING' | 'PAID' | 'FAILED'; // Giới hạn các trạng thái có thể có
}
