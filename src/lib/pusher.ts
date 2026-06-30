import PusherServer from "pusher";
import PusherClient from "pusher-js";

// Export the server instance
export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

// Export a function to get the client instance to avoid SSR issues
export const getPusherClient = () => {
  if (typeof window !== "undefined") {
    // Enable pusher logging - don't include this in production
    // PusherClient.logToConsole = true;
    
    return new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });
  }
  return null;
};
