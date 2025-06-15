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
import { useWallet } from "@/hooks/useWallet";
import { useClearNode } from "@/hooks/useClearNode";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

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
  const { walletClient, isConnected } = useWallet();
  const {
    isAuthenticated,
    connect,
    createApplicationSession,
    closeApplicationSession,
  } = useClearNode();

  // console.log("isConnected = " , isConnected);
  // console.log("isAuthenticated = " , isAuthenticated);
  // console.log("walletClient = " , walletClient);

  // Connect to ClearNode when wallet is connected
  useEffect(() => {
    if (isConnected && walletClient && !isAuthenticated) {
      console.log("Connecting to ClearNode...");
      connect(walletClient)
        .then(() => console.log("ClearNode connection initiated"))
        .catch((error) =>
          console.error("Failed to connect to ClearNode:", error)
        );
    }
  }, [isConnected, walletClient, isAuthenticated, connect]);

  const [gpuStats, setGpuStats] = useState<GPUStats>({
    usage: 0,
    temperature: 45,
    memory: 20,
    power: 150,
  });

  const [isSharing, setIsSharing] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [depositAmount, setDepositAmount] = useState<string>("0.0001");
  const [depositError, setDepositError] = useState<string | null>(null);
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

  const validateDepositAmount = (amount: string): boolean => {
    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) {
      setDepositError("Amount must be a positive number");
      return false;
    }
    if (!/^\d*\.?\d*$/.test(amount)) {
      setDepositError("Invalid format (e.g., 0.0001)");
      return false;
    }
    setDepositError(null);
    return true;
  };

  const handleDepositAmountChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setDepositAmount(value);
    validateDepositAmount(value);
  };

  const startSharing = useCallback(async () => {
    if (!isConnected || !walletClient?.account?.address) {
      setDepositError("Please connect your wallet first");
      return;
    }
    // if (!isAuthenticated) {
    //   setDepositError("Authentication required. Please try again.");
    //   return;
    // }
    if (!validateDepositAmount(depositAmount)) {
      return;
    }

    try {
      // Create application session with deposit amount
      await createApplicationSession(
        walletClient.account.address,
        depositAmount
      );

      // Store deposit amount in localStorage
      localStorage.setItem("session_deposit_amount", depositAmount);

      // Start GPU sharing session
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
    } catch (error) {
      console.error("Failed to start sharing session:", error);
      setDepositError("Failed to create session. Please try again.");
    }
  }, [
    isConnected,
    isAuthenticated,
    walletClient,
    depositAmount,
    createApplicationSession,
  ]);

  const pauseSharing = useCallback(() => {
    setIsSharing(false);
  }, []);

  const stopSharing = useCallback(async () => {
    if (currentSession && walletClient?.account?.address) {
      const pointsEarned = Math.floor(sessionTime * 0.1);
      const completedSession: Session = {
        ...currentSession,
        endTime: new Date(),
        duration: sessionTime,
        pointsEarned,
        status: "completed",
      };

      try {
        // Close application session
        await closeApplicationSession(
          walletClient.account.address,
          pointsEarned
        );

        // Remove session_deposit_amount from localStorage
        localStorage.removeItem("session_deposit_amount");

        // Update sessions and user stats
        setSessions((prev) => [completedSession, ...prev]);
        updateUser({
          totalEarnings: user.totalEarnings + pointsEarned,
          totalSessions: user.totalSessions + 1,
          totalHours: user.totalHours + sessionTime / 3600,
        });
        setCurrentSession(null);
      } catch (error) {
        console.error("Failed to close sharing session:", error);
        setDepositError("Failed to close session. Please try again.");
      }
    }
    setIsSharing(false);
    setSessionTime(0);
  }, [
    currentSession,
    sessionTime,
    walletClient,
    user,
    updateUser,
    closeApplicationSession,
  ]);

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
          <TabsList className="grid w-full grid-cols-2 bg-slate-800/50">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
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
                    {/* Deposit Input */}
                    <div className="space-y-2">
                      <Label htmlFor="deposit-amount" className="text-white">
                        USDC Deposit Amount
                      </Label>
                      <Input
                        id="deposit-amount"
                        type="text"
                        value={depositAmount}
                        onChange={handleDepositAmountChange}
                        placeholder="Enter amount (e.g., 0.0001)"
                        className="bg-slate-700 text-white border-slate-600"
                        disabled={isSharing || !!currentSession}
                      />
                      {depositError && (
                        <p className="text-sm text-red-400">{depositError}</p>
                      )}
                    </div>

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
        </Tabs>
      </div>
    </div>
  );
}
