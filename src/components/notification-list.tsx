"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { toast } from "react-hot-toast";
import Link from "next/link";

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "order" | "delivery" | "promo" | "system";
  is_read: boolean;
  link: string | null;
  created_at: string;
}

interface NotificationListProps {
  notifications: Notification[];
}

function getTypeIcon(type: string) {
  switch (type) {
    case "order":
      return (
        <svg
          className="w-5 h-5 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
      );
    case "delivery":
      return (
        <svg
          className="w-5 h-5 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
          />
        </svg>
      );
    case "promo":
      return (
        <svg
          className="w-5 h-5 text-amber-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
          />
        </svg>
      );
    case "system":
    default:
      return (
        <svg
          className="w-5 h-5 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
  }
}

function formatDate(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function groupByDate(
  notifications: Notification[],
): Map<string, Notification[]> {
  const groups = new Map<string, Notification[]>();

  for (const notification of notifications) {
    const date = new Date(notification.created_at);
    const dateKey = formatDate(date);

    if (!groups.has(dateKey)) {
      groups.set(dateKey, []);
    }
    groups.get(dateKey)!.push(notification);
  }

  return groups;
}

export function NotificationList({ notifications }: NotificationListProps) {
  const supabase = createClient();
  const [localNotifications, setLocalNotifications] = useState(notifications);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const groupedNotifications = groupByDate(localNotifications);
  const unreadCount = localNotifications.filter((n) => !n.is_read).length;

  const handleMarkAllAsRead = async () => {
    const unreadIds = localNotifications
      .filter((n) => !n.is_read)
      .map((n) => n.id);

    if (unreadIds.length === 0) {
      toast("All notifications are already read");
      return;
    }

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .in("id", unreadIds);

    if (error) {
      toast.error("Failed to mark notifications as read");
    } else {
      setLocalNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true })),
      );
      toast.success("All notifications marked as read");
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    if (processingId) return;

    const notification = localNotifications.find(
      (n) => n.id === notificationId,
    );
    if (notification?.is_read) return;

    setProcessingId(notificationId);

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId);

    if (error) {
      toast.error("Failed to mark notification as read");
    } else {
      setLocalNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n,
        ),
      );
    }
    setProcessingId(null);
  };

  return (
    <div>
      {unreadCount > 0 && (
        <div className="mb-4">
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm font-medium text-[#8FBC8F] hover:text-[#7AA87A] transition-colors"
            aria-label="Mark all notifications as read"
          >
            Mark all as read
          </button>
        </div>
      )}

      {localNotifications.length === 0 ? (
        <div className="text-center py-16">
          <svg
            className="w-16 h-16 mx-auto text-gray-300 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <p className="text-gray-500 text-lg">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Array.from(groupedNotifications.entries()).map(
            ([dateKey, notifications]) => (
              <section key={dateKey}>
                <h2 className="text-sm font-semibold text-gray-500 mb-3">
                  {dateKey}
                </h2>
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleMarkAsRead(notification.id)}
                      className={`bg-white rounded-xl border p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                        !notification.is_read
                          ? "border-[#8FBC8F]/30 shadow-sm"
                          : "border-gray-100"
                      }`}
                      role={notification.link ? "link" : "button"}
                      tabIndex={0}
                      aria-label={`${notification.is_read ? "Read" : "Unread"} notification: ${notification.title}`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                            !notification.is_read
                              ? "bg-[#8FBC8F]/10"
                              : "bg-gray-50"
                          }`}
                        >
                          {getTypeIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p
                              className={`text-sm font-medium truncate ${
                                !notification.is_read
                                  ? "text-gray-900"
                                  : "text-gray-600"
                              }`}
                            >
                              {notification.title}
                            </p>
                            {!notification.is_read && (
                              <span className="flex-shrink-0 w-2 h-2 bg-[#8FBC8F] rounded-full" />
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(
                              notification.created_at,
                            ).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ),
          )}
        </div>
      )}
    </div>
  );
}
