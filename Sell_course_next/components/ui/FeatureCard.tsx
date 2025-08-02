import React from 'react';
import { Card, CardContent, CardHeader } from './card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';
import { Clock, RefreshCw, MessageCircle } from 'lucide-react';
interface FeatureProps {
  feature: {
    id: number;
    title: string;
    description: string;
    icon: string;
  };
}
export function FeatureCard({
  feature
}: FeatureProps) {
  const {
    title,
    description,
    icon
  } = feature;
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'clock':
        return <Clock className="h-10 w-10" />;
      case 'refresh-cw':
        return <RefreshCw className="h-10 w-10" />;
      case 'message-circle':
        return <MessageCircle className="h-10 w-10" />;
      default:
        return <Clock className="h-10 w-10" />;
    }
  };
  return <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card className="text-center transition-all duration-300 hover:shadow-xl hover:scale-105 hover:-translate-y-2 group cursor-pointer">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:scale-110">
                  {getIcon(icon)}
                </div>
              </div>
              <h3 className="text-xl font-bold transition-colors duration-300 group-hover:text-primary">{title}</h3>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground transition-colors duration-300 group-hover:text-foreground">{description}</p>
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent>
          <p>Learn more about {title}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>;
}