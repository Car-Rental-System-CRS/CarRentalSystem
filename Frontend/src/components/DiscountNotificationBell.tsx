'use client';

import { useEffect, useMemo, useState } from 'react';
import { Bell, TicketPercent } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { discountNotificationService } from '@/services/discountNotificationService';
import { DiscountNotificationItem } from '@/types/discountCampaign';
import { useAuth } from '@/lib/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';

export default function DiscountNotificationBell() {
  const { isAuthenticated, accessToken } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<DiscountNotificationItem[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      return;
    }

    let eventSource: EventSource | null = null;
    let reconnectTimer: number | null = null;
    let disposed = false;

    const fetchNotifications = async () => {
      try {
        const items = await discountNotificationService.getAll();
        setNotifications(items);
      } catch {
        // Ignore bell bootstrap failures; the page stays usable.
      }
    };

    const clearConnection = () => {
      eventSource?.close();
      eventSource = null;
    };

    const connect = () => {
      if (!accessToken || disposed) {
        return;
      }

      clearConnection();
      eventSource = discountNotificationService.subscribe(
        accessToken,
        (event) => {
          if (event.type !== 'notification' || !event.notification) {
            return;
          }

          setNotifications((current) => {
            const existing = current.filter((item) => item.id !== event.notification!.id);
            return [event.notification!, ...existing];
          });
        },
        () => {
          clearConnection();
          if (disposed || reconnectTimer != null) {
            return;
          }

          reconnectTimer = window.setTimeout(() => {
            reconnectTimer = null;
            connect();
          }, 3_000);
        }
      );
    };

    fetchNotifications();
    connect();

    return () => {
      disposed = true;
      if (reconnectTimer != null) {
        window.clearTimeout(reconnectTimer);
      }
      clearConnection();
    };
  }, [isAuthenticated, accessToken]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  const handleNotificationClick = async (notification: DiscountNotificationItem) => {
    if (!notification.read) {
      try {
        const updated = await discountNotificationService.markAsRead(notification.id);
        setNotifications((current) =>
          current.map((item) => (item.id === updated.id ? updated : item))
        );
      } catch {
        // Keep the current state if mark-as-read fails.
      }
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="default"
        className="relative"
        onClick={() => setIsOpen((value) => !value)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -right-2 -top-2 h-5 min-w-5 rounded-full px-1 flex items-center justify-center">
            {unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-3 z-20 w-[22rem] rounded-xl border border-gray-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <div>
                <p className="font-semibold text-gray-900">Discount Notifications</p>
                <p className="text-xs text-gray-500">
                  {unreadCount} unread offer{unreadCount === 1 ? '' : 's'}
                </p>
              </div>
            </div>

            <div className="max-h-[26rem] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <TicketPercent className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                  <p className="font-medium text-gray-700">No offers yet</p>
                  <p className="text-sm text-gray-500">
                    New discount campaigns will appear here in real time.
                  </p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full border-b border-gray-100 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
                      notification.read ? 'bg-white' : 'bg-blue-50/50'
                    }`}
                  >
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <p className="font-medium text-gray-900">{notification.title}</p>
                      {!notification.read && (
                        <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{notification.message}</p>
                    {notification.couponCode && (
                      <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-blue-700">
                        Coupon: {notification.couponCode}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-gray-500">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
