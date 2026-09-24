"use client";

import { ArrowLeft, Ban, Check, CheckCheck, Flag, Info, Lightbulb, MoreVertical, SendHorizontal, ShieldAlert, UserMinus, UserRound } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Fragment, useEffect, useRef, useState } from "react";
import { BlockModal, ReportModal } from "@/components/dialogs";
import { Empty, Verified } from "@/components/ui/bits";
import { Modal } from "@/components/ui/modal";
import ProfilePhoto from "@/components/ui/photo";
import { ScoreChip } from "@/components/ui/score";
import { toast } from "@/components/ui/toaster";
import { api } from "@/lib/api";
import { STAGES } from "@/lib/config";
import { dayLabel, presence, timeHM } from "@/lib/format";
import { useNow, useQuery, useSession } from "@/lib/hooks";
import { ICE_BREAKERS, dailyQuestion } from "@/lib/profile-utils";

export default function ConversationView() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const me = session?.profile;
  const { data: conv, loading } = useQuery(`conversation:${id}`, () => api.getConversation(id));
  const now = useNow(conv?.typingUntil ? 400 : 30_000);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [ideas, setIdeas] = useState(false);
  const [menu, setMenu] = useState(false);
  const [report, setReport] = useState(false);
  const [block, setBlock] = useState(false);
  const [unmatch, setUnmatch] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const count = conv?.messages.length ?? 0;
  const typing = !!conv?.typingUntil && now >= conv.typingUntil - 2600;

  useEffect(() => {
    if (!conv) return;
    const unread = conv.messages.some((m) => m.from !== me?.id && !m.readAt);
    if (unread) api.markRead(id);
  }, [conv, id, me?.id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: count > 0 ? "smooth" : "auto", block: "end" });
  }, [count, typing]);

  if (!me) return null;
  if (loading && !conv) return <div className="conv-placeholder panel" />;
  if (!conv)
    return (
      <div className="conv-placeholder panel">
        <Empty icon={UserRound} title="Conversation indisponible" text="Ce match a été retiré ou l'un de vous a bloqué l'autre.">
          <Link href="/messages" className="btn btn-primary btn-sm">
            Retour aux messages
          </Link>
        </Empty>
      </div>
    );

  const other = conv.other;
  const mineCount = conv.messages.filter((m) => m.from === me.id).length;
  const status = presence(other.lastActiveAt, other.gender);
  const flaggedFromOther = [...conv.messages].reverse().find((m) => m.from === other.id && (m.flags?.length ?? 0) > 0);
  const showIdeas = ideas || mineCount === 0;

  async function send(body = text) {
    const clean = body.trim();
    if (!clean || sending) return;
    setSending(true);
    const res = await api.sendMessage(id, clean);
    setSending(false);
    if (!res.ok) {
      toast({ title: "Message non envoyé", body: res.error, kind: res.code === "blocked" ? "warn" : "error" });
      return;
    }
    if (res.notice) toast({ title: "Conseil de sécurité", body: res.notice, kind: "info" });
    setText("");
    setIdeas(false);
    inputRef.current?.focus();
  }

  return (
    <div className="chat panel">
      <header className="chat-head">
        <button type="button" className="icon-btn plain chat-back" onClick={() => router.push("/messages")} aria-label="Retour aux conversations">
          <ArrowLeft size={20} />
        </button>
        <Link href={`/profile/${other.id}`} className="chat-who">
          <ProfilePhoto profile={other} size={44} round />
          <span>
            <span className="chat-name">
              <b>{other.firstName}</b> <Verified profile={other} />
            </span>
            <small className={typing ? "typing-label" : undefined}>
              {typing ? "écrit…" : status.online || conv.otherOnline ? "En ligne" : status.label}
            </small>
          </span>
        </Link>
        <span className="chat-score">
          <ScoreChip score={conv.compat.score} />
        </span>
        <div className="pf-menu">
          <button type="button" className="icon-btn plain" onClick={() => setMenu((m) => !m)} aria-label="Plus d'actions" aria-expanded={menu}>
            <MoreVertical size={19} />
          </button>
          {menu && (
            <div className="dropdown" onMouseLeave={() => setMenu(false)}>
              <Link href={`/profile/${other.id}`} onClick={() => setMenu(false)}>
                <UserRound size={16} /> Voir le profil
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMenu(false);
                  setReport(true);
                }}
              >
                <Flag size={16} /> Signaler
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenu(false);
                  setUnmatch(true);
                }}
              >
                <UserMinus size={16} /> Retirer le match
              </button>
              <button
                type="button"
                className="danger"
                onClick={() => {
                  setMenu(false);
                  setBlock(true);
                }}
              >
                <Ban size={16} /> Bloquer
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="stages" role="group" aria-label="Étape de la relation">
        {STAGES.map((s, i) => (
          <button
            key={s.label}
            type="button"
            className={`stage${i <= conv.match.stage ? " on" : ""}${i === conv.match.stage ? " current" : ""}`}
            onClick={() => api.setStage(id, i)}
            title={`Passer à l'étape : ${s.label}`}
          >
            <span className="st-ico">{s.icon}</span>
            <span className="st-lab">{s.short}</span>
          </button>
        ))}
      </div>

      {conv.warning && (
        <div className="alert alert-warn chat-warning">
          <ShieldAlert size={18} />
          <span>
            <b>Prudence.</b> {conv.warning}
          </span>
          {flaggedFromOther && (
            <button type="button" className="btn btn-danger btn-sm" onClick={() => setReport(true)}>
              <Flag size={14} /> Signaler
            </button>
          )}
        </div>
      )}

      <div className="chat-body">
        {conv.messages.length === 0 && (
          <div className="chat-intro">
            <ProfilePhoto profile={other} size={72} round />
            <p>
              <b>Vous vous êtes plu mutuellement.</b>
              <br />
              Commence par une vraie question : c&apos;est plus agréable qu&apos;un simple « salut ».
            </p>
          </div>
        )}
        {conv.messages.map((m, i) => {
          const mine = m.from === me.id;
          const prev = conv.messages[i - 1];
          const newDay = !prev || dayLabel(prev.createdAt) !== dayLabel(m.createdAt);
          return (
            <Fragment key={m.id}>
              {newDay && <div className="day-sep">{dayLabel(m.createdAt)}</div>}
              <div className={`bubble-row${mine ? " mine" : ""}`}>
                <div className={`bubble${mine ? " mine" : ""}${m.risk === "warn" && !mine ? " flagged" : ""}`}>
                  {m.risk === "warn" && !mine && (
                    <span className="flag-label">
                      <ShieldAlert size={13} /> {m.flags?.includes("argent") ? "Demande d'argent détectée" : "Contenu à risque détecté"}
                    </span>
                  )}
                  <span className="b-text">{m.text}</span>
                  <span className="b-meta">
                    {timeHM(m.createdAt)}
                    {mine && (m.readAt ? <CheckCheck size={14} className="read" aria-label="Lu" /> : <Check size={14} aria-label="Envoyé" />)}
                  </span>
                </div>
              </div>
            </Fragment>
          );
        })}
        {typing && (
          <div className="bubble-row">
            <div className="bubble typing" aria-label={`${other.firstName} écrit`}>
              <span />
              <span />
              <span />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {showIdeas && (
        <div className="ideas">
          <div className="ideas-head">
            <Lightbulb size={15} /> Idées pour lancer la conversation
          </div>
          <div className="ideas-list">
            <button type="button" className="idea" onClick={() => send(dailyQuestion())}>
              <small>Question du jour</small>
              {dailyQuestion()}
            </button>
            {ICE_BREAKERS.slice(0, 4).map((b) => (
              <button key={b.text} type="button" className="idea" onClick={() => send(b.text)}>
                <small>{b.theme}</small>
                {b.text}
              </button>
            ))}
          </div>
        </div>
      )}

      <form
        className="composer"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <button type="button" className={`icon-btn plain${ideas ? " on" : ""}`} onClick={() => setIdeas((v) => !v)} aria-label="Idées de messages" title="Idées de messages">
          <Lightbulb size={19} />
        </button>
        <textarea
          ref={inputRef}
          value={text}
          rows={1}
          maxLength={1000}
          placeholder={`Écris à ${other.firstName}…`}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
        />
        <button type="submit" className="send-btn" disabled={!text.trim() || sending} aria-label="Envoyer">
          <SendHorizontal size={19} />
        </button>
      </form>
      <p className="chat-foot">
        <Info size={12} /> Messages modérés automatiquement. Ne partage jamais d&apos;argent ni de codes.
      </p>

      <ReportModal
        profile={other}
        open={report}
        onClose={() => setReport(false)}
        messageId={flaggedFromOther?.id}
        onDone={() => router.push("/messages")}
      />
      <BlockModal profile={other} open={block} onClose={() => setBlock(false)} onDone={() => router.push("/messages")} />
      <Modal
        open={unmatch}
        onClose={() => setUnmatch(false)}
        title={`Retirer le match avec ${other.firstName} ?`}
        description="La conversation sera fermée pour vous deux. Cette action est définitive."
        footer={
          <>
            <button type="button" className="btn btn-ghost" onClick={() => setUnmatch(false)}>
              Annuler
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={async () => {
                await api.unmatch(id);
                setUnmatch(false);
                toast({ title: "Match retiré", kind: "info" });
                router.push("/messages");
              }}
            >
              Retirer le match
            </button>
          </>
        }
      />
    </div>
  );
}
