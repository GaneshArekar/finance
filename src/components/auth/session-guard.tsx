"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { signOut, useSession } from "@/lib/auth-client";

export const SESSION_ACTIVE_KEY = "financeflow_active_session";

export function SessionGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = useSession();
  const checkedRef = useRef(false);

  useEffect(() => {
    if (isPending) return;

    // Check if on a protected route
    const isProtectedRoute =
      pathname.startsWith("/overview") ||
      pathname.startsWith("/transactions") ||
      pathname.startsWith("/budgets") ||
      pathname.startsWith("/accounts") ||
      pathname.startsWith("/savings") ||
      pathname.startsWith("/reports") ||
      pathname.startsWith("/ai-coach") ||
      pathname.startsWith("/settings");

    if (!isProtectedRoute) return;

    // If there is no authenticated session at all, redirect to login
    if (!session?.user) {
      router.replace("/login");
      return;
    }

    // Auto sign out when closing and opening the site:
    // sessionStorage is tied exclusively to the browser window/tab lifecycle.
    // If the window/tab was closed and reopened, sessionStorage will be completely empty.
    const hasActiveSession = typeof window !== "undefined" && sessionStorage.getItem(SESSION_ACTIVE_KEY) === "true";

    if (!hasActiveSession && !checkedRef.current) {
      checkedRef.current = true;
      // Invalidate cookie session and redirect to login
      signOut({
        fetchOptions: {
          onSuccess: () => {
            if (typeof window !== "undefined") {
              sessionStorage.removeItem(SESSION_ACTIVE_KEY);
            }
            router.replace("/login?reason=session_ended");
          },
        },
      });
    }
  }, [session, isPending, pathname, router]);

  return <>{children}</>;
}

/**
 * Helper to mark current session as active upon successful login/register
 */
export function markSessionActive() {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(SESSION_ACTIVE_KEY, "true");
  }
}

/**
 * Helper to clear session active marker upon logout
 */
export function clearSessionActive() {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(SESSION_ACTIVE_KEY);
  }
}
