import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { NotificationList } from "@/components/notification-list";

export default async function NotificationsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: notifications, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching notifications:", error);
  }

  const typedNotifications = (notifications ?? []) as Array<{
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: "order" | "delivery" | "promo" | "system";
    is_read: boolean;
    link: string | null;
    created_at: string;
  }>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Notifications</h1>
      <NotificationList notifications={typedNotifications} />
    </div>
  );
}
