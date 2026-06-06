import { useState, useEffect, useRef } from "react";
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "message" | "commande" | "info";
  link: string;
  read: boolean;
  createdAt: unknown;
}

export default function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.id),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Notification[];
      setNotifications(data.slice(0, 20));
    });

    return unsubscribe;
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    for (const notif of unread) {
      await updateDoc(doc(db, "notifications", notif.id), { read: true });
    }
  };

  const handleClick = async (notif: Notification) => {
    await updateDoc(doc(db, "notifications", notif.id), { read: true });
    setOpen(false);
    if (notif.link) navigate(notif.link);
  };

  const getIcon = (type: string) => {
    if (type === "message") return "💬";
    if (type === "commande") return "🛒";
    return "ℹ️";
  };

  if (!user) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setOpen(!open); if (!open) markAllRead(); }}
        className="relative p-2 text-gray-500 hover:text-[#2D6A4F] transition"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-[#2D6A4F] hover:underline"
              >
                Tout marquer lu
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <span className="text-3xl">🔔</span>
                <p className="text-gray-400 text-sm mt-2">Aucune notification</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => handleClick(notif)}
                  className={`w-full p-4 text-left flex gap-3 hover:bg-gray-50 transition border-b border-gray-50 ${
                    !notif.read ? "bg-[#F8FAF5]" : ""
                  }`}
                >
                  <span className="text-xl flex-shrink-0">{getIcon(notif.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">{notif.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{notif.message}</p>
                  </div>
                  {!notif.read && (
                    <div className="w-2 h-2 bg-[#2D6A4F] rounded-full mt-1.5 flex-shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}