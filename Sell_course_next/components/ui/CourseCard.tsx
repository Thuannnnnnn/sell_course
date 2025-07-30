// Updated CourseCard.tsx
import React, { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "./card";
import { Badge } from "./badge";
import { Button } from "./button";
import { WishlistButton } from "./WishlistButton";
import Image from "next/image";
import { CourseCardData } from "@/app/types/Course/Course";

interface CourseProps {
  course: CourseCardData;
  showWishlistButton?: boolean;
}

export function CourseCard({ course, showWishlistButton = true }: CourseProps) {
  const { id, title, instructor, price, image, description, level, duration } = course;
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState(image);

  const handleEnrollClick = () => {
    // Navigate to course detail page or enrollment page
    window.location.href = `/courses/${id}`;
  };

  const handleImageError = () => {
    if (!imageError) {
      setImageError(true);
      setImageSrc("/placeholder-course.jpg");
    }
  };
  
  return (
    <Card className="overflow-hidden flex flex-col justify-between hover:shadow-xl hover:scale-105 transition-all duration-300 ease-in-out relative group cursor-pointer">
      {/* Wishlist Button - positioned absolutely in top right */}
      {showWishlistButton && (
        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <WishlistButton courseId={id} size="sm" />
        </div>
      )}

      <div className="aspect-video w-full overflow-hidden bg-gray-200 flex items-center justify-center">
        {imageSrc && !imageError ? (
          <Image
            src={imageSrc}
            alt={title}
            className="object-cover w-full h-full transition-transform duration-500 ease-in-out group-hover:scale-110"
            width={318}
            height={180}
            onError={handleImageError}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-gray-300 to-gray-400 flex items-center justify-center">
            <div className="text-gray-500 text-sm">No Image</div>
          </div>
        )}
      </div>
      
      <CardHeader className="flex-grow">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-semibold text-lg line-clamp-2 flex-1" title={title}>
            {title}
          </h3>
          <Badge variant="secondary" className="shrink-0">
            {price}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">By {instructor}</p>
        
        {/* Additional course info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
          {level && (
            <span className="bg-secondary px-2 py-1 rounded-full">
              {level}
            </span>
          )}
          {duration && (
            <span>{duration} hours</span>
          )}
        </div>
        
        {/* Short description if available */}
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
            {description}
          </p>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        {/* Rating section removed */}
      </CardContent>

      <CardFooter className="pt-0">
        <Button 
          className="w-full transform transition-all duration-300 ease-in-out hover:bg-primary/90 hover:scale-105 active:scale-95" 
          onClick={handleEnrollClick}
          variant="default"
        >
          View Course
        </Button>
      </CardFooter>
    </Card>
  );
}