import React from 'react';
import { Card, CardContent, CardHeader, CardFooter } from './card';
import { Avatar, AvatarImage, AvatarFallback } from './avatar';
interface TestimonialProps {
  testimonial: {
    id: number;
    name: string;
    text: string;
    avatar: string;
    rating: number;
  };
}
export function TestimonialCard({
  testimonial
}: TestimonialProps) {
  const {
    name,
    text,
    avatar,
    rating
  } = testimonial;
  // Get initials for avatar fallback
  const initials = name.split(' ').map(n => n[0]).join('');
  return <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar>
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold">{name}</h3>
          <div className="flex">
            {[...Array(5)].map((_, i) => <svg key={i} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={i < rating ? 'gold' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="italic">&ldquo;{text}&rdquo;</p>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        Verified Student
      </CardFooter>
    </Card>;
}