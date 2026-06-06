import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: "message" | "commande" | "info",
  link?: string
) => {
  await addDoc(collection(db, "notifications"), {
    userId,
    title,
    message,
    type,
    link: link || "",
    read: false,
    createdAt: serverTimestamp(),
  });
};