"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Home, User, Settings, LogOut, Coins, Menu, X } from "lucide-react";
import { useUser } from "@/contexts/user-context";
import { useWallet } from "@/hooks/useWallet";
import { useClearNode } from "@/hooks/useClearNode";
import { Hex } from "viem";

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useUser();
  const { isConnected, connectWallet, walletClient } = useWallet();
  const { connect } = useClearNode();

  // Initialize ClearNode connection when wallet is connected
  useEffect(() => {
    if (walletClient) {
      connect(walletClient);
    }
  }, [walletClient, connect]);

  // Shortened wallet address for display
  const shortenedAddress = walletClient
    ? `${walletClient.account?.address.slice(
        0,
        6
      )}...${walletClient.account?.address.slice(-4)}`
    : "";

  const navItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">GPU</span>
            </div>
            <span className="text-white font-semibold text-lg hidden sm:block">
              Flex
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={`text-slate-300 hover:text-white ${
                      isActive ? "bg-slate-700 text-white" : ""
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* User Menu and Wallet */}
          <div className="flex items-center space-x-4">
            {/* Wallet Connection */}
            {isConnected ? (
              <Button variant="outline" disabled className="text-slate-300">
                {shortenedAddress}
              </Button>
            ) : (
              <Button
                onClick={connectWallet}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Connect Wallet
              </Button>
            )}

            {/* Points Display */}
            <div className="hidden sm:flex items-center space-x-2 bg-slate-800 rounded-full px-3 py-1">
              <Coins className="h-4 w-4 text-yellow-500" />
              <span className="text-white font-medium">
                {user.totalEarnings.toLocaleString()}
              </span>
            </div>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={user.avatar || "/placeholder.svg"}
                      alt={user.username}
                    />
                    <AvatarFallback className="bg-purple-600 text-white">
                      {user.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 bg-slate-800 border-slate-700"
                align="end"
              >
                <DropdownMenuLabel className="text-white">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.username}</p>
                    <p className="text-xs text-slate-400">{user.email}</p>
                    <Badge className="w-fit bg-yellow-600 text-xs">
                      {user.tier} Tier
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem
                  asChild
                  className="text-slate-300 hover:text-white hover:bg-slate-700"
                >
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem className="text-red-400 hover:text-red-300 hover:bg-slate-700">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              className="md:hidden text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-700 py-4">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={`w-full justify-start text-slate-300 hover:text-white ${
                        isActive ? "bg-slate-700 text-white" : ""
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
              {/* Mobile Wallet Connection */}
              {isConnected ? (
                <Button
                  variant="outline"
                  disabled
                  className="w-full justify-start text-slate-300"
                >
                  {shortenedAddress}
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    connectWallet();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Connect Wallet
                </Button>
              )}
              {/* Mobile Points Display */}
              <div className="flex items-center space-x-2 px-4 py-2">
                <Coins className="h-4 w-4 text-yellow-500" />
                <span className="text-white font-medium">
                  {user.totalEarnings.toLocaleString()} Points
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
