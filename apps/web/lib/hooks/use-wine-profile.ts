"use client";

import { useState, useEffect, useCallback } from "react";
import type { WineProfileData } from "@/lib/types";

const LOCAL_STORAGE_KEY = "wine-profile";
const COOKIE_NAME = "wine-profile";

const defaultProfile: WineProfileData = {
  wineTypes: [],
  grapes: [],
  flavors: [],
  countries: [],
  priceMin: 5,
  priceMax: 50,
};

function setCookie(name: string, value: string, days = 365) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

function getLocalProfile(): WineProfileData | null {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as WineProfileData;
  } catch {
    return null;
  }
}

function saveLocalProfile(profile: WineProfileData) {
  try {
    const serialized = JSON.stringify(profile);
    localStorage.setItem(LOCAL_STORAGE_KEY, serialized);
    setCookie(COOKIE_NAME, serialized);
  } catch {
    // silently fail if storage is unavailable
  }
}

async function fetchProfileFromDb(): Promise<WineProfileData | null> {
  try {
    const res = await fetch("/api/profiel");
    if (!res.ok) return null;
    const data = await res.json();
    return data as WineProfileData;
  } catch {
    return null;
  }
}

async function saveProfileToDb(profile: WineProfileData): Promise<boolean> {
  try {
    const res = await fetch("/api/profiel", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function useWineProfile() {
  const [profile, setProfile] = useState<WineProfileData>(defaultProfile);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load profile on mount
  useEffect(() => {
    async function loadProfile() {
      setIsLoading(true);

      // Try to get from DB (authenticated users)
      const dbProfile = await fetchProfileFromDb();

      if (dbProfile) {
        setProfile(dbProfile);
        setIsAuthenticated(true);
        saveLocalProfile(dbProfile); // sync to local storage as well
      } else {
        // Fall back to localStorage for anonymous users
        const localProfile = getLocalProfile();
        if (localProfile) {
          setProfile(localProfile);
        }
      }

      setIsLoading(false);
    }

    loadProfile();
  }, []);

  const updateProfile = useCallback(
    async (updates: Partial<WineProfileData>) => {
      setProfile((prev) => {
        const updated = { ...prev, ...updates };
        saveLocalProfile(updated);
        if (isAuthenticated) {
          void saveProfileToDb(updated);
        }
        return updated;
      });
    },
    [isAuthenticated],
  );

  const saveProfile = useCallback(async (): Promise<boolean> => {
    saveLocalProfile(profile);
    if (isAuthenticated) {
      return saveProfileToDb(profile);
    }
    return true;
  }, [profile, isAuthenticated]);

  const clearProfile = useCallback(() => {
    setProfile(defaultProfile);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      document.cookie = `${COOKIE_NAME}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    } catch {
      // silently fail
    }
  }, []);

  const getProfile = useCallback(() => profile, [profile]);

  return {
    profile,
    isLoading,
    isAuthenticated,
    updateProfile,
    saveProfile,
    clearProfile,
    getProfile,
  };
}
