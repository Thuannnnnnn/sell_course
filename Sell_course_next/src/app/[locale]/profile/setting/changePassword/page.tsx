// "use client"; // Required for client-side rendering in Next.js

// import { useSession } from "next-auth/react";
// import React, { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import axios from "axios";
// import { useLocale } from "next-intl";
// import "../../../../../style/ChangePassword.css";
// import BannerUser from "@/components/BannerUser";
// import SignIn from "@/app/[locale]/auth/login/page";

// const ChangePasswordPage: React.FC = () => {
//   const [currentPassword, setCurrentPassword] = useState<string>("");
//   const [newPassword, setNewPassword] = useState<string>("");
//   const [confirmPassword, setConfirmPassword] = useState<string>("");
//   const [error, setError] = useState<string>("");
//   const [isLoadingPage, setIsLoadingPage] = useState<boolean>(false);
//   const { data: session, status } = useSession();
//   const router = useRouter();
//   const localActive = useLocale();
//   const [user, setUser] = useState<any>(null);

//   // Check session and retrieve user data
//   useEffect(() => {
//     if (status === "unauthenticated") {
//       router.push("/auth/login");
//     } else if (status === "authenticated") {
//       const storedUser = localStorage.getItem("user");
//       setUser(storedUser ? JSON.parse(storedUser) : session.user);
//     }
//   }, [session, status, router]);

//   if (status === "loading") {
//     return <div>Loading...</div>;
//   }

//   // Handle password change
//   const handleChangePassword = async () => {
//     if (!currentPassword || !newPassword || !confirmPassword) {
//       setError("Please fill in all the fields.");
//       return;
//     }

//     if (newPassword !== confirmPassword) {
//       setError("New password and confirmation do not match.");
//       return;
//     }

//     setIsLoadingPage(true);
//     setError("");

//     try {
//       // Retrieve token from localStorage
//       const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

//       if (!token) {
//         setError("Authentication token not found. Please log in again.");
//         setIsLoadingPage(false);
//         return;
//       }

//       const payload = { currentPassword, newPassword };
//       console.log("Sending payload:", payload);

//       // Send request to change password
//       const response = await axios.put(
//         `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/change-password`,
//         payload,
//         {
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       alert(response.data.message || "Password changed successfully");
//       router.push(`/${localActive}/profile`);
//     } catch (err: any) {
//       console.error("Error during password change:", err);
//       setIsLoadingPage(false);
//       setError(err.response?.data?.message || "Failed to change password.");
//     }
//   };

//   return (
//     <>
//       <div>{user ? <BannerUser user={user} /> : <SignIn />}</div>
//       <div className="change-password">
//         <h1>Change Password</h1>
//         {error && <p className="error-message">{error}</p>}
//         <form onSubmit={(e) => e.preventDefault()}>
//           <div className="input-container">
//             <label htmlFor="inputCurrentPassword">Current Password</label>
//             <input
//               id="inputCurrentPassword"
//               type="password"
//               placeholder="Enter your current password"
//               className="input-field"
//               value={currentPassword}
//               onChange={(e) => setCurrentPassword(e.target.value)}
//             />
//           </div>
//           <div className="input-container">
//             <label htmlFor="inputNewPassword">New Password</label>
//             <input
//               id="inputNewPassword"
//               type="password"
//               placeholder="Enter new password"
//               className="input-field"
//               value={newPassword}
//               onChange={(e) => setNewPassword(e.target.value)}
//             />
//           </div>
//           <div className="input-container">
//             <label htmlFor="inputConfirmPassword">Confirm New Password</label>
//             <input
//               id="inputConfirmPassword"
//               type="password"
//               placeholder="Confirm new password"
//               className="input-field"
//               value={confirmPassword}
//               onChange={(e) => setConfirmPassword(e.target.value)}
//             />
//           </div>
//           <div className="groupButton">
//             <button
//               type="button"
//               className="submit-button"
//               onClick={handleChangePassword}
//               disabled={isLoadingPage}
//             >
//               {isLoadingPage ? "Changing..." : "Change Password"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </>
//   );
// };

// export default ChangePasswordPage;

"use client"; // Required for client-side rendering in Next.js

import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useLocale } from "next-intl";
import "../../../../../style/ChangePassword.css";
import BannerUser from "@/components/BannerUser";
import SignIn from "@/app/[locale]/auth/login/page";

const ChangePasswordPage: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoadingPage, setIsLoadingPage] = useState<boolean>(false);
  const { data: session, status } = useSession();
  const router = useRouter();
  const localActive = useLocale();

  // Check session and handle redirection if unauthenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  // Handle password change
  const handleChangePassword = async () => {
    // Trim spaces and check for empty fields
    const trimmedCurrentPassword = currentPassword.trim();
    const trimmedNewPassword = newPassword.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    if (!trimmedCurrentPassword || !trimmedNewPassword || !trimmedConfirmPassword) {
      setError("Please fill in all the fields.");
      return;
    }

    if (trimmedNewPassword !== trimmedConfirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    setIsLoadingPage(true);
    setError("");

    try {
      // Retrieve token from session
      const token = session?.user?.token;

      if (!token) {
        setError("Authentication token not found. Please log in again.");
        setIsLoadingPage(false);
        return;
      }

      const payload = { currentPassword: trimmedCurrentPassword, newPassword: trimmedNewPassword };

      // Send request to change password
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/change-password`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(response.data.message || "Password changed successfully");
      router.push(`/${localActive}/profile`);
    } catch (err: any) {
      console.error("Error during password change:", err);
      setIsLoadingPage(false);
      setError(err.response?.data?.message || "Failed to change password. Please try again.");
    }
  };

  return (
    <>
      <div>{session?.user ? <BannerUser user={session.user} /> : <SignIn />}</div>
      <div className="change-password">
        <h1>Change Password</h1>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="input-container">
            <label htmlFor="inputCurrentPassword">Current Password</label>
            <input
              id="inputCurrentPassword"
              type="password"
              placeholder="Enter your current password"
              className="input-field"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="input-container">
            <label htmlFor="inputNewPassword">New Password</label>
            <input
              id="inputNewPassword"
              type="password"
              placeholder="Enter new password"
              className="input-field"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="input-container">
            <label htmlFor="inputConfirmPassword">Confirm New Password</label>
            <input
              id="inputConfirmPassword"
              type="password"
              placeholder="Confirm new password"
              className="input-field"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <div className="groupButton">
            <button
              type="submit"
              className="submit-button"
              onClick={handleChangePassword}
              disabled={isLoadingPage}
            >
              {isLoadingPage ? "Changing..." : "Change Password"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ChangePasswordPage;

