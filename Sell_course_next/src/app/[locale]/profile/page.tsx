"use client";
import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "react-bootstrap/Image";
import WithRoleProtection from "@/components/withRoleProtection";

const ProfilePage: React.FC = () => {
  const { data: session, status } = useSession();
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
    <WithRoleProtection allowedRole="CUSTOMER">
      <div>
        <h1>Welcome to the Dashboard</h1>
        {session ? (
          <>
            <div>
              <p>Name: {session.user?.name}</p>
              <p>Email: {session.user?.email}</p>
              <p>Token: {session.user?.token}</p> {/* Custom token */}
              <p>ID: {session.user?.id}</p> {/* Custom user ID */}
              <p>Role: {session.user?.role}</p> {/* Custom role */}
            </div>

            {/* Display profile image if available */}
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
        ) : (
          <div>No user session found.</div>
        )}
      </div>
    </WithRoleProtection>
  );
};

export default ProfilePage;
