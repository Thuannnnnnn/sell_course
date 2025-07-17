// Document API Response Types
export interface DocumentResponse {
  docsId: string;
  title: string;
  url: string;
  createdAt: string;
  contentId?: string;
  contentName?: string;
  contentType?: string;
  fileType?: string;
  fileSize?: number;
  description?: string;
  documentUrl?: string;
}

// Document Data for internal use
export interface DocumentData {
  contentId: string;
  contentName: string;
  contentType: string;
  url: string;
  documentUrl?: string;
  fileType?: string;
  fileSize?: number;
  description?: string;
}

// Document Props for components
export interface DocLessonProps {
  lesson: {
    id: string
    title: string;
    content: string;
    contentType?: string;
  };
  documentData?: DocumentResponse | null;
}
