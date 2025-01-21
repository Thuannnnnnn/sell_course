"use client";
import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "react-bootstrap/Image";
import { useOAuth } from "@/contexts/OAuthContext";
const ProfilePage: React.FC = () => {
  const { data: session, status } = useSession();
  const { data, error, isLoading } = useOAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div>
        <h1>Welcome to the Dashboard</h1>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
      {session ? (
        <>
          <span className="nav-link m-4">Name, {session.user?.name}</span>
          <span className="nav-link m-4">Email, {session.user?.email}</span>
          {session.user?.image && (
            <Image
              src={session.user.image}
              alt="User profile picture"
              width={100}
              height={100}
              className="rounded ms-4"
            />
          )}
        </>
      ) : null}
    </div>
  );
};

export default ProfilePage;
