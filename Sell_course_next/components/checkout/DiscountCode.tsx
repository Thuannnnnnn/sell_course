import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Check, X } from 'lucide-react';
interface DiscountCodeProps {
  onApplyDiscount: (amount: number) => void;
}
// In a real app, this would be validated against a backend
const VALID_CODES = {
  WELCOME20: 20,
  STUDENT50: 50
};
export function DiscountCode({
  onApplyDiscount
}: DiscountCodeProps) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const handleApplyCode = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const discount = VALID_CODES[code as keyof typeof VALID_CODES];
      if (discount) {
        setStatus('valid');
        setAppliedDiscount(discount);
        onApplyDiscount(discount);
      } else {
        setStatus('invalid');
        setAppliedDiscount(0);
        onApplyDiscount(0);
      }
      setIsLoading(false);
    }, 1000);
  };
  return <Card>
      <CardHeader>
        <CardTitle>Discount Code</CardTitle>
        <CardDescription>
          Enter your discount code if you have one
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <div className="flex-1">
            <Input placeholder="Enter discount code" value={code} onChange={e => setCode(e.target.value.toUpperCase())} />
          </div>
          <Button onClick={handleApplyCode} disabled={!code || isLoading}>
            Apply
          </Button>
        </div>
        {status === 'valid' && <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
            <Check className="h-4 w-4" />
            <span>Discount of {appliedDiscount}% applied!</span>
          </div>}
        {status === 'invalid' && <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
            <X className="h-4 w-4" />
            <span>Invalid discount code</span>
          </div>}
      </CardContent>
    </Card>;
}