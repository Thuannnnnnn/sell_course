import React from "react";
import { TestimonialCard } from "../ui/TestimonialCard";
const TESTIMONIALS = [
  {
    id: 1,
    name: "Alex Thompson",
    text: "The courses are well-structured and easy to follow. I went from zero coding knowledge to building my own website in just 8 weeks!",
    avatar: "https://i.pravatar.cc/150?img=11",
    rating: 5,
  },
  {
    id: 2,
    name: "Priya Sharma",
    text: "The instructors are incredibly knowledgeable and responsive. Whenever I had a question, I received help within hours.",
    avatar: "https://i.pravatar.cc/150?img=26",
    rating: 5,
  },
  {
    id: 3,
    name: "Marcus Johnson",
    text: "I've tried several online learning platforms, and this is by far the best. The project-based approach really helped me apply what I learned.",
    avatar: "https://i.pravatar.cc/150?img=59",
    rating: 4,
  },
];
export function TestimonialsSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50 flex items-center justify-center">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Student Testimonials
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              See what our students have to say about their learning experience
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {TESTIMONIALS.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}
