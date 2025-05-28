import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "./card";
import { Button } from "./button";
import Image from "next/image";
interface BlogPostProps {
  post: {
    id: number;
    title: string;
    date: string;
    preview: string;
    image: string;
  };
}
export function BlogCard({ post }: BlogPostProps) {
  const { title, date, preview, image } = post;
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="aspect-video w-full overflow-hidden">
        <Image
          src={image}
          alt={title}
          width={600}
          height={280}
          priority
          className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
        />
      </div>
      <CardHeader>
        <div className="space-y-1">
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-sm text-muted-foreground">{date}</p>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-muted-foreground">{preview}</p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          Read More
        </Button>
      </CardFooter>
    </Card>
  );
}
