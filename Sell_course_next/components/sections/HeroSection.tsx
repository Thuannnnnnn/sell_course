import React from "react";
import { Button } from "../ui/button";
import { AspectRatio } from "../ui/aspect-ratio";
import Image from "next/image";
export function HeroSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-background flex items-center justify-center">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Learn Programming with Experts
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Access hundreds of quality courses, from basic to advanced.
                Start your journey today.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button size="lg" className="px-8">
                Browse Courses
              </Button>
              <Button size="lg" variant="outline" className="px-8">
                Free Trial
              </Button>
            </div>
          </div>
          <div className="mx-auto lg:mx-0 w-full max-w-[500px]">
            <AspectRatio
              ratio={16 / 9}
              className="bg-muted overflow-hidden rounded-xl"
            >
              <Image
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"
                alt="Students collaborating on a project"
                className="object-cover w-full h-full"
                width={600}
                height={280}
              />
            </AspectRatio>
          </div>
        </div>
      </div>
    </section>
  );
}
