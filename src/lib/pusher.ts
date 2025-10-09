import Pusher from "pusher-js";

let pusherInstance: Pusher | null = null;

export function getPusherInstance(): Pusher {
  if (!pusherInstance) {
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY!;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER!;

    pusherInstance = new Pusher(key, {
      cluster: cluster,
      forceTLS: true,
    });

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
