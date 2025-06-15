"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Trophy,
  Clock,
  Coins,
  TrendingUp,
  Thermometer,
  Zap,
  Bell,
  Shield,
  Camera,
} from "lucide-react";
import { useUser } from "@/contexts/user-context";

export default function ProfilePage() {
  const { user, updateUser, updatePreferences } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: user.username,
    email: user.email,
  });

  const handleSaveProfile = () => {
    updateUser(editForm);
    setIsEditing(false);
  };

  const handlePreferenceChange = (
    key: keyof typeof user.preferences,
    value: any
  ) => {
    updatePreferences({ [key]: value });
  };

  const achievements = [
    {
      id: 1,
      name: "First Session",
      description: "Complete your first GPU sharing session",
      earned: true,
      date: "2024-01-15",
    },
    {
      id: 2,
      name: "Power User",
      description: "Share GPU for 100+ hours",
      earned: true,
      date: "2024-02-20",
    },
    {
      id: 3,
      name: "Point Collector",
      description: "Earn 10,000+ points",
      earned: true,
      date: "2024-03-10",
    },
    {
      id: 4,
      name: "Marathon Runner",
      description: "Complete a 24-hour session",
      earned: false,
      date: null,
    },
    {
      id: 5,
      name: "Top Contributor",
      description: "Rank in top 10% of contributors",
      earned: false,
      date: null,
    },
  ];

  const stats = [
    { label: "Total Sessions", value: user.totalSessions, icon: Clock },
    {
      label: "Total Hours",
      value: `${user.totalHours.toFixed(1)}h`,
      icon: TrendingUp,
    },
    {
      label: "Points Earned",
      value: user.stats.totalPointsEarned.toLocaleString(),
      icon: Coins,
    },
    {
      label: "Points Spent",
      value: user.stats.totalPointsSpent.toLocaleString(),
      icon: Trophy,
    },
  ];

  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white">User Profile</h1>
          <p className="text-slate-300">Manage your account and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-2">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800/50">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Profile Information</span>
                </CardTitle>
                <CardDescription>
                  Manage your personal information and account details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Avatar className="h-20 w-20">
                      <AvatarImage
                        src={user.avatar || "/placeholder.svg"}
                        alt={user.username}
                      />
                      <AvatarFallback className="bg-purple-600 text-white text-xl">
                        {user.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="sm"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                      variant="secondary"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-semibold text-white">
                      {user.username}
                    </h3>
                    <p className="text-slate-400">{user.email}</p>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-yellow-600">{user.tier} Tier</Badge>
                      <Badge
                        variant="outline"
                        className="text-slate-300 border-slate-600"
                      >
                        Member since {user.joinDate.toLocaleDateString()}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator className="bg-slate-700" />

                {/* Profile Form */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-medium text-white">
                      Account Details
                    </h4>
                    <Button
                      onClick={() =>
                        isEditing ? handleSaveProfile() : setIsEditing(true)
                      }
                      variant={isEditing ? "default" : "outline"}
                    >
                      {isEditing ? "Save Changes" : "Edit Profile"}
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-slate-300">
                        Username
                      </Label>
                      <Input
                        id="username"
                        value={editForm.username}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            username: e.target.value,
                          }))
                        }
                        disabled={!isEditing}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-slate-300">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={editForm.email}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        disabled={!isEditing}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Member Since</Label>
                      <Input
                        value={user.joinDate.toLocaleDateString()}
                        disabled
                        className="bg-slate-700 border-slate-600 text-slate-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Current Tier</Label>
                      <Input
                        value={user.tier}
                        disabled
                        className="bg-slate-700 border-slate-600 text-slate-400"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card
                    key={index}
                    className="bg-slate-800/50 border-slate-700"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Icon className="h-5 w-5 text-purple-500" />
                        <div>
                          <p className="text-sm text-slate-400">{stat.label}</p>
                          <p className="text-2xl font-bold text-white">
                            {stat.value}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">
                  Detailed Statistics
                </CardTitle>
                <CardDescription>
                  Your performance metrics and activity summary
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-white">
                      Session Metrics
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-400">
                          Average Session Length
                        </span>
                        <span className="text-white">
                          {user.stats.averageSessionLength}h
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Longest Session</span>
                        <span className="text-white">
                          {user.stats.longestSession}h
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Sessions</span>
                        <span className="text-white">{user.totalSessions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Success Rate</span>
                        <span className="text-green-400">98.5%</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-white">
                      Earnings Overview
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Points Earned</span>
                        <span className="text-green-400">
                          +{user.stats.totalPointsEarned.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Points Spent</span>
                        <span className="text-red-400">
                          -{user.stats.totalPointsSpent.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Current Balance</span>
                        <span className="text-white">
                          {user.totalEarnings.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Avg. Points/Hour</span>
                        <span className="text-purple-400">
                          {(
                            user.stats.totalPointsEarned / user.totalHours
                          ).toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
