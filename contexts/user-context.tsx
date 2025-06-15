"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  joinDate: Date;
  totalEarnings: number;
  totalSessions: number;
  totalHours: number;
  tier: "Bronze" | "Silver" | "Gold" | "Platinum";
  preferences: {
    notifications: boolean;
    autoStart: boolean;
    maxTemperature: number;
    maxPowerUsage: number;
  };
  stats: {
    totalPointsEarned: number;
    totalPointsSpent: number;
    averageSessionLength: number;
    longestSession: number;
  };
}

interface UserContextType {
  user: User;
  updateUser: (updates: Partial<User>) => void;
  updatePreferences: (preferences: Partial<User["preferences"]>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>({
    id: "user_123",
    username: "User",
    email: "user@example.com",
    avatar: "/placeholder.svg?height=100&width=100",
    joinDate: new Date("2024-01-15"),
    totalEarnings: 2450,
    totalSessions: 47,
    totalHours: 156.5,
    tier: "Gold",
    preferences: {
      notifications: true,
      autoStart: false,
      maxTemperature: 80,
      maxPowerUsage: 300,
    },
    stats: {
      totalPointsEarned: 15420,
      totalPointsSpent: 2970,
      averageSessionLength: 3.3,
      longestSession: 8.5,
    },
  });

  const updateUser = (updates: Partial<User>) => {
    setUser((prev) => ({ ...prev, ...updates }));
  };

  const updatePreferences = (preferences: Partial<User["preferences"]>) => {
    setUser((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, ...preferences },
    }));
  };

  return (
    <UserContext.Provider value={{ user, updateUser, updatePreferences }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
