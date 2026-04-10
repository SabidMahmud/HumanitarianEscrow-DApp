"use client";

import { useWeb3, Role } from "@/context/Web3Context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function RoleGuard({
  children,
  allowedRoles
}: {
  children: React.ReactNode,
  allowedRoles: Role[]
}) {
  const { role, isLoading, address } = useWeb3();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!address) {
        router.push("/connect");
      } else if (role === "UNREGISTERED") {
        router.push("/register");
      } else if (!allowedRoles.includes(role)) {
        // User is connected, registered, but trying to access the wrong role's dashboard
        router.push("/connect"); // /connect handles the correct routing per role
      } else {
        setIsAuthorized(true);
      }
    }
  }, [isLoading, role, address, router, allowedRoles]);

  if (!isAuthorized) {
    // loading state for non-authorized
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050b14]">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return <>{children}</>;
}
