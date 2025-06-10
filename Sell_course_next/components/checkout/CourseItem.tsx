import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Clock } from 'lucide-react';
interface Course {
  id: number;
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
export function CourseItem({
  course
}: CourseItemProps) {
  const {
    title,
    instructor,
    duration,
    price,
    image,
    originalPrice
  } = course;
  const discount = originalPrice ? Math.round((originalPrice - price) / originalPrice * 100) : 0;
  return <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="relative aspect-video w-[180px] overflow-hidden rounded-md">
            <img src={image} alt={title} className="object-cover w-full h-full" />
          </div>
          <div className="flex-1 space-y-2">
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">by {instructor}</p>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{duration}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-semibold">${price.toFixed(2)}</span>
              {originalPrice && <>
                  <span className="text-sm text-muted-foreground line-through">
                    ${originalPrice.toFixed(2)}
                  </span>
                  <span className="text-sm text-green-600 font-medium">
                    {discount}% off
                  </span>
                </>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>;
}