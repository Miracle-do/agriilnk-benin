import { useState, useEffect, useRef } from "react";
import {
  collection, query, where, orderBy, onSnapshot,
  addDoc, serverTimestamp, doc, updateDoc, or
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import type { Message } from "@/types";
import { Send, ArrowLeft } from "lucide-react";
import { useSearchParams } from "react-router-dom";

interface Conversation {
  userId: string;
  userName: string;
  lastMessage: string;
  unread: number;
}

export default function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUser, setSelectedUser] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [searchParams] = useSearchParams();

useEffect(() => {
  const userId = searchParams.get("userId");
  const userName = searchParams.get("userName");
  if (userId && userName) {
    setSelectedUser({ userId, userName, lastMessage: "", unread: 0 });
  }
}, [searchParams]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "messages"),
      or(
        where("senderId", "==", user.id),
        where("receiverId", "==", user.id)
      ),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Message[];

      const convMap = new Map<string, Conversation>();
      msgs.forEach((msg) => {
        const otherId = msg.senderId === user.id ? msg.receiverId : msg.senderId;
        const otherName = msg.senderId === user.id ? msg.receiverId : msg.senderName;
        if (!convMap.has(otherId)) {
          convMap.set(otherId, {
            userId: otherId,
            userName: otherName,
            lastMessage: msg.content,
            unread: !msg.read && msg.receiverId === user.id ? 1 : 0,
          });
        } else {
          const conv = convMap.get(otherId)!;
          if (!msg.read && msg.receiverId === user.id) {
            conv.unread += 1;
          }
        }
      });

      setConversations(Array.from(convMap.values()));
    });

    return unsubscribe;
  }, [user]);

  useEffect(() => {
    if (!user || !selectedUser) return;

    const q = query(
      collection(db, "messages"),
      or(
        where("senderId", "==", user.id),
        where("receiverId", "==", user.id)
      ),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() } as Message))
        .filter(
          (m) =>
            (m.senderId === user.id && m.receiverId === selectedUser.userId) ||
            (m.senderId === selectedUser.userId && m.receiverId === user.id)
        );

      setMessages(msgs);

      msgs.forEach(async (msg) => {
        if (!msg.read && msg.receiverId === user.id) {
          await updateDoc(doc(db, "messages", msg.id), { read: true });
        }
      });
    });

    return unsubscribe;
  }, [user, selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !selectedUser) return;

    await addDoc(collection(db, "messages"), {
      senderId: user.id,
      senderName: user.name,
      receiverId: selectedUser.userId,
      content: newMessage.trim(),
      read: false,
      createdAt: serverTimestamp(),
    });

    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-[#2D6A4F] mb-6">Messages</h1>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ height: "600px" }}>
        <div className="flex h-full">

          {/* Liste conversations */}
          <div className={`w-full md:w-80 border-r border-gray-100 flex flex-col ${selectedUser ? "hidden md:flex" : "flex"}`}>
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-700">Conversations</h2>
            </div>

            {conversations.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-center p-6">
                <div>
                  <span className="text-4xl">💬</span>
                  <p className="text-gray-400 text-sm mt-3">Aucune conversation</p>
                  <p className="text-gray-300 text-xs mt-1">Contactez un vendeur depuis la marketplace</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                {conversations.map((conv) => (
                  <button
                    key={conv.userId}
                    onClick={() => setSelectedUser(conv)}
                    className={`w-full p-4 text-left flex items-center gap-3 hover:bg-gray-50 transition border-b border-gray-50 ${
                      selectedUser?.userId === conv.userId ? "bg-[#D8F3DC]" : ""
                    }`}
                  >
                    <div className="w-10 h-10 bg-[#D8F3DC] rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg">👤</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm truncate">{conv.userName}</p>
                      <p className="text-xs text-gray-400 truncate">{conv.lastMessage}</p>
                    </div>
                    {conv.unread > 0 && (
                      <span className="w-5 h-5 bg-[#2D6A4F] text-white text-xs rounded-full flex items-center justify-center flex-shrink-0">
                        {conv.unread}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Zone de chat */}
          {selectedUser ? (
            <div className="flex-1 flex flex-col">
              {/* Header chat */}
              <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="md:hidden text-gray-400 hover:text-gray-600"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="w-9 h-9 bg-[#D8F3DC] rounded-full flex items-center justify-center">
                  <span>👤</span>
                </div>
                <p className="font-semibold text-gray-800">{selectedUser.userName}</p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-400 text-sm mt-8">
                    Début de la conversation
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.senderId === user.id ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${
                          msg.senderId === user.id
                            ? "bg-[#2D6A4F] text-white rounded-br-sm"
                            : "bg-gray-100 text-gray-800 rounded-bl-sm"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-100 flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Écrire un message..."
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2D6A4F]"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="w-10 h-10 bg-[#2D6A4F] hover:bg-[#245a42] text-white rounded-xl flex items-center justify-center transition disabled:opacity-50"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="hidden md:flex flex-1 items-center justify-center text-center">
              <div>
                <span className="text-5xl">💬</span>
                <p className="text-gray-400 mt-3">Sélectionnez une conversation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}