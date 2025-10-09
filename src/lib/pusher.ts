import Pusher from "pusher-js";

let pusherInstance: Pusher | null = null;

export function getPusherInstance(): Pusher {
  if (!pusherInstance) {
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY || "your-key";
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "us2";

    pusherInstance = new Pusher(key, {
      cluster: cluster,
      forceTLS: true,
    });

    // Enable logging in development
    if (process.env.NODE_ENV === "development") {
      Pusher.logToConsole = true;
    }
  }

  return pusherInstance;
}

export function disconnectPusher() {
  if (pusherInstance) {
    pusherInstance.disconnect();
    pusherInstance = null;
  }
}
