'use client';
import { useEffect } from 'react';
import { Bell, Check, CheckCheck, AlertCircle, ClipboardList, FileText, Info } from 'lucide-react';
import Link from 'next/link';
import { useNotificationStore } from '@/store/notificationStore';
import { cn, timeAgo } from '@/lib/utils';

const NOTIFICATION_ICONS = {
  new_report: FileText,
  claim_submitted: ClipboardList,
  claim_approved: Check,
  claim_rejected: AlertCircle,
  claim_review: ClipboardList,
  case_resolved: Check,
  document_requested: AlertCircle,
  alert: AlertCircle,
  system: Info,
};

const NOTIFICATION_COLORS = {
  claim_approved: 'bg-green-100 text-green-600',
  case_resolved: 'bg-green-100 text-green-600',
  claim_rejected: 'bg-red-100 text-red-600',
  claim_submitted: 'bg-blue-100 text-blue-600',
  alert: 'bg-orange-100 text-orange-600',
  document_requested: 'bg-yellow-100 text-yellow-600',
};

export default function NotificationsPage() {
  const { notifications, isLoading, fetchNotifications, markAsRead, markAllAsRead, unreadCount } = useNotificationStore();

  useEffect(() => {
    fetchNotifications(1);
  }, [fetchNotifications]);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-muted-foreground text-sm mt-0.5">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="flex items-center gap-2 text-sm text-primary hover:underline">
            <CheckCheck className="w-4 h-4" /> Mark all as read
          </button>
        )}
      </div>

      {isLoading && notifications.length === 0 ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border p-4 animate-pulse flex gap-3">
              <div className="w-10 h-10 bg-muted rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">No notifications yet</h3>
          <p className="text-muted-foreground text-sm">{"You'll be notified here when there's activity on your reports or claims."}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(notification => {
            const Icon = NOTIFICATION_ICONS[notification.type] || Bell;
            const iconColor = NOTIFICATION_COLORS[notification.type] || 'bg-muted text-muted-foreground';

            return (
              <div
                key={notification._id}
                onClick={() => !notification.isRead && markAsRead(notification._id)}
                className={cn(
                  'bg-white rounded-xl border p-4 flex gap-3 cursor-pointer hover:shadow-sm transition-all',
                  !notification.isRead && 'border-primary/30 bg-primary/5'
                )}
              >
                <div className={cn('w-10 h-10 rounded-full flex items-center justify-center shrink-0', iconColor)}>
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn('text-sm', !notification.isRead && 'font-semibold')}>
                      {notification.title}
                    </p>
                    {!notification.isRead && (
                      <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notification.message}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs text-muted-foreground">{timeAgo(notification.createdAt)}</span>
                    {notification.relatedReport && (
                      <Link
                        href={`/reports/${notification.relatedReport._id || notification.relatedReport}`}
                        onClick={e => e.stopPropagation()}
                        className="text-xs text-primary hover:underline"
                      >
                        View report →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
