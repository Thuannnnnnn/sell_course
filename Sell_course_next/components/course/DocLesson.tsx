'use client'
import React from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
interface TextLessonProps {
  lesson: {
    title: string;
    content: string;
  }
}
export function DocLesson({ lesson }: TextLessonProps) {
  return (
    <ScrollArea className="h-[600px]">
      <div className="p-6 prose max-w-none">
        <h2>{lesson.title}</h2>
        <p>
          HTML elements are the building blocks of HTML pages. An HTML element
          is defined by a start tag, some content, and an end tag. For example,{' '}
          <code>&lt;p&gt;This is a paragraph&lt;/p&gt;</code> defines a
          paragraph.
        </p>
        <h3>HTML Document Structure</h3>
        <p>A basic HTML document has the following structure:</p>
        <pre className="bg-muted p-4 rounded-md overflow-x-auto">
          <code>
            {`<!DOCTYPE html>
<html>
<head>
  <title>Page Title</title>
</head>
<body>
  <h1>My First Heading</h1>
  <p>My first paragraph.</p>
</body>
</html>`}
          </code>
        </pre>
        <h3>Common HTML Elements</h3>
        <ul>
          <li>
            <strong>Headings:</strong> HTML headings are defined with the{' '}
            <code>&lt;h1&gt;</code> to <code>&lt;h6&gt;</code> tags.
            <code>&lt;h1&gt;</code> defines the most important heading while{' '}
            <code>&lt;h6&gt;</code> defines the least important heading.
          </li>
          <li>
            <strong>Paragraphs:</strong> HTML paragraphs are defined with the{' '}
            <code>&lt;p&gt;</code> tag.
          </li>
          <li>
            <strong>Links:</strong> HTML links are defined with the{' '}
            <code>&lt;a&gt;</code> tag. The link's destination is specified in
            the <code>href</code> attribute.
          </li>
          <li>
            <strong>Images:</strong> HTML images are defined with the{' '}
            <code>&lt;img&gt;</code> tag. The source file (<code>src</code>),
            alternative text (<code>alt</code>), <code>width</code>, and{' '}
            <code>height</code> are provided as attributes.
          </li>
          <li>
            <strong>Lists:</strong> HTML lists are defined with the{' '}
            <code>&lt;ul&gt;</code> (unordered/bullet list) or{' '}
            <code>&lt;ol&gt;</code> (ordered/numbered list) tag, followed by{' '}
            <code>&lt;li&gt;</code> tags (list items).
          </li>
        </ul>
        <h3>Semantic HTML Elements</h3>
        <p>
          Semantic HTML elements clearly describe their meaning to both the
          browser and the developer. Examples of semantic elements:
        </p>
        <ul>
          <li>
            <code>&lt;article&gt;</code> - Defines independent, self-contained
            content
          </li>
          <li>
            <code>&lt;aside&gt;</code> - Defines content aside from the page
            content
          </li>
          <li>
            <code>&lt;details&gt;</code> - Defines additional details that the
            user can view or hide
          </li>
          <li>
            <code>&lt;figcaption&gt;</code> - Defines a caption for a
            &lt;figure&gt; element
          </li>
          <li>
            <code>&lt;figure&gt;</code> - Specifies self-contained content, like
            illustrations, diagrams, photos, code listings, etc.
          </li>
          <li>
            <code>&lt;footer&gt;</code> - Defines a footer for a document or
            section
          </li>
          <li>
            <code>&lt;header&gt;</code> - Specifies a header for a document or
            section
          </li>
          <li>
            <code>&lt;main&gt;</code> - Specifies the main content of a document
          </li>
          <li>
            <code>&lt;nav&gt;</code> - Defines navigation links
          </li>
          <li>
            <code>&lt;section&gt;</code> - Defines a section in a document
          </li>
        </ul>
        <h3>HTML Attributes</h3>
        <p>
          HTML attributes provide additional information about HTML elements:
        </p>
        <ul>
          <li>
            The <code>href</code> attribute of <code>&lt;a&gt;</code> specifies
            the URL of the page the link goes to
          </li>
          <li>
            The <code>src</code> attribute of <code>&lt;img&gt;</code> specifies
            the path to the image to be displayed
          </li>
          <li>
            The <code>width</code> and <code>height</code> attributes of{' '}
            <code>&lt;img&gt;</code> provide size information for images
          </li>
          <li>
            The <code>alt</code> attribute of <code>&lt;img&gt;</code> provides
            an alternate text for an image
          </li>
          <li>
            The <code>style</code> attribute is used to add styles to an
            element, such as color, font, size, and more
          </li>
          <li>
            The <code>lang</code> attribute of the <code>&lt;html&gt;</code> tag
            declares the language of the Web page
          </li>
          <li>
            The <code>title</code> attribute defines some extra information
            about an element
          </li>
        </ul>
        <p>
          Understanding these fundamental HTML elements and attributes is
          essential for creating well-structured web pages.
        </p>
      </div>
    </ScrollArea>
  )
}
