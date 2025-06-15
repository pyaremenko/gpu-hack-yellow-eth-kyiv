"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Play,
  Pause,
  Square,
  Cpu,
  Thermometer,
  HardDrive,
  Zap,
  Coins,
  TrendingUp,
  Clock,
  DollarSign,
} from "lucide-react";
import { useUser } from "@/contexts/user-context";

interface GPUStats {
  usage: number;
  temperature: number;
  memory: number;
  power: number;
}

interface Session {
  id: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  pointsEarned: number;
  status: "active" | "completed";
}

interface Deposit {
  id: string;
  amount: number;
  date: Date;
  platform: string;
  pointsRedeemed: number;
}

export default function Dashboard() {
  const { user, updateUser } = useUser();
  const [gpuStats, setGpuStats] = useState<GPUStats>({
    usage: 0,
    temperature: 45,
    memory: 20,
    power: 150,
  });

  const [isSharing, setIsSharing] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: "1",
      startTime: new Date(Date.now() - 3600000),
      endTime: new Date(Date.now() - 1800000),
      duration: 1800,
      pointsEarned: 180,
      status: "completed",
    },
    {
      id: "2",
      startTime: new Date(Date.now() - 7200000),
      endTime: new Date(Date.now() - 5400000),
      duration: 1800,
      pointsEarned: 165,
      status: "completed",
    },
  ]);

  const [deposits] = useState<Deposit[]>([
    {
      id: "1",
      amount: 100,
      date: new Date(Date.now() - 86400000 * 7),
      platform: "apps.yellow.com",
      pointsRedeemed: 1200,
    },
    {
      id: "2",
      amount: 50,
      date: new Date(Date.now() - 86400000 * 14),
      platform: "apps.yellow.com",
      pointsRedeemed: 600,
    },
    {
      id: "3",
      amount: 75,
      date: new Date(Date.now() - 86400000 * 21),
      platform: "apps.yellow.com",
      pointsRedeemed: 900,
    },
  ]);

  // Simulate GPU stats updates
  useEffect(() => {
    const interval = setInterval(() => {
      setGpuStats((prev) => ({
        usage: isSharing
          ? Math.min(
              user.preferences.maxPowerUsage / 4,
              prev.usage + Math.random() * 10 - 5
            )
          : Math.max(0, prev.usage - 2),
        temperature: isSharing
          ? Math.min(
              user.preferences.maxTemperature,
              prev.temperature + Math.random() * 4 - 2
            )
          : Math.max(45, prev.temperature - 1),
        memory: isSharing
          ? Math.min(90, prev.memory + Math.random() * 8 - 4)
          : Math.max(20, prev.memory - 1),
        power: isSharing
          ? Math.min(
              user.preferences.maxPowerUsage,
              prev.power + Math.random() * 20 - 10
            )
          : Math.max(150, prev.power - 5),
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [
    isSharing,
    user.preferences.maxTemperature,
    user.preferences.maxPowerUsage,
  ]);

  // Session timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSharing) {
      interval = setInterval(() => {
        setSessionTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSharing]);

  const startSharing = useCallback(() => {
    const newSession: Session = {
      id: Date.now().toString(),
      startTime: new Date(),
      duration: 0,
      pointsEarned: 0,
      status: "active",
    };
    setCurrentSession(newSession);
    setIsSharing(true);
    setSessionTime(0);
  }, []);

  const pauseSharing = useCallback(() => {
    setIsSharing(false);
  }, []);

  const stopSharing = useCallback(() => {
    if (currentSession) {
      const pointsEarned = Math.floor(sessionTime * 0.1);
      const completedSession: Session = {
        ...currentSession,
        endTime: new Date(),
        duration: sessionTime,
        pointsEarned,
        status: "completed",
      };

      setSessions((prev) => [completedSession, ...prev]);
      updateUser({
        totalEarnings: user.totalEarnings + pointsEarned,
        totalSessions: user.totalSessions + 1,
        totalHours: user.totalHours + sessionTime / 3600,
      });
      setCurrentSession(null);
    }
    setIsSharing(false);
    setSessionTime(0);
  }, [currentSession, sessionTime, user, updateUser]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const totalDeposits = deposits.reduce(
    (sum, deposit) => sum + deposit.amount,
    0
  );
  const totalPointsFromDeposits = deposits.reduce(
    (sum, deposit) => sum + deposit.pointsRedeemed,
    0
  );

  return (
    <div className="p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Coins className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-slate-400">Total Points</p>
                  <p className="text-2xl font-bold text-white">
                    {user.totalEarnings.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-slate-400">Total Deposits</p>
                  <p className="text-2xl font-bold text-white">
                    ${totalDeposits}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-slate-400">Session Time</p>
                  <p className="text-2xl font-bold text-white">
                    {formatTime(sessionTime)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-slate-400">Status</p>
                  <Badge
                    variant={isSharing ? "default" : "secondary"}
                    className="text-sm"
                  >
                    {isSharing ? "Sharing" : "Idle"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="deposits">Deposits</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* GPU Stats */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Cpu className="h-5 w-5" />
                    <span>GPU Statistics</span>
                  </CardTitle>
                  <CardDescription>
                    Real-time hardware monitoring
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">GPU Usage</span>
                      <span className="text-white">
                        {gpuStats.usage.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={gpuStats.usage} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400 flex items-center space-x-1">
                        <Thermometer className="h-4 w-4" />
                        <span>Temperature</span>
                      </span>
                      <span className="text-white">
                        {gpuStats.temperature.toFixed(1)}°C
                      </span>
                    </div>
                    <Progress
                      value={
                        (gpuStats.temperature /
                          user.preferences.maxTemperature) *
                        100
                      }
                      className="h-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400 flex items-center space-x-1">
                        <HardDrive className="h-4 w-4" />
                        <span>Memory</span>
                      </span>
                      <span className="text-white">
                        {gpuStats.memory.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={gpuStats.memory} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400 flex items-center space-x-1">
                        <Zap className="h-4 w-4" />
                        <span>Power</span>
                      </span>
                      <span className="text-white">
                        {gpuStats.power.toFixed(0)}W
                      </span>
                    </div>
                    <Progress
                      value={
                        (gpuStats.power / user.preferences.maxPowerUsage) * 100
                      }
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Control Panel */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">
                    Resource Sharing Control
                  </CardTitle>
                  <CardDescription>
                    Manage your GPU resource sharing session
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center space-y-4">
                    <div className="text-6xl font-mono text-white">
                      {formatTime(sessionTime)}
                    </div>

                    {currentSession && (
                      <div className="text-m text-slate-400">
                        Points earning: {Math.floor(sessionTime * 0.1)} points
                      </div>
                    )}
                  </div>

                  <div className="flex justify-center space-x-2">
                    {!isSharing && !currentSession && (
                      <Button
                        onClick={startSharing}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Start Sharing
                      </Button>
                    )}

                    {isSharing && (
                      <Button onClick={pauseSharing} variant="outline">
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                      </Button>
                    )}

                    {currentSession && (
                      <Button onClick={stopSharing} variant="destructive">
                        <Square className="h-4 w-4 mr-2" />
                        Stop & Save
                      </Button>
                    )}

                    {!isSharing && currentSession && (
                      <Button
                        onClick={() => setIsSharing(true)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Resume
                      </Button>
                    )}
                  </div>

                  {isSharing && (
                    <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
                      <div className="flex items-center space-x-2 text-green-400">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium">
                          AI Model Training Active
                        </span>
                      </div>
                      <p className="text-xs text-green-300 mt-1">
                        Your GPU is contributing to distributed AI training
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Session History</CardTitle>
                <CardDescription>
                  Your resource sharing sessions and earnings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentSession && (
                    <div className="border border-blue-500 rounded-lg p-4 bg-blue-900/20">
                      <div className="flex justify-between items-start">
                        <div>
                          <Badge className="bg-blue-600">Current Session</Badge>
                          <p className="text-sm text-slate-400 mt-1">
                            Started:{" "}
                            {currentSession.startTime.toLocaleTimeString()}
                          </p>
                          <p className="text-sm text-slate-400">
                            Duration: {formatTime(sessionTime)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-white">
                            {Math.floor(sessionTime * 0.1)} pts
                          </p>
                          <p className="text-xs text-slate-400">Earning</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className="border border-slate-600 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <Badge variant="secondary">Completed</Badge>
                          <p className="text-sm text-slate-400 mt-1">
                            {session.startTime.toLocaleDateString()} at{" "}
                            {session.startTime.toLocaleTimeString()}
                          </p>
                          <p className="text-sm text-slate-400">
                            Duration: {formatTime(session.duration)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-white">
                            +{session.pointsEarned} pts
                          </p>
                          <p className="text-xs text-slate-400">Earned</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deposits" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Deposit History</CardTitle>
                <CardDescription>
                  Your deposits from apps.yellow.com and point redemptions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <p className="text-sm text-slate-400">Total Deposited</p>
                      <p className="text-2xl font-bold text-white">
                        ${totalDeposits}
                      </p>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <p className="text-sm text-slate-400">Conversion Rate</p>
                      <p className="text-2xl font-bold text-green-500">12x</p>
                    </div>
                  </div>

                  {deposits.map((deposit) => (
                    <div
                      key={deposit.id}
                      className="border border-slate-600 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center space-x-2">
                            <Badge className="bg-yellow-600">Deposit</Badge>
                            <span className="text-sm text-slate-400">
                              {deposit.platform}
                            </span>
                          </div>
                          <p className="text-sm text-slate-400 mt-1">
                            {deposit.date.toLocaleDateString()} at{" "}
                            {deposit.date.toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-white">
                            ${deposit.amount}
                          </p>
                          <p className="text-sm text-yellow-500">
                            +{deposit.pointsRedeemed} points
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
