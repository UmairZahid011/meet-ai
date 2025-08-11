'use client'
import React, { useEffect, useState } from "react";
import { Sidebar } from "./components/sidebar";
import Header from "./components/Header";
import { Button } from "@/components/ui/button";
import { signIn, useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [isGoogleAuth, setIsGoogleAuth] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();
  const router = useRouter();
  const isAdmin = session?.user?.isAdmin;
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");
  const UserRoute = pathname.startsWith("/user");
  useEffect(() => {
    const checkAuth = async () => {
      const res = await fetch('/api/is-google-auth');
      const data = await res.json();
      setIsGoogleAuth(data.isGoogleAuth);
      setLoading(false);
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (loading || status === "unauthenticated") {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <div className="flex flex-col gap-2 items-center justify-center tex-white text-white">
          <Loader2 className="animate-spin w-10 h-10" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

   if (isAdminRoute && !isAdmin) {
    return (
      <div className="h-screen w-full flex items-center justify-center text-center">
        <div>
          <h2 className="text-2xl font-bold mb-2">Unauthorized</h2>
          <p>You are not allowed to access this page.</p>
        </div>
      </div>
    );
  }

  if (UserRoute && isAdmin) {
    return (
      <div className="h-screen w-full flex items-center justify-center text-center">
        <div>
          <h2 className="text-2xl font-bold mb-2">You need to login as user to access user pages</h2>
          <p>You are not allowed to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar isGoogleAuth={isGoogleAuth} isAdmin={isAdmin} />
      <div className="w-full bg-glass-color lg:ml-[280px]">
        <div className="container px-4 mx-auto relative z-10">
          <Header />
          {isAdmin ? (
            children
          ) : (
            isGoogleAuth ? (
              children
            ) : (
              <div className="h-[90vh] w-full flex justify-center items-center bg-[#ffffff0a] rounded-xl">
                <div>
                  <h2 className="text-2xl font-bold mb-2 text-center">Login</h2>
                  <p className="mb-4">To use the app services you need to login through google first</p>
                  <Button
                    variant="default"
                    onClick={() => signIn("google", { callbackUrl: '/user' })}
                    className="w-full flex items-center justify-center space-x-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="w-5 h-5" viewBox="0 0 16 16">
                      <path d="M15.545 6.558a9.4 9.4 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.7 7.7 0 0 1 5.352 2.082l-2.284 2.284A4.35 4.35 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.8 4.8 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.7 3.7 0 0 0 1.599-2.431H8v-3.08z" />
                    </svg>
                    Continue with Google
                  </Button>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
