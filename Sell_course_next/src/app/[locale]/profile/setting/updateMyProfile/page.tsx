// "use client";

// import React, { useEffect, useState } from "react";
// import { useSession } from "next-auth/react";
// import { useRouter } from "next/navigation";
// import SignIn from "@/app/[locale]/auth/login/page";
// import DashBoardUser from "@/components/DashBoardUser";
// import "../../../../../style/UserProfilePage.css";
// import Link from "next/link";
// import { useLocale } from "next-intl";
// import BannerUser from "@/components/BannerUser";
// import axios from "axios";

// interface User {
//   id: string;
//   email: string;
//   name: string;
//   avartaImg: string;
//   gender: string;
//   birthDay: string;
//   phoneNumber: string;
//   role: string;
// }

// const UpdateMyProfilePage: React.FC = () => {
//   const { data: session, status } = useSession();
//   const router = useRouter();
//   const localActive = useLocale();
//   const [user, setUser] = useState<User | null>(null);
//   const [avatar, setAvatar] = useState<File | null>(null);
//   const [formData, setFormData] = useState<Partial<User>>({
//     email: "",
//     name: "",
//     gender: "",
//     birthDay: "",
//     phoneNumber: "",
//   });
//   const [error, setError] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState<boolean>(false);

//   useEffect(() => {
//     if (status === "unauthenticated") {
//       router.push("/auth/login");
//     } else if (status === "authenticated" && session?.user) {
//       setUser(session.user as User);
//     }
//   }, [session, status, router]);

//   if (status === "loading") {
//     return <div>Loading...</div>;
//   }

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       setAvatar(file);
//     }
//   };

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (
//       !formData.email &&
//       !formData.name &&
//       !formData.gender &&
//       !formData.birthDay &&
//       !formData.phoneNumber &&
//       !avatar
//     ) {
//       alert("Please update at least one field.");
//       return;
//     }

//     const form = new FormData();
//     form.append("email", formData.email || user?.email || "");
//     form.append("username", formData.name || user?.name || "");
//     if (formData.gender) form.append("gender", formData.gender);
//     if (formData.birthDay) form.append("birthDay", formData.birthDay);
//     if (formData.phoneNumber) form.append("phoneNumber", formData.phoneNumber);
//     if (avatar) form.append("avatar", avatar);

//     const token = session?.user?.token;

//     if (!token) {
//       setError("Authentication token not found. Please log in again.");
//       return;
//     }

//     try {
//       setIsLoading(true);
//       const response = await axios.put(
//         `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user`,
//         form,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "multipart/form-data",
//           },
//         }
//       );

//       alert("Profile updated successfully!");

//       // Update local user state with the new user data
//       setUser(response.data);

//       setIsLoading(false);
//     } catch (err: any) {
//       setError(err.response?.data?.message || "Error updating profile.");
//       setIsLoading(false);
//     }
//   };

//   return (
//     <>
//       <div>{user ? <BannerUser user={user} /> : <SignIn />}</div>
//       <div className="content-profile">
//         <div className="dashboard">
//           <DashBoardUser />
//         </div>
//         <div className="form-profile">
//           <div className="form-header">
//             <h2>Settings</h2>
//             <div className="link">
//               <Link
//                 className="link-profile"
//                 href={`/${localActive}/profile/setting/updateMyProfile`}
//               >
//                 <h6 className="active">Profile</h6>
//               </Link>
//               <Link
//                 className="link-profile"
//                 href={`/${localActive}/profile/setting/changePassword`}
//               >
//                 <h6>Password</h6>
//               </Link>
//             </div>
//           </div>
//           <h5>Form Update User</h5>
//           {error && <div className="error-message">{error}</div>}
//           <form onSubmit={handleSubmit}>
//             <div className="input-group">
//               <label htmlFor="avatar">Upload Avatar</label>
//               <input type="file" id="avatar" onChange={handleFileChange} />
//             </div>
//             <div className="input-group">
//               <label htmlFor="email">Email</label>
//               <input
//                 type="email"
//                 id="email"
//                 name="email"
//                 value={formData.email || user?.email || ""}
//                 onChange={handleInputChange}
//                 required
//               />
//             </div>
//             <div className="input-group">
//               <label htmlFor="username">Username</label>
//               <input
//                 type="text"
//                 id="username"
//                 name="name"
//                 value={formData.name || user?.name || ""}
//                 onChange={handleInputChange}
//                 required
//               />
//             </div>
//             <div className="input-group">
//               <label htmlFor="gender">Gender</label>
//               <input
//                 type="text"
//                 id="gender"
//                 name="gender"
//                 value={formData.gender || user?.gender || ""}
//                 onChange={handleInputChange}
//               />
//             </div>
//             <div className="input-group">
//               <label htmlFor="birthDay">Birthday</label>
//               <input
//                 type="date"
//                 id="birthDay"
//                 name="birthDay"
//                 value={formData.birthDay || user?.birthDay || ""}
//                 onChange={handleInputChange}
//               />
//             </div>
//             <div className="input-group">
//               <label htmlFor="phoneNumber">Phone Number</label>
//               <input
//                 type="text"
//                 id="phoneNumber"
//                 name="phoneNumber"
//                 value={formData.phoneNumber || user?.phoneNumber || ""}
//                 onChange={handleInputChange}
//               />
//             </div>
//             <div className="input-group">
//               <label htmlFor="avatar">Upload Avatar</label>
//               <input type="file" id="avatar" onChange={handleFileChange} />
//             </div>
//             <button type="submit" disabled={isLoading}>
//               {isLoading ? "Updating..." : "Update Profile"}
//             </button>
//           </form>
//         </div>
//       </div>
//     </>
//   );
// };

// export default UpdateMyProfilePage;

"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import SignIn from "@/app/[locale]/auth/login/page";
import DashBoardUser from "@/components/DashBoardUser";
import "../../../../../style/UserProfilePage.css";
import Link from "next/link";
import { useLocale } from "next-intl";
import BannerUser from "@/components/BannerUser";
import axios from "axios";
import { signIn } from "@/lib/auth";
import Image from "next/image";
import defaultAvatar from '../../../../image/defait-img.png';

interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  avartaImg: string;
  gender: string;
  birthDay: string;
  phoneNumber: string;
  role: string;
}


const UpdateMyProfilePage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const localActive = useLocale();
  const [user, setUser] = useState<User | null>(null);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({
    email: "",
    name: "",
    gender: "",
    birthDay: "",
    phoneNumber: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated" && session?.user) {
      setUser(session.user as User);
    }
  }, [session, status, router]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getMaxDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isUserAtLeast10YearsOld = (birthDate: string) => {
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    const age = today.getFullYear() - birthDateObj.getFullYear();
    const month = today.getMonth() - birthDateObj.getMonth();

    if (month < 0 || (month === 0 && today.getDate() < birthDateObj.getDate())) {
      return age - 1;
    }

    return age;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.birthDay) {
      const age = isUserAtLeast10YearsOld(formData.birthDay);
      if (age < 10) {
        setError("You must be at least 10 years old.");
        return;
      }
    }

    // Validate if the birthday is not a future date
    if (formData.birthDay && new Date(formData.birthDay) > new Date()) {
      setError("Birthday cannot be in the future.");
      return;
    }
    if (
      !formData.email &&
      !formData.name &&
      !formData.gender &&
      !formData.birthDay &&
      !formData.phoneNumber &&
      !avatar
    ) {
      alert("Please update at least one field.");
      return;
    }
    const form = new FormData();
    form.append("email", formData.email || user?.email || "");
    form.append("username", formData.name || user?.name || "");
    if (formData.gender) form.append("gender", formData.gender);
    if (formData.birthDay) form.append("birthDay", formData.birthDay);
    if (formData.phoneNumber) form.append("phoneNumber", formData.phoneNumber);
    if (avatar) form.append("avatar", avatar);

    const token = session?.user?.token;

    if (!token) {
      setError("Authentication token not found. Please log in again.");
      return;
    }
    try {
      setIsLoading(true);
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      alert("Profile updated successfully!");

      setUser(response.data);

      // Refresh the session after updating profile
      await signIn("credentials", {
        redirect: false,
        email: response.data.email,
        password: session?.user?.password || "",
      });

      setIsLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error updating profile.");
      setIsLoading(false);
    }
  };


  return (
    <>
      <div>{user ? <BannerUser user={user} /> : <SignIn />}</div>
      <div className="content-profile">
        <div className="dashboard">
          <DashBoardUser />
        </div>
        <div className="form-profile">
          <div className="form-header">
            <h2>Settings</h2>
            <div className="link">
              <Link
                className="link-profile"
                href={`/${localActive}/profile/setting/updateMyProfile`}
              >
                <h6 className="active">Profile</h6>
              </Link>
              <Link
                className="link-profile"
                href={`/${localActive}/profile/setting/changePassword`}
              >
                <h6>Password</h6>
              </Link>
            </div>
          </div>
          <div className="form-update">
            <div className="card-user">
              <div className="avatar">
                <Image
                  src={user?.avartaImg || defaultAvatar}
                  alt="User Avatar"
                  className="avatar-img"
                  layout="fixed"
                  width={100}
                  height={100}
                />
                <input className="avatar-upload" type="file" id="avatar" onChange={handleFileChange} />
              </div>
              <span className="name">{user?.name || 'Unknown User'}</span>
            </div>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit}>
            {/* <div className="input-group hidden">
              <label htmlFor="avatar">Upload Avatar</label>
              <input type="file" id="avatar" onChange={handleFileChange} />
            </div> */}
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email || user?.email || ""}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="name"
                value={formData.name || user?.name || ""}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="gender">Gender</label>
              <input
                type="text"
                id="gender"
                name="gender"
                value={formData.gender || user?.gender || ""}
                onChange={handleInputChange}
              />
            </div>
            <div className="input-group">
              <label htmlFor="birthDay">Birthday</label>
              <input
                type="date"
                id="birthDay"
                name="birthDay"
                value={formData.birthDay || user?.birthDay || ""}
                onChange={handleInputChange}
                max={getMaxDate()}
              />
            </div>
            <div className="input-group">
              <label htmlFor="phoneNumber">Phone Number</label>
              <input
                type="text"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber || user?.phoneNumber || ""}
                onChange={handleInputChange}
              />
            </div>
            <button className="btn-update" type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Profile"}
            </button>
          </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default UpdateMyProfilePage;