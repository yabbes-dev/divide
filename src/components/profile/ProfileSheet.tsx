"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";

import { useProfile } from "@/components/profile/ProfileProvider";
import { InlineNotice } from "@/components/ui/inline-notice";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ProfileInitial } from "@/components/profile/ProfileInitial";
import { PersonAvatar, PersonAvatarChip } from "@/components/wizard/PersonAvatarChip";
import { WizardAction, wizardButtonClass } from "@/components/wizard/WizardAction";
import { WizardCancelButton } from "@/components/wizard/WizardCancelButton";
import { toTitleCase } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

const profileDialogClass =
  "max-h-[min(85dvh,40rem)] gap-5 overflow-y-auto rounded-none px-5 py-6 sm:max-w-md";

const textLinkClass =
  "text-xs font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground";

export function ProfileSheet() {
  const profileState = useProfile();
  const { profile, groups, open, setOpen, authMode, configured, setupError } = profileState;
  const [mode, setMode] = useState<"create" | "signin">("signin");
  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [memberName, setMemberName] = useState("");
  const [members, setMembers] = useState<string[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [hidingAuth, setHidingAuth] = useState(false);
  const loggingOut = useRef(false);

  useEffect(() => {
    if (open) setMode(authMode);
  }, [open, authMode]);

  function resetAuthForm() {
    setUsername("");
    setCode("");
    setError(null);
  }

  function clearGroupDraft() {
    setGroupName("");
    setMemberName("");
    setMembers([]);
    setError(null);
  }

  function openGroupForm() {
    clearGroupDraft();
    setConfirmDeleteId(null);
    setOpen(false);
    setCreatingGroup(true);
  }

  function finishGroupForm() {
    clearGroupDraft();
    setCreatingGroup(false);
    if (!loggingOut.current) setOpen(true);
  }

  const canSubmitAuth = username.trim().length > 0 && code.length === 4;

  async function handleAuth(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmitAuth) return;
    setBusy(true);
    setError(null);
    const message =
      mode === "create"
        ? await profileState.signup(username, code)
        : await profileState.login(username, code);
    setBusy(false);
    if (message) {
      setError(message);
      return;
    }
    resetAuthForm();
    if (mode === "signin") setOpen(false);
  }

  function addMember() {
    const name = toTitleCase(memberName);
    if (!name) return;
    if (members.some((member) => member.toLowerCase() === name.toLowerCase())) {
      setError("Already added.");
      return;
    }
    setError(null);
    setMembers((current) => [...current, name]);
    setMemberName("");
  }

  async function handleCreateGroup(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const message = await profileState.createGroup(groupName, members);
    setBusy(false);
    if (message) {
      setError(message);
      return;
    }
    finishGroupForm();
  }

  async function handleDelete(id: string) {
    setBusy(true);
    setError(null);
    const message = await profileState.deleteGroup(id);
    setBusy(false);
    if (message) {
      setError(message);
      return;
    }
    setConfirmDeleteId(null);
  }

  async function handleLogout() {
    loggingOut.current = true;
    setHidingAuth(true);
    setOpen(false);
    setCreatingGroup(false);
    setBusy(true);
    const message = await profileState.logout();
    setBusy(false);
    clearGroupDraft();
    resetAuthForm();
    if (message) {
      loggingOut.current = false;
      setHidingAuth(false);
      setError(message);
      setOpen(true);
      return;
    }
    window.setTimeout(() => {
      loggingOut.current = false;
      setHidingAuth(false);
    }, 250);
  }

  return (
    <>
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (loggingOut.current && next) return;
        setOpen(next);
        if (!next) {
          setError(null);
          setConfirmDeleteId(null);
          setMode("signin");
        }
      }}
    >
      <DialogContent className={profileDialogClass}>
        <DialogHeader className="items-center gap-1 px-6 text-center">
          {profile && (
            <ProfileInitial name={profile.username} className="mb-1" />
          )}
          <DialogTitle className="text-xl font-semibold tracking-tight">
            {hidingAuth
              ? ""
              : profile
                ? profile.username
                : mode === "create"
                  ? "Sign up"
                  : "Sign in"}
          </DialogTitle>
          {profile && !hidingAuth && (
            <DialogDescription>
              Saved groups show up the next time you split a bill.
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4">
          {!configured && (
            <InlineNotice variant="info">
              Profiles need a Supabase project before they can be saved.
            </InlineNotice>
          )}
          {setupError && <InlineNotice variant="error">{setupError}</InlineNotice>}

          {hidingAuth ? null : profile ? (
            <div className="space-y-4">
              {groups.length > 0 ? (
                <ul className="space-y-3">
                  {groups.map((group) => (
                    <li key={group.id} className="border border-border px-3 py-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="min-w-0 truncate text-sm font-semibold">{group.name}</p>
                        {confirmDeleteId === group.id ? (
                          <div className="flex shrink-0 items-center gap-3">
                            <button
                              type="button"
                              className="text-xs font-medium text-destructive underline underline-offset-4 hover:text-destructive/80"
                              disabled={busy}
                              onClick={() => handleDelete(group.id)}
                            >
                              Delete
                            </button>
                            <button
                              type="button"
                              className={textLinkClass}
                              onClick={() => setConfirmDeleteId(null)}
                            >
                              Keep
                            </button>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-9 shrink-0 text-muted-foreground hover:text-foreground"
                            aria-label={`Delete ${group.name}`}
                            onClick={() => setConfirmDeleteId(group.id)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        )}
                      </div>
                      <div className="mt-3 flex flex-wrap justify-center gap-3">
                        {group.members.map((member, index) => (
                          <PersonAvatar
                            key={member}
                            name={member}
                            colorIndex={index}
                          />
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-sm text-muted-foreground">No groups yet.</p>
              )}

              <div className="flex justify-center pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className={wizardButtonClass}
                  onClick={openGroupForm}
                >
                  New group
                </Button>
              </div>

              {error && <InlineNotice variant="error">{error}</InlineNotice>}

              <WizardCancelButton label="Sign out" disabled={busy} onClick={handleLogout} />
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleAuth} aria-busy={busy}>
              <label className="flex flex-col gap-3" htmlFor="profile-username">
                <span className="text-sm font-medium">Username</span>
                <Input
                  id="profile-username"
                  value={username}
                  autoComplete="username"
                  disabled={busy}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="e.g. Alex"
                  className="h-11"
                />
              </label>

              <label className="flex flex-col gap-3" htmlFor="profile-code">
                <span className="text-sm font-medium">4-digit code</span>
                <Input
                  id="profile-code"
                  value={code}
                  inputMode="numeric"
                  autoComplete="off"
                  disabled={busy}
                  maxLength={4}
                  pattern="[0-9]*"
                  onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 4))}
                  className="h-11"
                />
              </label>

              {error && <InlineNotice variant="error">{error}</InlineNotice>}

              <div className="flex flex-col items-center gap-2">
                <WizardAction type="submit" disabled={busy || !configured || !canSubmitAuth}>
                  {busy ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin" />
                      {mode === "create" ? "Signing up…" : "Signing in…"}
                    </span>
                  ) : mode === "create" ? (
                    "Sign up"
                  ) : (
                    "Sign in"
                  )}
                </WizardAction>
                <p className="text-center text-xs text-muted-foreground">
                  {mode === "signin" ? "Don't have a profile?" : "Already have a profile?"}{" "}
                  <button
                    type="button"
                    className="font-medium underline underline-offset-4 hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                    disabled={busy}
                    onClick={() => {
                      setMode(mode === "signin" ? "create" : "signin");
                      setError(null);
                    }}
                  >
                    {mode === "signin" ? "Sign up" : "Sign in"}
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>

    <Dialog
      open={creatingGroup}
      onOpenChange={(next) => {
        if (!next && creatingGroup) finishGroupForm();
      }}
    >
      <DialogContent className={profileDialogClass}>
        <DialogHeader className="items-center gap-1 px-6 text-center">
          <DialogTitle className="text-xl font-semibold tracking-tight">New group</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleCreateGroup}>
          <label className="flex flex-col gap-3">
            <span className="text-sm font-medium">Group name</span>
            <Input
              value={groupName}
              onChange={(event) => setGroupName(event.target.value)}
              placeholder="e.g. Housemates"
              className="h-11"
            />
          </label>
          <label className="flex flex-col gap-3">
            <span className="text-sm font-medium">People</span>
            <div className="flex gap-2">
              <Input
                value={memberName}
                onChange={(event) => setMemberName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addMember();
                  }
                }}
                placeholder="e.g. Alex"
                className="h-11"
              />
              <Button
                type="button"
                className={wizardButtonClass}
                disabled={!memberName.trim()}
                onClick={addMember}
              >
                Add
              </Button>
            </div>
          </label>
          {members.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4 pt-1">
              {members.map((member, index) => (
                <PersonAvatarChip
                  key={member}
                  name={member}
                  colorIndex={index}
                  onRemove={() =>
                    setMembers((current) => current.filter((name) => name !== member))
                  }
                />
              ))}
            </div>
          )}
          {error && <InlineNotice variant="error">{error}</InlineNotice>}
          <div className="flex flex-col items-center gap-2">
            <WizardAction
              type="submit"
              disabled={busy || members.length < 2 || !groupName.trim()}
            >
              Save group
            </WizardAction>
            <WizardCancelButton onClick={finishGroupForm} />
          </div>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
}
