"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  createProfile,
  fetchProfile,
  loginProfile,
  logoutProfile,
  removeGroup,
  saveGroup,
} from "@/lib/api/profile";
import type { Profile, SavedGroup } from "@/types/profile";

interface ProfileContextValue {
  status: "loading" | "ready";
  configured: boolean;
  setupError: string | null;
  profile: Profile | null;
  groups: SavedGroup[];
  open: boolean;
  setOpen: (open: boolean) => void;
  signup: (username: string, code: string) => Promise<string | null>;
  login: (username: string, code: string) => Promise<string | null>;
  logout: () => Promise<string | null>;
  createGroup: (name: string, members: string[]) => Promise<string | null>;
  deleteGroup: (id: string) => Promise<string | null>;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"loading" | "ready">("loading");
  const [configured, setConfigured] = useState(true);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [groups, setGroups] = useState<SavedGroup[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchProfile()
      .then((snapshot) => {
        if (cancelled) return;
        setConfigured(snapshot.configured);
        setSetupError(snapshot.error ?? null);
        setProfile(snapshot.profile);
        setGroups(snapshot.groups);
        setStatus("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setSetupError("Couldn't load your profile.");
        setStatus("ready");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const signup = useCallback(async (username: string, code: string) => {
    const snapshot = await createProfile(username, code);
    if (snapshot.error || !snapshot.profile) {
      return snapshot.error ?? "Couldn't create that profile.";
    }
    setConfigured(true);
    setSetupError(null);
    setProfile(snapshot.profile);
    setGroups(snapshot.groups);
    return null;
  }, []);

  const login = useCallback(async (username: string, code: string) => {
    const snapshot = await loginProfile(username, code);
    if (snapshot.error || !snapshot.profile) {
      return snapshot.error ?? "Couldn't sign in.";
    }
    setConfigured(true);
    setSetupError(null);
    setProfile(snapshot.profile);
    setGroups(snapshot.groups);
    return null;
  }, []);

  const logout = useCallback(async () => {
    const error = await logoutProfile();
    if (error) return error;
    setProfile(null);
    setGroups([]);
    return null;
  }, []);

  const createGroup = useCallback(async (name: string, members: string[]) => {
    const result = await saveGroup(name, members);
    if (result.error || !result.group) {
      return result.error ?? "Couldn't save that group.";
    }
    setGroups((current) => [...current, result.group!]);
    return null;
  }, []);

  const deleteGroup = useCallback(async (id: string) => {
    const error = await removeGroup(id);
    if (error) return error;
    setGroups((current) => current.filter((group) => group.id !== id));
    return null;
  }, []);

  const value = useMemo(
    () => ({
      status,
      configured,
      setupError,
      profile,
      groups,
      open,
      setOpen,
      signup,
      login,
      logout,
      createGroup,
      deleteGroup,
    }),
    [
      status,
      configured,
      setupError,
      profile,
      groups,
      open,
      signup,
      login,
      logout,
      createGroup,
      deleteGroup,
    ],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within ProfileProvider");
  }
  return context;
}
