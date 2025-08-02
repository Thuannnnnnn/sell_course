import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  BookmarkIcon,
  Clock,
  PencilIcon,
  KeyIcon,
  BookOpen,
  Trophy,
  Loader2,
  Mail,
  Shield,
  ChevronRight,
  User,
  Phone,
  Calendar,
} from "lucide-react";
import { getUserProfile } from "@/app/api/profile/profile";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { EditProfileModal } from "./EditProfileModal";
import { UserProfile } from "@/app/types/profile/editProfile";
import Image from "next/image";

export function ProfileInfo() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  const [selectedWeekNumber, setSelectedWeekNumber] = useState<number | null>(
    null
  );
  const [calendarMode, setCalendarMode] = useState<"single" | "week">("single");
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistResponseDto[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const coverImage =
    "https://images.unsplash.com/photo-1614850715649-1d0106293bd1?q=80&w=1470&auto=format&fit=crop";

  // Calculate stats from loaded data
  const coursesEnrolled = enrollments.length;
  const wishlistedCourses = wishlistItems.length;
  const completedCourses = enrollments.filter(enrollment => 
    enrollment.status.toLowerCase() === 'completed' || 
    enrollment.status.toLowerCase() === 'paid'
  ).length;
  const token = session?.accessToken;

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
    <div className="space-y-8">
      {/* Cover Image với Gradient Overlay */}
      <div className="relative h-64 overflow-hidden rounded-2xl shadow-2xl">
        <Image
          src={coverImage}
          alt="Profile Cover"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-6 left-6 text-white">
          <h1 className="text-3xl font-bold mb-2">My Profile</h1>
          <p className="text-lg opacity-90">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      {/* Main Profile Card */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-1">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
            <CardContent className="p-8">
              <div className="flex flex-col items-center text-center space-y-6">
                {/* Avatar */}
                <div className="relative">
                  <Avatar className="h-32 w-32 border-4 border-white shadow-2xl ring-4 ring-blue-500/20">
                    <AvatarImage
                      src={userProfile?.avatarImg || undefined}
                      alt={userProfile?.username}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {userProfile?.username
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2">
                    <div className="w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>

                {/* User Info */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-gray-800">
                      {userProfile?.username}
                    </h2>
                    <div className="flex items-center justify-center gap-2">
                      <Shield className="h-4 w-4 text-blue-500" />
                      <span className="text-blue-600 font-medium text-sm bg-blue-50 px-3 py-1 rounded-full">
                        {userProfile?.role}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">{userProfile?.email}</span>
                  </div>

                  {userProfile?.createdAt && (
                    <div className="flex items-center justify-center gap-2 text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">Member since {joinDate}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 w-full">
                  <Button
                    onClick={() => setShowEditModal(true)}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/auth/change-password")}
                    className="w-full border-gray-300 hover:bg-gray-50 transition-all duration-300"
                  >
                    <KeyIcon className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Stats & Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-2xl transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    {statsLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
                        <span className="text-blue-600">Loading...</span>
                      </div>
                    ) : (
                      <>
                        <p className="text-3xl font-bold text-blue-700 group-hover:scale-110 transition-transform duration-300">
                          {coursesEnrolled}
                        </p>
                        <p className="text-sm font-medium text-blue-600 mt-1">
                          Courses Enrolled
                        </p>
                      </>
                    )}
                  </div>
                  <div className="p-3 bg-blue-500 rounded-full group-hover:rotate-12 transition-transform duration-300">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-green-100 hover:shadow-2xl transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    {statsLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-6 w-6 text-green-500 animate-spin" />
                        <span className="text-green-600">Loading...</span>
                      </div>
                    ) : (
                      <>
                        <p className="text-3xl font-bold text-green-700 group-hover:scale-110 transition-transform duration-300">
                          {completedCourses}
                        </p>
                        <p className="text-sm font-medium text-green-600 mt-1">
                          Completed
                        </p>
                      </>
                    )}
                  </div>
                  <div className="p-3 bg-green-500 rounded-full group-hover:rotate-12 transition-transform duration-300">
                    <Trophy className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-2xl transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    {statsLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-6 w-6 text-purple-500 animate-spin" />
                        <span className="text-purple-600">Loading...</span>
                      </div>
                    ) : (
                      <>
                        <p className="text-3xl font-bold text-purple-700 group-hover:scale-110 transition-transform duration-300">
                          {wishlistedCourses}
                        </p>
                        <p className="text-sm font-medium text-purple-600 mt-1">
                          Wishlisted
                        </p>
                      </>
                    )}
                  </div>
                  <div className="p-3 bg-purple-500 rounded-full group-hover:rotate-12 transition-transform duration-300">
                    <BookmarkIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Personal Information */}
          <Card className="border-0 shadow-xl">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-500" />
                  Personal Information
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEditModal(true)}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  Edit
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>

              <div className="grid gap-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Gender</p>
                      <p className="text-sm text-gray-500">
                        Your gender identity
                      </p>
                    </div>
                  </div>
                  <span className="text-gray-700 font-medium">
                    {userProfile?.gender || "Not specified"}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Calendar className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Birthday</p>
                      <p className="text-sm text-gray-500">Date of birth</p>
                    </div>
                  </div>
                  <span className="text-gray-700 font-medium">
                    {userProfile?.birthDay || "Not specified"}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Phone className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Phone Number</p>
                      <p className="text-sm text-gray-500">Contact number</p>
                    </div>
                  </div>
                  <span className="text-gray-700 font-medium">
                    {userProfile?.phoneNumber
                      ? userProfile?.phoneNumber.toString()
                      : "Not specified"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && userProfile && (
        <EditProfileModal
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          user={userProfile}
          token={session?.accessToken || ""}
          onProfileUpdated={(updatedProfile) => setUserProfile(updatedProfile)}
        />
      )}
    </div>
  );
}
