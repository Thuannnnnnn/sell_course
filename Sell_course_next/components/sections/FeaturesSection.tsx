import React from "react";
import { FeatureCard } from "../ui/FeatureCard";
const FEATURES = [
  {
    id: 1,
    title: "Learn Anytime",
    description:
      "Access your courses 24/7, learn at your own pace from anywhere in the world.",
    icon: "clock",
  },
  {
    id: 2,
    title: "Regular Updates",
    description:
      "Course materials are updated regularly to keep up with the latest industry trends.",
    icon: "refresh-cw",
  },
  {
    id: 3,
    title: "1-on-1 Support",
    description:
      "Get personalized help from expert instructors whenever you need it.",
    icon: "message-circle",
  },
];
export function FeaturesSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 flex items-center justify-center">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Why Choose Us
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              We provide the best learning experience with these key features
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
