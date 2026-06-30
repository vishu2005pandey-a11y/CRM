import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { prisma } from "@/lib/db";

export async function RecentActivity() {
  // Fetch latest 5 customers instead of fake activity since we don't have an Activity table yet
  const latestCustomers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  if (latestCustomers.length === 0) {
    return <div className="text-sm text-muted-foreground">No recent activity found.</div>;
  }

  return (
    <div className="space-y-8">
      {latestCustomers.map((customer) => (
        <div key={customer.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={`https://avatar.vercel.sh/${customer.name}.png`} alt="Avatar" />
            <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{customer.name}</p>
            <p className="text-sm text-muted-foreground">
              New customer added from {customer.state}
            </p>
          </div>
          <div className="ml-auto font-medium text-xs text-muted-foreground">
            {customer.createdAt.toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  );
}
