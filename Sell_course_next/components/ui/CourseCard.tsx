import React, { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "./card";
import { Badge } from "./badge";
import { Button } from "./button";
import Image from "next/image";
import { CourseCardData } from "@/app/types/Course/Course";

interface CourseProps {
  course: CourseCardData;
}

export function CourseCard({ course }: CourseProps) {
  const { id, title, instructor, price, rating, image, description, level, duration } = course;
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

  // Check if the image URL is from an external domain that might not be configured
  const isExternalImage = imageSrc && !imageSrc.startsWith('/') && !imageSrc.startsWith('data:');
  
  return (
    <Card className="overflow-hidden flex flex-col justify-between hover:shadow-lg transition-shadow duration-300">
      <div className="aspect-video w-full overflow-hidden bg-gray-200 flex items-center justify-center">
        {isExternalImage && !imageError ? (
          <Image
            src={imageSrc}
            alt={title}
            className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
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
          <span className="text-sm ml-1">
            {rating > 0 ? rating.toFixed(1) : "New"}
          </span>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button 
          className="w-full" 
          onClick={handleEnrollClick}
          variant="default"
        >
          View Course
        </Button>
      </CardFooter>
    </Card>
  );
}