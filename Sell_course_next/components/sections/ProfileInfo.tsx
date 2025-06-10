import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  BookmarkIcon,
  Clock,
  PencilIcon,
  KeyIcon,
  BadgeCheck,
  BookOpen,
  Trophy,
  Loader2,
} from "lucide-react";
import { getUserProfile } from "@/app/api/profile/profile";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { EditProfileModal } from "./EditProfileModal";
import { UserProfile } from "@/app/types/profile/editProfile";

export function ProfileInfo() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);

  const coverImage =
    "https://images.unsplash.com/photo-1614850715649-1d0106293bd1?q=80&w=1470&auto=format&fit=crop";

  const coursesEnrolled = 0;
  const wishlistedCourses = 0;
  const completedCourses = 0;

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (sessionStatus === "loading") {
        return;
      }

      if (sessionStatus === "unauthenticated") {
        setLoading(false);
        return;
      }

      if (session?.accessToken) {
        try {
          setLoading(true);
          console.log("Token exists:", !!session.accessToken);
          console.log(
            "Token starts with:",
            session.accessToken.substring(0, 15) + "..."
          );

          const profile = await getUserProfile(session.accessToken);
          setUserProfile(profile);
        } catch (err) {
          console.error("Failed to fetch user profile:", err);
          console.error("Error details:", err);
          setError("Failed to load user profile");
        } finally {
          setLoading(false);
        }
      } else {
        console.log(
          "Session authenticated but no access token in session:",
          session
        );
        setError("No authentication token found");
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [session, sessionStatus]);

  if (sessionStatus === "loading" || loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (sessionStatus === "unauthenticated") {
    return (
      <div className="p-6 text-center">
        <p>Please sign in to view your profile</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push("/auth/login")}
        >
          Sign In
        </Button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-destructive">{error}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (!userProfile && sessionStatus === "authenticated") {
    return (
      <div className="p-6 text-center">
        <p className="text-destructive">Unable to load user profile</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  const joinDate = userProfile?.createdAt
    ? new Intl.DateTimeFormat("en-US", {
        month: "long",
        year: "numeric",
      }).format(new Date(userProfile?.createdAt))
    : "N/A";

  return (
    <div className="space-y-6">
      <div className="relative h-48 w-full overflow-hidden rounded-xl">
        <img
          src={coverImage}
          alt="Profile Cover"
          className="w-full h-full object-cover"
        />
      </div>
      <Card className="relative mt-[-4rem]">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex flex-col items-center md:items-start gap-4">
              <Avatar className="h-32 w-32 border-4 border-background">
                <AvatarImage
                  src={userProfile?.avatarImg || undefined}
                  alt={userProfile?.username}
                />
                <AvatarFallback>
                  {userProfile?.username
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="text-center md:text-left space-y-2">
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold">
                    {userProfile?.username}
                  </h3>
                  <p className="text-muted-foreground font-medium">
                    {userProfile?.role}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {userProfile?.email}
                </p>
                {userProfile?.createdAt && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Member since {joinDate}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEditModal(true)}
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/auth/change-password")}
                >
                  <KeyIcon className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
              </div>

              {showEditModal && userProfile && (
                <EditProfileModal
                  open={showEditModal}
                  onClose={() => setShowEditModal(false)}
                  user={userProfile}
                  token={session?.accessToken || ""}
                  onProfileUpdated={(updatedProfile) =>
                    setUserProfile(updatedProfile)
                  }
                />
              )}
            </div>
            <div className="flex-1 grid gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <BookOpen className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-3xl font-bold">{coursesEnrolled}</p>
                        <p className="text-sm text-muted-foreground">
                          Enrolled
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <Trophy className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-3xl font-bold">{completedCourses}</p>
                        <p className="text-sm text-muted-foreground">
                          Completed
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <BookmarkIcon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-3xl font-bold">
                          {wishlistedCourses}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Wishlisted
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold">User Information</h4>
                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="h-5 w-5 text-primary" />
                    <span>Gender:</span>
                    <span className="text-sm text-muted-foreground ml-auto">
                      {userProfile?.gender || "Not specified"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="h-5 w-5 text-primary" />
                    <span>Birthday:</span>
                    <span className="text-sm text-muted-foreground ml-auto">
                      {userProfile?.birthDay || "Not specified"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="h-5 w-5 text-primary" />
                    <span>Phone:</span>
                    <span className="text-sm text-muted-foreground ml-auto">
                      {userProfile?.phoneNumber
                        ? userProfile?.phoneNumber.toString()
                        : "Not specified"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
