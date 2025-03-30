"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { getMeetingDetails } from "@/app/api/meeting/meeting";
import { MeetingDetails } from "@/app/type/meeting/Meeting";

export default function MeetingPage() {
  const { status } = useSession();
  const params = useParams();
  const meetingId = params.meetingId as string;
  const [meetingDetails, setMeetingDetails] = useState<MeetingDetails | null>(
    null
  );
  const [error] = useState<string | null>(null);

  const fetchMeetingDetails = useCallback(async () => {
    try {
      const response = await getMeetingDetails(meetingId);
      setMeetingDetails(response.data);
    } catch {
      console.log("error")
    }
  }, [meetingId]);

  useEffect(() => {
    if (meetingId) {
      fetchMeetingDetails();
    }
  }, [meetingId, fetchMeetingDetails]);

  if (status === "loading") {
    return <div className="text-center py-5">Loading...</div>;
  }

  if (status === "unauthenticated") {
    return <div className="text-center py-5">Please login to continue</div>;
  }

  return (
    <div className="meeting-container">
      {error && <div className="alert alert-danger">{error}</div>}
      {meetingDetails && (
        <div className="meeting-details">
          <h1>{meetingDetails.title}</h1>
          <p>{meetingDetails.description}</p>
        </div>
      )}
    </div>
  );
}
