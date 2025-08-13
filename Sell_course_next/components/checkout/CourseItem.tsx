import React from "react";
import { Card, CardContent } from "../ui/card";
import { Clock } from "lucide-react";
import Image from "next/image";

interface Course {
  id: string;
  title: string;
  instructor: string;
  duration: string;
  price: number;
  image: string;
  originalPrice?: number;
}

interface CourseItemProps {
  course: Course;
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
export function CourseItem({ course }: CourseItemProps) {
  const { title, instructor, duration, price, image, originalPrice } = course;
  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="relative aspect-video w-[180px] overflow-hidden rounded-md">
            <Image
              src={image}
              alt={title}
              className="object-cover w-full h-full"
              width={80}
              height={80}
            />
          </div>
          <div className="flex-1 space-y-2">
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">by {instructor}</p>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{duration}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-semibold">{formatVND(price)}</span>
              {originalPrice && (
                <>
                  <span className="text-sm text-muted-foreground line-through">
                    {formatVND(originalPrice)}
                  </span>
                  <span className="text-sm text-green-600 font-medium">
                    {discount}% off
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
