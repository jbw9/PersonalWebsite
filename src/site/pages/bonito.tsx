import { CSSProperties, RefObject, useEffect, useRef, useState } from "react";

// The live build from github.com/jbw9/bonito-tv. Its launcher takes messages from any parent
// and posts back with '*', so it embeds cross-origin with nothing copied over.
const BASE = "https://jbw9.github.io/bonito-tv/";

// The iframes load once they're near the viewport, not with the page
const useSeen = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setOn(true);
          obs.disconnect();
        }
      },
      { rootMargin: "200px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, on] as const;
};

// Listens for messages from one iframe only
const useFrameMessages = (frame: RefObject<HTMLIFrameElement>, on: (data: any) => void) => {
  const handler = useRef(on);
  handler.current = on;
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.source === frame.current?.contentWindow && e.data) handler.current(e.data);
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [frame]);
};

const Tv = ({ src, title, frame, live }: { src: string | null; title: string; frame: RefObject<HTMLIFrameElement>; live?: boolean }) => (
  <div className="bonito-bezel">
    <div className="bonito-glass">
      {src && (
        <iframe
          ref={frame}
          src={src}
          title={title}
          tabIndex={live ? 0 : -1}
          className={live ? "" : "pointer-events-none"}
          onLoad={(e) => e.currentTarget.classList.add("on")}
        />
      )}
    </div>
  </div>
);

/** The real launcher, driven by the keyboard or by the real phone remote beside it. */
export const BonitoLive = () => {
  const [ref, seen] = useSeen();
  const tv = useRef<HTMLIFrameElement>(null);
  const [room, setRoom] = useState<string | null>(null);
  // The TV says which room it's in; the phone joins it
  useFrameMessages(tv, (d) => d.room && setRoom(d.room));

  return (
    <div ref={ref}>
      <div className="bonito-room">
        <Tv src={seen ? `${BASE}app/?demo` : null} title="Bonito, running live" frame={tv} live />
        <div className="bonito-phone">
          {room && <iframe src={`${BASE}jam/?room=${room}#remote`} title="Bonito's phone remote, joined to the TV" />}
        </div>
      </div>
      <p className="mt-5 text-[1.05rem] leading-relaxed text-[#8692a8]">
        That's the real launcher and the real phone app, both live. Use the phone to drive the TV, or click the screen and use the arrow
        keys, Enter and Esc. The streaming apps only open on a real TV.
      </p>
    </div>
  );
};

type Player = { id: string; name: string; color: string; rows?: string[]; solved?: boolean };
type Snapshot = {
  game: string;
  state: { mode: string; players: Player[]; word?: string; left?: number | null } | null;
  typing: Record<string, { words: string[]; draft: string } | undefined>;
};

const KEYROWS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
const RANK = "apc"; // absent < present < correct, for colouring the keyboard
const cap = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

// One bot's phone: its own letters, which only its phone knows; the TV shows colours
const WordlePhone = ({ p, snap }: { p: Player; snap: Snapshot }) => {
  const st = snap.state!;
  const rows = p.rows || [];
  const typed = snap.typing[p.id] || { words: [], draft: "" };
  const best: Record<string, string> = {};
  const cells = [];
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 5; c++) {
      const done = r < rows.length;
      const ch = done ? (typed.words[r] || "")[c] : r === rows.length ? typed.draft[c] : "";
      if (done && ch && RANK.indexOf(rows[r][c]) > RANK.indexOf(best[ch])) best[ch] = rows[r][c];
      cells.push(
        <i key={r * 5 + c} className={done ? rows[r][c] : ch ? "ty" : ""}>
          {ch || ""}
        </i>
      );
    }
  }
  const msg = st.word
    ? `The word was ${st.word}`
    : p.solved
    ? `Got it in ${rows.length}!`
    : rows.length === 6
    ? "Out of guesses"
    : st.left != null
    ? `${Math.floor(st.left / 60)}:${String(st.left % 60).padStart(2, "0")} left`
    : "";

  return (
    <div className="bonito-hand" style={{ "--seat": p.color } as CSSProperties}>
      <div className="who">
        <i />
        <span>{cap(p.name)}'s phone</span>
      </div>
      <div className="body">
        <div className="scr">
          {st.mode === "lobby" ? (
            <div className="wait">
              <i />
              <div className="t">You're in, {cap(p.name)}</div>
              <div className="s">Waiting for everyone</div>
            </div>
          ) : (
            <>
              <div className="t">Wordle race</div>
              <div className="grid">{cells}</div>
              <div className="msg">{msg}</div>
              <div className="keys">
                {KEYROWS.map((row) => (
                  <div key={row}>
                    {row.split("").map((k) => (
                      <i key={k} className={best[k] || ""} />
                    ))}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/** Wordle Race playing itself: pretend friends on pretend phones, the real game on the TV. */
export const BonitoWordle = () => {
  const [ref, seen] = useSeen();
  const tv = useRef<HTMLIFrameElement>(null);
  const [snap, setSnap] = useState<Snapshot | null>(null);
  useFrameMessages(tv, (d) => d.show?.game === "wordle" && setSnap(d.show));

  return (
    <div ref={ref}>
      <p className="-mt-3 mb-7 text-[1.2rem] leading-relaxed text-[#8692a8]">
        Everyone gets the same word. Your letters stay on your phone and the TV shows only colours, so nobody can copy. Nobody's touching
        anything here: that's the real game, played by bots typing on their own phones.
      </p>
      <Tv src={seen ? `${BASE}app/?show=wordle` : null} title="Bonito playing Wordle Race by itself" frame={tv} />
      <div className="bonito-hands" aria-hidden="true">
        {snap?.state?.players?.map((p) => <WordlePhone key={p.id} p={p} snap={snap} />)}
      </div>
    </div>
  );
};
