"use client";

import { useParams } from "next/navigation";
import CodeMeetingRoom from "@/components/CodeMeeting/CodeMeetingRoom";

export default function RoomPage() {
  const params = useParams();
  const roomId = params.roomId as string;

  return <CodeMeetingRoom roomId={roomId} />;
}
