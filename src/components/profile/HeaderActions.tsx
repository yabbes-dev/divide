"use client";

import { UserRound } from "lucide-react";

import { ProfileSheet } from "@/components/profile/ProfileSheet";
import { useProfile } from "@/components/profile/ProfileProvider";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Button } from "@/components/ui/button";
import { ProfileInitial } from "@/components/profile/ProfileInitial";

export function HeaderActions() {
  const { profile, status, setOpen } = useProfile();

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-9 shrink-0 overflow-visible p-0 text-muted-foreground hover:text-foreground"
        aria-label={profile ? `Profile, ${profile.username}` : "Profile"}
        onClick={() => setOpen(true)}
      >
        {status === "ready" && profile ? (
          <ProfileInitial name={profile.username} size="sm" />
        ) : (
          <UserRound className="size-4" />
        )}
      </Button>
      <ThemeToggle />
      <ProfileSheet />
    </>
  );
}
