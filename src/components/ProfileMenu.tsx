"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { AuthModal } from "./AuthModal";
import { signOut } from "@/app/actions/auth";
import { UserIcon, LogOutIcon } from "./Icons";

export function ProfileMenu() {
  const { user, loading, refresh } = useAuth();
  const [open, setOpen] = useState(false);
  const [authModal, setAuthModal] = useState<"login" | "signup" | null>(null);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSignOut() {
    await signOut();
    await refresh();
    setOpen(false);
  }

  if (loading) {
    return <div className="h-8 w-8 rounded-full bg-surface-inset" />;
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all ${
          user
            ? "border-emerald-500 bg-emerald-500/10 text-emerald-500"
            : "border-line-strong text-fg-muted hover:border-fg-muted hover:text-fg"
        }`}
      >
        <UserIcon className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 w-48 overflow-hidden rounded-xl border border-line bg-surface shadow-lg">
          {user ? (
            <>
              <div className="border-b border-line px-4 py-3">
                <p className="truncate font-mono text-xs text-fg-muted">{user.email}</p>
              </div>
              <button
                onClick={() => {
                  setOpen(false);
                  router.push("/profile");
                }}
                className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-fg hover:bg-surface-raised"
              >
                <UserIcon className="h-4 w-4 text-fg-muted" />
                Profile
              </button>
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-2 border-t border-line px-4 py-3 text-left text-sm text-red-500 hover:bg-surface-raised"
              >
                <LogOutIcon className="h-4 w-4" />
                Log out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setAuthModal("login");
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-fg hover:bg-surface-raised"
              >
                <UserIcon className="h-4 w-4 text-fg-muted" />
                Log in
              </button>
              <button
                onClick={() => {
                  setAuthModal("signup");
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-bold text-emerald-500 hover:bg-surface-raised"
              >
                <UserIcon className="h-4 w-4" />
                Sign up
              </button>
            </>
          )}
        </div>
      )}

      {authModal && <AuthModal mode={authModal} onClose={() => setAuthModal(null)} />}
    </div>
  );
}
