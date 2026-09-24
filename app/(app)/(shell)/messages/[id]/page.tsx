import type { Metadata } from "next";
import ConversationView from "./conversation-view";

export const metadata: Metadata = { title: "Conversation" };

export default function ConversationPage() {
  return <ConversationView />;
}
