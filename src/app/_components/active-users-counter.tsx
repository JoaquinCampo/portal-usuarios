"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Users, Wifi, WifiOff } from "lucide-react";
import { getPusherInstance } from "@/lib/pusher";
import { getActiveUsersCount } from "@/lib/api";

export function ActiveUsersCounter() {
  const [activeUsers, setActiveUsers] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchInitialCount = async () => {
      try {
        const count = await getActiveUsersCount();
        if (mounted) {
          setActiveUsers(count);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Failed to fetch initial active users count:", error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchInitialCount();

    const pusher = getPusherInstance();

    pusher.connection.bind("connected", () => {
      if (mounted) {
        setIsConnected(true);
      }
    });

    pusher.connection.bind("disconnected", () => {
      if (mounted) {
        setIsConnected(false);
      }
    });

    pusher.connection.bind("error", (err: unknown) => {
      console.error("Pusher connection error:", err);
      if (mounted) {
        setIsConnected(false);
      }
    });

    const channel = pusher.subscribe("active-users");

    channel.bind("user-count-updated", (data: { count: number }) => {
      console.log("Received active users update:", data);
      if (mounted) {
        setActiveUsers(data.count);
      }
    });

    return () => {
      mounted = false;
      channel.unbind_all();
      pusher.unsubscribe("active-users");
    };
  }, []);

  return (
    <div className="flex items-center gap-3">
      <div className="text-right">
        <div className="flex items-center justify-end gap-2">
          <p className="text-xs text-muted-foreground">Active Users (24h)</p>
          {!isLoading && (
            <div className="relative">
              {isConnected ? (
                <Wifi className="h-3 w-3 text-success" />
              ) : (
                <WifiOff className="h-3 w-3 text-muted-foreground" />
              )}
            </div>
          )}
        </div>
        <p className="text-2xl font-semibold text-foreground">
          {isLoading ? "..." : activeUsers}
        </p>
      </div>
      <Badge
        variant="outline"
        className="flex h-12 w-12 items-center justify-center rounded-full border-success/20 bg-success/10"
      >
        <Users className="h-5 w-5 text-success" />
      </Badge>
    </div>
  );
}
