import { Notification } from '../../models/Notification';
import { env } from '../../config/env';
import { sendMail } from '../../utils/mailer';

/** Create an in-CRM notification (+ optional admin email). Never throws. */
export async function notify(type: string, title: string, message?: string, link?: string) {
  try {
    await Notification.create({ type, title, message, link });
    if (env.ADMIN_NOTIFY_EMAIL) {
      void sendMail({
        to: env.ADMIN_NOTIFY_EMAIL,
        subject: title,
        text: `${title}\n${message ?? ''}`,
      });
    }
  } catch {
    /* notifications are best-effort */
  }
}

export function listNotifications(unreadOnly = false) {
  return Notification.find(unreadOnly ? { read: false } : {})
    .sort('-createdAt')
    .limit(50);
}
export function unreadCount() {
  return Notification.countDocuments({ read: false });
}
export async function markRead(id: string) {
  await Notification.findByIdAndUpdate(id, { read: true });
}
export async function markAllRead() {
  await Notification.updateMany({ read: false }, { read: true });
}
