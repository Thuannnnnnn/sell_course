"use client";

// import { signOut } from "next-auth/react";
import { useState } from "react";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      // await signOut({ callbackUrl: "/" });
      console.log("Logout clicked (disabled for development)");
      setIsLoading(false);
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className={`px-4 flex items-center gap-2 ${
        isLoading ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-500"></span>
          Logging out...
        </div>
      ) : (
        <>
          <LogOut />
        </>
      )}
    </button>
  );
}
