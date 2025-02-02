import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { ReactNode, useEffect } from "react";

interface WithRoleProtectionProps {
  children: ReactNode;
  allowedRole: string; // Role cần thiết để truy cập
}

const WithRoleProtection: React.FC<WithRoleProtectionProps> = ({
  children,
  allowedRole,
}) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user?.role !== allowedRole) {
      router.push("/auth/login");
    }
  }, [status, session, router, allowedRole]);

  if (status === "loading" || !session || session.user?.role !== allowedRole) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};

export default WithRoleProtection;
