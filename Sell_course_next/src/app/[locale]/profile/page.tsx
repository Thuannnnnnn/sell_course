"use client";
import React, { useEffect, useState } from "react";
import { useSession, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "react-bootstrap/Image";

// Define the type for the user
interface User {
  name?: string;
  email?: string;
  avatarImg?: string;
}

const ProfilePage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [user, setUser] = useState<User | undefined>(session?.user);

  // Update the session in case of changes
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  // Fetch updated session if user details are updated
  const updateSession = async () => {
    const updatedSession = await getSession();
    setUser(updatedSession?.user);
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Welcome to the Dashboard</h1>
      <pre>{JSON.stringify(session, null, 2)}</pre>

      {user ? (
        <>
          <span className="nav-link m-4">Name: {user?.name}</span>
          <span className="nav-link m-4">Email: {user?.email}</span>
          {user?.avatarImg && (
            <Image
              src={user?.avatarImg}
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
