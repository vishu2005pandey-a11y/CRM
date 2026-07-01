import PusherServer from "pusher";
import PusherClient from "pusher-js";

// Lazy instantiate to prevent Vercel build hanging due to open connections
const globalForPusher = globalThis as unknown as {
  pusherServer: PusherServer | undefined;
};

export const getPusherServer = () => {
  if (!globalForPusher.pusherServer) {
    globalForPusher.pusherServer = new PusherServer({
      appId: process.env.PUSHER_APP_ID!,
      key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      useTLS: true,
    });
  }
  return globalForPusher.pusherServer;
};

// Export a function to get the client instance to avoid SSR issues
export const getPusherClient = () => {
  if (typeof window !== "undefined") {
    return new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });
  }
  return null;
};
