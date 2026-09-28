"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { createPortal } from "react-dom";
import {
  Check,
  Globe2,
  MessageCircle,
  Search,
  Send,
  UserRoundCheck,
  X,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { socialGateway } from "@/lib/social-gateway";
import { apiMode } from "@/lib/config";
import { subscribeToInvalidation } from "@/lib/realtime-client";
import { mergeMessages, shouldFollowMessages } from "@/lib/chat-state";
import type { Account } from "@/lib/app-types";
import type {
  DirectMessage,
  SocialInbox,
  SocialUser,
  WorldMessage,
} from "@/lib/social-types";
import type { Navigate } from "@/components/site/types";

type Props = {
  user: Account;
  initialPeerId?: number | null;
  close: () => void;
  go: Navigate;
};
type ChatMessage = DirectMessage | WorldMessage;
const emptyInbox: SocialInbox = {
  realtimeTopic: "",
  friends: [],
  incoming: [],
  outgoing: [],
  unreadCount: 0,
};

export default function SocialPanel({ user, initialPeerId, close, go }: Props) {
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<"messages" | "friends">("messages");
  const [inbox, setInbox] = useState(emptyInbox);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SocialUser[]>([]);
  const [room, setRoom] = useState<number | "world" | null>(
    initialPeerId ?? null,
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [olderBusy, setOlderBusy] = useState(false);
  const [hasOlder, setHasOlder] = useState(false);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const panelRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const sendLock = useRef(false);
  const follow = useRef(true);
  const prepend = useRef<{ height: number; top: number } | null>(null);
  const refreshRef = useRef<() => void>(() => undefined);
  const contextRef = useRef<string | null>(null);
  const roomRef = useRef(room);
  roomRef.current = room;
  const closeRef = useRef(close);
  closeRef.current = close;

  useEffect(() => {
    setMounted(true);
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeRef.current();
      if (event.key !== "Tab") return;
      const elements = Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(
          'button:not(:disabled), input:not(:disabled), [tabindex="0"]',
        ) ?? [],
      );
      const first = elements[0],
        last = elements.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
      previous?.focus({ preventScroll: true });
    };
  }, []);
  useEffect(() => {
    if (mounted)
      panelRef.current
        ?.querySelector<HTMLButtonElement>("button:not(:disabled)")
        ?.focus({ preventScroll: true });
  }, [mounted]);
  useEffect(() => {
    const viewport = window.visualViewport;
    let frame = 0;
    const resize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!overlayRef.current) return;
        overlayRef.current.style.height = `${viewport?.height ?? window.innerHeight}px`;
        overlayRef.current.style.top = `${viewport?.offsetTop ?? 0}px`;
      });
    };
    resize();
    viewport?.addEventListener("resize", resize);
    viewport?.addEventListener("scroll", resize);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(frame);
      viewport?.removeEventListener("resize", resize);
      viewport?.removeEventListener("scroll", resize);
      window.removeEventListener("resize", resize);
    };
  }, [mounted]);
  useEffect(() => {
    setRoom(initialPeerId ?? null);
  }, [initialPeerId]);

  // One refresh scheduler for both realtime invalidation and network fallback.
  useEffect(() => {
    if (apiMode !== "production") {
      setLoading(false);
      return;
    }
    let active = true,
      running = false,
      queued = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const context = `${user.id}:${room}`;
    const changed = contextRef.current !== context;
    contextRef.current = context;
    let initial = true;
    if (changed) {
      setMessages([]);
      setDraft("");
      setHasOlder(false);
      follow.current = true;
      prepend.current = null;
    }
    setError("");
    setLoading(true);
    const refresh = async () => {
      if (!active || document.visibilityState !== "visible") return;
      if (running) {
        queued = true;
        return;
      }
      running = true;
      try {
        const value = await socialGateway.inbox();
        if (!active) return;
        setInbox(value);
        if (room !== null) {
          const page =
            room === "world"
              ? await socialGateway.world()
              : { items: await socialGateway.messages(room), hasMore: false };
          if (!active) return;
          const firstLoad = initial;
          setMessages((current) => {
            const latest = page.items;
            if (!latest.length || (firstLoad && changed)) return latest;
            // Preserve history while replacing the latest window (including hidden world posts).
            const oldest = latest[0]?.id ?? Infinity;
            return mergeMessages(
              current.filter((item) => item.id < oldest),
              latest,
            );
          });
          if (initial)
            setHasOlder(
              room === "world" ? page.hasMore : page.items.length === 50,
            );
        }
        initial = false;
        setError("");
        window.dispatchEvent(new Event("viufilm3d:social-updated"));
      } catch (cause) {
        if (active)
          setError(
            cause instanceof Error
              ? cause.message
              : "Chưa thể đồng bộ mật thư. Hãy thử lại.",
          );
      } finally {
        running = false;
        if (active) {
          setLoading(false);
          if (queued) {
            queued = false;
            schedule();
          }
        }
      }
    };
    const schedule = () => {
      clearTimeout(timer);
      timer = setTimeout(() => void refresh(), 250);
    };
    refreshRef.current = schedule;
    void refresh();
    const unsubscribeWorld =
      room === "world"
        ? subscribeToInvalidation("world:discussion", schedule)
        : () => undefined;
    const fallback = setInterval(() => void refresh(), 20000);
    document.addEventListener("visibilitychange", schedule);
    return () => {
      active = false;
      refreshRef.current = () => undefined;
      unsubscribeWorld();
      clearTimeout(timer);
      clearInterval(fallback);
      document.removeEventListener("visibilitychange", schedule);
    };
  }, [room, user.id, revision]);

  useEffect(() => {
    if (!inbox.realtimeTopic) return;
    return subscribeToInvalidation(inbox.realtimeTopic, () =>
      refreshRef.current(),
    );
  }, [inbox.realtimeTopic]);

  useEffect(() => {
    if (query.trim().length < 2 || apiMode !== "production") {
      setResults([]);
      return;
    }
    let active = true;
    const timer = setTimeout(
      () =>
        void socialGateway.search(query.trim()).then(
          (value) => {
            if (active)
              setResults(value.filter((person) => person.id !== user.id));
          },
          () => {
            if (active) setResults([]);
          },
        ),
      300,
    );
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query, user.id]);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    if (prepend.current) {
      list.scrollTop =
        prepend.current.top + list.scrollHeight - prepend.current.height;
      prepend.current = null;
    } else if (follow.current) list.scrollTop = list.scrollHeight;
  }, [messages]);

  const older = async () => {
    if (olderBusy || room === null || !messages.length) return;
    const target = room;
    setOlderBusy(true);
    try {
      const page =
        target === "world"
          ? await socialGateway.world(messages[0].id)
          : {
              items: await socialGateway.messages(target, messages[0].id),
              hasMore: false,
            };
      if (roomRef.current !== target) return;
      if (listRef.current)
        prepend.current = {
          height: listRef.current.scrollHeight,
          top: listRef.current.scrollTop,
        };
      setMessages((current) => mergeMessages(current, page.items));
      setHasOlder(target === "world" ? page.hasMore : page.items.length === 50);
    } catch {
      setError("Chưa thể tải thư cũ.");
    } finally {
      setOlderBusy(false);
    }
  };
  const act = async (id: number, action: "accept" | "remove") => {
    if (sendLock.current) return;
    sendLock.current = true;
    setBusy(true);
    setError("");
    try {
      if (action === "accept") await socialGateway.accept(id);
      else await socialGateway.remove(id);
      setInbox(await socialGateway.inbox());
    } catch {
      setError("Chưa thể cập nhật lời mời kết giao.");
    } finally {
      sendLock.current = false;
      setBusy(false);
    }
  };
  const send = async (event: FormEvent) => {
    event.preventDefault();
    const body = draft.trim(),
      target = room;
    if (target === null || !body || sendLock.current) return;
    sendLock.current = true;
    setBusy(true);
    setError("");
    try {
      const message =
        target === "world"
          ? await socialGateway.sendWorld(body)
          : await socialGateway.sendMessage(target, body);
      if (roomRef.current === target) {
        follow.current = true;
        setMessages((current) => mergeMessages(current, [message]));
        setDraft((current) => (current.trim() === body ? "" : current));
      }
    } catch (cause) {
      if (roomRef.current === target)
        setError(
          cause instanceof Error ? cause.message : "Chưa thể gửi mật thư.",
        );
    } finally {
      sendLock.current = false;
      setBusy(false);
    }
  };
  const openProfile = (person: SocialUser) => {
    if (person.publicId) {
      close();
      go(`/nguoi-dung/${person.publicId}`);
    }
  };
  const avatar = (person: SocialUser) => (
    <UserAvatar
      frameId={person.avatarFrameId}
      cultivationXp={person.cultivationXp}
      avatarId={person.avatarId}
      avatarVersion={person.avatarVersion}
      userId={person.id}
      name={person.name}
    />
  );
  const friend = inbox.friends.find((link) => link.user.id === room)?.user;
  if (!mounted) return null;
  return createPortal(
    <div ref={overlayRef} className="social-overlay" onClick={() => close()}>
      <aside
        ref={panelRef}
        className="social-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Đạo hữu — Mật thư và Bằng hữu"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="social-panel-head">
          {room !== null && (
            <button
              onClick={() => setRoom(null)}
              aria-label="Về danh sách đạo hữu"
            >
              <ArrowLeft size={19} />
            </button>
          )}
          <div className="social-head-title">
            <strong>
              {room === "world"
                ? "Thế Giới — Luận Đạo"
                : room !== null
                  ? (friend?.name ?? "Mật thư")
                  : "Đạo Hữu Các"}
            </strong>
            <small>
              {room === "world"
                ? "Kênh chung toàn server · không phải mật thư"
                : room !== null
                  ? "Mật thư giữa bằng hữu"
                  : "Kết giao bằng hữu · trao lời luận đạo"}
            </small>
          </div>
          <button
            onClick={() => setRevision((value) => value + 1)}
            aria-label="Đồng bộ lại"
            disabled={loading}
          >
            <RefreshCw size={17} />
          </button>
          <button onClick={close} aria-label="Đóng cửa sổ">
            <X size={19} />
          </button>
        </header>
        {apiMode !== "production" ? (
          <p className="social-empty">
            Đạo Hữu Các cần kết nối hệ thống thật để truyền mật thư.
          </p>
        ) : room !== null ? (
          <>
            <div
              ref={listRef}
              className="social-messages"
              aria-busy={loading}
              onScroll={(event) => {
                const node = event.currentTarget;
                follow.current = shouldFollowMessages(
                  node.scrollTop,
                  node.scrollHeight,
                  node.clientHeight,
                );
              }}
            >
              {hasOlder && (
                <button
                  className="social-older"
                  disabled={olderBusy}
                  onClick={() => void older()}
                >
                  {olderBusy ? "Đang tìm thư cũ…" : "Xem lời trao đổi trước"}
                </button>
              )}
              {loading && !messages.length ? (
                <p className="social-empty">Đang đồng bộ truyền âm…</p>
              ) : (
                messages.map((message) => (
                  <article
                    key={message.id}
                    className={`social-bubble ${message.senderId === user.id ? "mine" : ""}`}
                  >
                    {"author" in message && (
                      <button
                        className="social-message-author"
                        onClick={() => openProfile(message.author)}
                      >
                        {avatar(message.author)}
                        <strong>{message.author.name}</strong>
                      </button>
                    )}
                    <p>{message.body}</p>
                    <time>
                      {new Date(message.createdAt).toLocaleString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        day: "2-digit",
                        month: "2-digit",
                      })}
                    </time>
                  </article>
                ))
              )}
              {!loading && !messages.length && !error && (
                <p className="social-empty">
                  {room === "world"
                    ? "Chưa có lời luận đạo. Đạo hữu hãy khai lời đầu tiên."
                    : "Gửi lời chào đến bằng hữu của đạo hữu."}
                </p>
              )}
            </div>
            <form className="social-compose" onSubmit={send}>
              <input
                maxLength={1000}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={
                  room === "world"
                    ? "Luận đạo cùng toàn server…"
                    : "Viết mật thư…"
                }
                aria-label="Nội dung truyền âm"
                disabled={busy}
              />
              <button
                disabled={loading || busy || !draft.trim()}
                aria-label="Gửi truyền âm"
              >
                <Send size={18} />
              </button>
            </form>
          </>
        ) : (
          <>
            <div
              className="social-tabs"
              role="tablist"
              aria-label="Đạo Hữu Các"
            >
              <button
                role="tab"
                aria-selected={tab === "messages"}
                className={tab === "messages" ? "active" : ""}
                onClick={() => setTab("messages")}
              >
                <MessageCircle size={17} /> Mật thư
                {inbox.unreadCount > 0 && <b>{inbox.unreadCount}</b>}
              </button>
              <button
                role="tab"
                aria-selected={tab === "friends"}
                className={tab === "friends" ? "active" : ""}
                onClick={() => setTab("friends")}
              >
                <UserRoundCheck size={17} /> Bằng hữu
                {inbox.incoming.length > 0 && <b>{inbox.incoming.length}</b>}
              </button>
            </div>
            <label className="social-search">
              <Search size={17} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm đạo hữu theo đạo danh…"
                aria-label="Tìm đạo hữu"
              />
            </label>
            <div className="social-list">
              {tab === "messages" && query.trim().length < 2 && (
                <button
                  className="social-person social-world"
                  onClick={() => setRoom("world")}
                >
                  <span className="social-world-icon">
                    <Globe2 size={25} />
                  </span>
                  <span>
                    <strong>Thế Giới — Luận Đạo</strong>
                    <small>Kênh chung · cùng đạo hữu đàm đạo</small>
                  </span>
                </button>
              )}
              {query.trim().length >= 2 ? (
                results.length ? (
                  results.map((person) => (
                    <button
                      key={person.id}
                      className="social-person"
                      onClick={() => openProfile(person)}
                    >
                      {avatar(person)}
                      <span>
                        <strong>{person.name}</strong>
                        <small>{person.bio || "Xem động phủ"}</small>
                      </span>
                    </button>
                  ))
                ) : (
                  <p className="social-empty">Chưa tìm thấy đạo hữu.</p>
                )
              ) : loading ? (
                <p className="social-empty">Đang tìm bằng hữu…</p>
              ) : tab === "friends" ? (
                <>
                  {inbox.incoming.length > 0 && <h3>Lời mời kết giao</h3>}
                  {inbox.incoming.map((link) => (
                    <div className="social-person" key={link.id}>
                      {avatar(link.user)}
                      <span>
                        <strong>{link.user.name}</strong>
                        <small>Muốn kết giao cùng đạo hữu</small>
                      </span>
                      <button
                        className="social-action"
                        disabled={busy}
                        onClick={() => void act(link.id, "accept")}
                        aria-label={`Chấp nhận ${link.user.name}`}
                      >
                        <Check size={17} />
                      </button>
                      <button
                        className="social-action"
                        disabled={busy}
                        onClick={() => void act(link.id, "remove")}
                        aria-label={`Từ chối ${link.user.name}`}
                      >
                        <X size={17} />
                      </button>
                    </div>
                  ))}
                  {inbox.friends.length > 0 && <h3>Bằng hữu</h3>}
                  {inbox.friends.map((link) => (
                    <button
                      className="social-person"
                      key={link.id}
                      onClick={() => openProfile(link.user)}
                    >
                      {avatar(link.user)}
                      <span>
                        <strong>{link.user.name}</strong>
                        <small>Xem động phủ</small>
                      </span>
                    </button>
                  ))}
                  {inbox.outgoing.length > 0 && <h3>Lời mời đã gửi</h3>}
                  {inbox.outgoing.map((link) => (
                    <div className="social-person" key={link.id}>
                      {avatar(link.user)}
                      <span>
                        <strong>{link.user.name}</strong>
                        <small>Đang chờ hồi âm</small>
                      </span>
                      <button
                        className="social-action"
                        disabled={busy}
                        onClick={() => void act(link.id, "remove")}
                        aria-label={`Thu hồi lời mời ${link.user.name}`}
                      >
                        <X size={17} />
                      </button>
                    </div>
                  ))}
                  {!inbox.incoming.length &&
                    !inbox.friends.length &&
                    !inbox.outgoing.length && (
                      <p className="social-empty">
                        Chưa có bằng hữu. Hãy tìm đạo hữu để kết giao.
                      </p>
                    )}
                </>
              ) : (
                <>
                  {inbox.friends.map((link) => (
                    <button
                      className="social-person"
                      key={link.id}
                      onClick={() => setRoom(link.user.id)}
                    >
                      {avatar(link.user)}
                      <span>
                        <strong>{link.user.name}</strong>
                        <small>Truyền mật thư</small>
                      </span>
                    </button>
                  ))}
                  {!inbox.friends.length && (
                    <p className="social-empty">
                      Kết giao bằng hữu để truyền mật thư riêng tư, hoặc vào Thế
                      Giới để luận đạo.
                    </p>
                  )}
                </>
              )}
            </div>
          </>
        )}
        {error && (
          <p className="social-error" role="status">
            {error}
          </p>
        )}
        <footer className="social-panel-foot">
          <UserAvatar
            frameId={user.avatarFrameId}
            cultivationXp={user.cultivationXp}
            avatarId={user.avatarId}
            avatarVersion={user.avatarVersion}
            userId={user.id}
            name={user.name}
            size="small"
          />
          <span>
            {user.name}
            <small>Đạo hữu ViuFilm3D</small>
          </span>
        </footer>
      </aside>
    </div>,
    document.body,
  );
}
