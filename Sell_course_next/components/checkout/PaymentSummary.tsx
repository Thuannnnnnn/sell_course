import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface PaymentSummaryProps {
  subtotal: number;
  discount: number;
  total: number;
}

// Helper function to format VND currency
const formatVND = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};
export function PaymentSummary({
  subtotal,
  discount,
  total
}: PaymentSummaryProps) {
  return <Card>
      <CardHeader>
        <CardTitle>Payment Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatVND(subtotal)}</span>
        </div>
        {discount > 0 && <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Discount</span>
            <span className="text-green-600">-{formatVND(discount)}</span>
          </div>}
        <div className="border-t pt-4">
          <div className="flex justify-between">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-lg font-bold">{formatVND(total)}</span>
          </div>
        </div>
      </CardContent>
    </Card>;
}