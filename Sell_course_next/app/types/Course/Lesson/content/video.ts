import { Content } from "../Lessons";

// app/types/video.d.ts
export interface VideoState {
  videoId: string;
  title: string;
  description: string;
  url: string;
  urlScript: string;
  createdAt: string;
  contents: Content;
}



