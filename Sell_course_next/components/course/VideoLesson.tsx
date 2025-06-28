'use client'
import React from 'react'
import { AspectRatio } from '../ui/aspect-ratio'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { ScrollArea } from '../ui/scroll-area'
interface VideoLessonProps {
  lesson: {
    title: string
    content: {
      videoUrl: string
      description: string
    }
  }
}
export function VideoLesson({ lesson }: VideoLessonProps) {
  return (
    <div>
      <AspectRatio ratio={16 / 9}>
        <div className="w-full h-full bg-muted flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-play-circle"
            >
              <circle cx="12" cy="12" r="10" />
              <polygon points="10 8 16 12 10 16 10 8" />
            </svg>
            <span>Video Player</span>
            <span className="text-sm">
              (Video would play here in a real implementation)
            </span>
          </div>
        </div>
      </AspectRatio>
      <Tabs defaultValue="notes" className="mt-4 p-4">
        <TabsList className="mb-4">
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="transcript">Transcript</TabsTrigger>
          <TabsTrigger value="discussion">Discussion</TabsTrigger>
        </TabsList>
        <TabsContent value="notes">
          <ScrollArea className="h-64">
            <div className="space-y-4">
              <h3 className="font-semibold">Lesson Summary</h3>
              <p>{lesson.content.description}</p>
              <h3 className="font-semibold">Key Points</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Understanding the basic structure of HTML documents</li>
                <li>Working with HTML elements and attributes</li>
                <li>Creating semantic HTML for better accessibility</li>
                <li>Best practices for organizing HTML code</li>
              </ul>
              <h3 className="font-semibold">Additional Notes</h3>
              <p>
                Remember to always validate your HTML using the W3C Validator to
                ensure your code meets web standards. This helps ensure your
                websites work correctly across different browsers and devices.
              </p>
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent value="transcript">
          <ScrollArea className="h-64">
            <div className="space-y-4">
              <p className="text-sm">
                <span className="text-muted-foreground">[00:00]</span> Hello and
                welcome to this lesson on HTML basics. Today we&apos;re going to be
                covering the fundamental building blocks of the web.
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">[00:15]</span> HTML
                stands for HyperText Markup Language, and it&apos;s the standard
                markup language for documents designed to be displayed in a web
                browser.
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">[00:30]</span> Let&apos;s
                start by looking at the basic structure of an HTML document.
                Every HTML document begins with a document type declaration,
                followed by the html element, which contains the head and body
                elements.
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">[00:45]</span> The head
                element contains meta information about the document, such as
                its title, character encoding, and links to stylesheets and
                scripts.
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">[01:00]</span> The body
                element contains the content of the document, which is what
                users see in their browser.
              </p>
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent value="discussion">
          <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
            <p>Join the discussion about this lesson.</p>
            <p className="text-sm">
              Ask questions and share your insights with other learners.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
