import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "./card";
import { Badge } from "./badge";
import { Button } from "./button";
import Image from "next/image";
interface CourseProps {
  course: {
    id: number;
    title: string;
    instructor: string;
    price: string;
    rating: number;
    image: string;
  };
}
export function CourseCard({ course }: CourseProps) {
  const { title, instructor, price, rating, image } = course;
  return (
    <Card className="overflow-hidden flex flex-col justify-around">
      <div className="aspect-video w-full overflow-hidden">
        <Image
          src={image}
          alt={title}
          className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
          width={318}
          height={180}
        />
      </div>
      <CardHeader>
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg">{title}</h3>
          <Badge>{price}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">By {instructor}</p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill={i < Math.floor(rating) ? "gold" : "none"}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-yellow-500"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          ))}
          <span className="text-sm ml-1">{rating.toFixed(1)}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Enroll Now</Button>
      </CardFooter>
    </Card>
  );
}
