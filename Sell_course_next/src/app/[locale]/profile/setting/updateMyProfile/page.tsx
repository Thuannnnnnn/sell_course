"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import SignIn from "@/app/[locale]/auth/login/page";
import DashBoardUser from "@/components/DashBoardUser";
import '../../../../../style/UserProfilePage.css'
import Link from "next/link";
import { useLocale } from "next-intl";
import BannerUser from "@/components/BannerUser";
import { User } from "next-auth";

const UpdateMyProfilePage: React.FC = () => {
    const { data: session, status } = useSession();
    const router = useRouter();
    const localActive = useLocale();
    const [user, setUser] = useState<any>(null);
    // Ensure hooks are called consistently
      useEffect(() => {
           if (status === "unauthenticated") {
             router.push("/auth/login");
           } else if (status === "authenticated" && session?.user) {
             setUser(session.user as User);
             console.log("Session User:", session.user); // Log session user
           }
         }, [session, status, router]);
   
         // Handle loading state
         if (status === "loading") {
           return <div>Loading...</div>;
         }

    return (
      <>
      <div>
        {user ? <BannerUser user={user} /> : <SignIn />}
      </div>
      <div className="content-profile">
        <div className="dashboard"><DashBoardUser /></div>
        <div className="form-profile">
          <div className="form-header">
            <h2>Settings</h2>
            <div className="link">
                <Link className="link-profile" href={`/${localActive}/profile/setting/updateMyProfile`}>
                    <h6 className="active">Profile</h6>
                </Link>
                <Link className="link-profile" href={`/${localActive}/profile/setting/changePassword`}>
                  <h6 >Password</h6>
                </Link>
            </div>
          </div>
          <h5>Hello</h5>
        </div>
      </div>
      <h5>Hello</h5>
      </>

    );
}

export default UpdateMyProfilePage