"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { useVendorRealtime } from "@/hooks/use-vendor-realtime";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  preparing: "bg-orange-100 text-orange-800",
  out_for_delivery: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const VALID_NEXT_STATUSES: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["out_for_delivery", "cancelled"],
  out_for_delivery: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(price);
}

interface VendorOrdersContentProps {
  orders: Array<Record<string, unknown>>;
  vendorId: string;
}

export function VendorOrdersContent({
  orders,
  vendorId,
}: VendorOrdersContentProps) {
  const [localOrders, setLocalOrders] = useState(orders);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(
    null,
  );

  const handleNewOrder = useCallback((_payload: Record<string, unknown>) => {
    toast("New order received!", { icon: "📦" });
  }, []);

  useVendorRealtime({ vendorId, onNewOrder: handleNewOrder });

  useEffect(() => {
    setLocalOrders(orders);
  }, [orders]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    setStatusUpdating(orderId);

    try {
      const res = await fetch("/api/orders/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId, status: newStatus }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error ?? "Failed to update status");
        setStatusUpdating(null);
        return;
      }

      setLocalOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
      );
      toast.success(
        `Status updated to ${STATUS_LABELS[newStatus] ?? newStatus}`,
      );
    } catch {
      toast.error("Failed to update status");
    }

    setStatusUpdating(null);
  };

  const handleCancelClick = (orderId: string) => {
    setCancellingOrderId(orderId);
  };

  const handleCancelConfirm = (orderId: string) => {
    setCancellingOrderId(null);
    updateStatus(orderId, "cancelled");
  };

  const handleCancelDismiss = () => {
    setCancellingOrderId(null);
  };

  return (
    <div className="space-y-4">
      {localOrders.map((order) => {
        const shortId = (order.id as string).slice(-8).toUpperCase();
        const buyer = order.buyer as Record<string, unknown> | null;
        const orderItems = (order.order_items ?? []) as Array<
          Record<string, unknown>
        >;
        const vendorItems = orderItems.filter(
          (item: Record<string, unknown>) => {
            const product = item.products as Record<string, unknown> | null;
            return product?.vendor_id === vendorId;
          },
        );
        const vendorTotal = vendorItems.reduce(
          (sum: number, item: Record<string, unknown>) =>
            sum + Number(item.total_price ?? 0),
          0,
        );
        const status = order.status as string;
        const statusColor =
          STATUS_COLORS[status] ?? "bg-gray-100 text-gray-800";
        const date = order.created_at
          ? new Date(order.created_at as string).toLocaleString("en-IN", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "";

        const nextStatuses = VALID_NEXT_STATUSES[status] ?? [];
        const canUpdate = nextStatuses.length > 0;

        return (
          <div
            key={order.id as string}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-mono text-gray-500">#{shortId}</p>
                <p className="text-sm text-gray-700 mt-0.5">
                  {(buyer?.full_name as string) ?? "Unknown Buyer"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {canUpdate && (
                  <div className="flex items-center gap-2">
                    {nextStatuses.map((nextStatus) => {
                      if (nextStatus === "cancelled") {
                        const isConfirming = cancellingOrderId === order.id;
                        return (
                          <div key={nextStatus} className="relative">
                            {isConfirming ? (
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-gray-600 mr-1">
                                  Cancel?
                                </span>
                                <button
                                  onClick={() =>
                                    handleCancelConfirm(order.id as string)
                                  }
                                  disabled={statusUpdating === order.id}
                                  className="px-2 py-1 text-xs font-medium rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                                >
                                  Yes
                                </button>
                                <button
                                  onClick={handleCancelDismiss}
                                  disabled={statusUpdating === order.id}
                                  className="px-2 py-1 text-xs font-medium rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() =>
                                  handleCancelClick(order.id as string)
                                }
                                disabled={statusUpdating === order.id}
                                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50 transition-colors"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        );
                      }

                      return (
                        <button
                          key={nextStatus}
                          onClick={() =>
                            updateStatus(order.id as string, nextStatus)
                          }
                          disabled={statusUpdating === order.id}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[#8FBC8F] text-[#6B8E6B] hover:bg-[#8FBC8F] hover:text-white disabled:opacity-50 transition-colors"
                        >
                          {STATUS_LABELS[nextStatus] ?? nextStatus}
                        </button>
                      );
                    })}
                  </div>
                )}
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}
                >
                  {status.replace("_", " ")}
                </span>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {vendorItems.map((item) => {
                const product = item.products as Record<string, unknown> | null;
                return (
                  <div
                    key={item.id as string}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-gray-600">
                      {(product?.name as string) ?? "Product"} ×{" "}
                      {Number(item.quantity)}
                    </span>
                    <span className="text-gray-900 font-medium">
                      {formatPrice(Number(item.total_price))}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
              <span className="text-xs text-gray-400">{date}</span>
              <span className="text-lg font-bold text-[#8FBC8F]">
                {formatPrice(vendorTotal)}
              </span>
            </div>
          </div>
        );
      })}

      {localOrders.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">No orders yet</p>
        </div>
      )}
    </div>
  );
}
