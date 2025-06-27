import React from "react";
import { Card, CardContent } from "../ui/card";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { VideoLesson } from "./VideoLesson";
import { DocLesson } from "./DocLesson";
import { QuizComponent } from "./QuizComponent";

// Updated interface to match CourseLearnPage usage
interface LessonContentProps {
  Lesson: {
    lessonId: string;
    lessonName: string;
    order: number;
    courseId: string;
    createdAt: Date;
    updatedAt: Date;
    contents?: Content[];
  };
  content: {
    contentId: string;
    contentName: string;
    contentType: string;
    order: number;
    lessonId: string;
    createdAt: Date;
    updatedAt: Date;
  };
  getContentDuration: (content: Content) => string;
}

interface Content {
  contentId: string;
  contentName: string;
  contentType: string;
  order: number;
  lessonId: string;
  createdAt: Date;
  updatedAt: Date;
}

export function LessonContent({
  content,
  getContentDuration,
}: LessonContentProps) {
  const renderLessonContent = () => {
    switch (content.contentType) {
      case "video":
        return (
          <VideoLesson
            lesson={{
              title: content.contentName,
              content: {
                videoUrl: "",
                description: "",
              },
            }}
          />
        );
      case "text":
        return (
          <DocLesson
            lesson={{
              title: content.contentName,
              content: "",
            }}
          />
        );
      case "quiz":
        return (
          <QuizComponent
            lesson={{
              id: content.contentId,
              title: content.contentName,
              quiz: {
                id: content.contentId,
                questions: [],
              },
            }}
          />
        );
      default:
        return <div>Unsupported lesson type</div>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{content.contentName}</h1>
        <p className="text-muted-foreground">{getContentDuration(content)}</p>
      </div>

      <Card>
        <CardContent className="p-0">{renderLessonContent()}</CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Additional Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4 flex items-center gap-3 cursor-pointer hover:bg-accent/50 transition-colors">
            <div className="bg-primary/10 text-primary p-2 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-file-text"
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <line x1="10" y1="9" x2="8" y2="9" />
              </svg>
            </div>
            <div>
              <div className="font-medium">Lesson Slides</div>
              <div className="text-sm text-muted-foreground">PDF, 2.3MB</div>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-3 cursor-pointer hover:bg-accent/50 transition-colors">
            <div className="bg-primary/10 text-primary p-2 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-code-2"
              >
                <polyline points="18 8 22 12 18 16" />
                <polyline points="6 8 2 12 6 16" />
                <line x1="2" y1="12" x2="22" y2="12" />
              </svg>
            </div>
            <div>
              <div className="font-medium">Code Examples</div>
              <div className="text-sm text-muted-foreground">ZIP, 1.1MB</div>
            </div>
          </Card>
        </div>
      </div>

      <Separator />

      <div className="flex justify-between">
        <Button variant="outline" className="flex items-center gap-2">
          <ChevronLeft className="h-4 w-4" />
          Previous Lesson
        </Button>
        <Button className="flex items-center gap-2">
          Next Lesson
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
