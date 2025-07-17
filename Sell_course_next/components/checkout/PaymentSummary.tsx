import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
interface PaymentSummaryProps {
  subtotal: number;
  discount: number;
  total: number;
}
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
          <span>${subtotal.toFixed(2)}</span>
        </div>
        {discount > 0 && <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Discount</span>
            <span className="text-green-600">-${discount.toFixed(2)}</span>
          </div>}
        <div className="border-t pt-4">
          <div className="flex justify-between">
            <span className="text-lg font-semibold">Total to Pay</span>
            <span className="text-lg font-bold">${total.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>;
}