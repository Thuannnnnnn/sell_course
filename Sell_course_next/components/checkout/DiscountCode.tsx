import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Check, X, AlertCircle } from 'lucide-react';
import { validatePromotionCode, PromotionValidationResponse } from '../../lib/api/promotion';

interface DiscountCodeProps {
  onApplyDiscount: (amount: number) => void;
  courseId?: string;
}

export function DiscountCode({
  onApplyDiscount,
  courseId
}: DiscountCodeProps) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'valid' | 'invalid' | 'expired' | 'pending'>('idle');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [promotionInfo, setPromotionInfo] = useState<PromotionValidationResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleApplyCode = async () => {
    if (!code.trim()) return;
    
    setIsLoading(true);
    setStatus('idle');
    setErrorMessage('');
    
    try {
      const promotion = await validatePromotionCode(code.trim().toUpperCase(), courseId);
      
      setPromotionInfo(promotion);
      setAppliedDiscount(promotion.discount);
      setStatus('valid');
      onApplyDiscount(promotion.discount);
    } catch (error: unknown) {
      setStatus('invalid');
      setAppliedDiscount(0);
      setPromotionInfo(null);
      onApplyDiscount(0);
      
      // Handle specific error cases
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('expired')) {
        setStatus('expired');
        setErrorMessage('This promotion code has expired');
      } else if (errorMessage.includes('not active yet')) {
        setStatus('pending');
        setErrorMessage('This promotion code is not active yet');
      } else if (errorMessage.includes('not valid for this course')) {
        setErrorMessage('This promotion code is not valid for this course');
      } else {
        setErrorMessage(errorMessage || 'Invalid promotion code');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCode = () => {
    setCode('');
    setStatus('idle');
    setAppliedDiscount(0);
    setPromotionInfo(null);
    setErrorMessage('');
    onApplyDiscount(0);
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
            <Input 
              placeholder="Enter discount code" 
              value={code} 
              onChange={e => setCode(e.target.value.toUpperCase())}
              disabled={status === 'valid'}
            />
          </div>
          {status === 'valid' ? (
            <Button 
              variant="outline" 
              onClick={handleRemoveCode}
              className="text-red-600 hover:text-red-700"
            >
              Remove
            </Button>
          ) : (
            <Button onClick={handleApplyCode} disabled={!code || isLoading}>
              {isLoading ? 'Applying...' : 'Apply'}
            </Button>
          )}
        </div>
        {status === 'valid' && promotionInfo && (
          <div className="mt-2 space-y-2">
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Check className="h-4 w-4" />
              <span>Discount of {appliedDiscount}% applied!</span>
            </div>
            <div className="text-xs text-gray-600 bg-green-50 p-2 rounded">
              <div><strong>Promotion:</strong> {promotionInfo.name}</div>
              {promotionInfo.course && (
                <div><strong>Valid for:</strong> {promotionInfo.course.title}</div>
              )}
            </div>
          </div>
        )}
        {status === 'invalid' && (
          <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
            <X className="h-4 w-4" />
            <span>{errorMessage || 'Invalid discount code'}</span>
          </div>
        )}
        {status === 'expired' && (
          <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span>{errorMessage || 'This promotion code has expired'}</span>
          </div>
        )}
        {status === 'pending' && (
          <div className="flex items-center gap-2 mt-2 text-sm text-yellow-600">
            <AlertCircle className="h-4 w-4" />
            <span>{errorMessage || 'This promotion code is not active yet'}</span>
          </div>
        )}
      </CardContent>
    </Card>;
}