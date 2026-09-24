import { MessagesSquare } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Messages" };

export default function MessagesIndex() {
  return (
    <div className="conv-placeholder panel">
      <div className="empty">
        <div className="e-ico">
          <MessagesSquare size={28} />
        </div>
        <h3>Choisis une conversation</h3>
        <p>Les messages sont modérés : les demandes d&apos;argent et les propos déplacés sont détectés automatiquement.</p>
      </div>
    </div>
  );
}
