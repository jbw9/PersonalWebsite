import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Shell, Rise, Label } from "../pages/shared";
import { HOME, Resume } from "../contracts";
import { ERAS, NOW, Era } from "./eras";

const snapshot = (id: string) => `/snapshots/${id}/`;

// The old site, full screen, under a thin bar that says when it's from and what's changed since.
// Portalled: inside the shell it would sit under the shell's fixed back button.
const Viewer = ({ era, onClose }: { era: Era; onClose: () => void }) => {
  const [notes, setNotes] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);
  return createPortal(
    <div className="v-remix fixed inset-0 z-[100] flex flex-col">
      <div className="shrink-0 flex items-center gap-3 md:gap-5 px-3 md:px-5 h-12 border-b border-[#e6ecf5]/10 rx-mono text-[10.5px]">
        <button onClick={onClose} className="flex items-center gap-1.5 text-[#8692a8] hover:text-[#e6ecf5] transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.75} />
          <span className="hidden sm:inline">all versions</span>
        </button>
        <span className="text-[#e6ecf5] whitespace-nowrap">
          {era.from} — {era.to}
        </span>
        <span className="hidden md:inline text-[#5d687c]">as of {era.taken}</span>
        <div className="ml-auto flex items-center gap-3 md:gap-5">
          <button onClick={() => setNotes((n) => !n)} className="text-[#5b9cff] hover:text-[#bcd7ff] transition-colors whitespace-nowrap">
            {notes ? "hide" : <>what's changed<span className="hidden sm:inline"> since</span></>}
          </button>
          <a href={snapshot(era.id)} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[#8692a8] hover:text-[#e6ecf5] transition-colors">
            <span className="hidden sm:inline">new tab</span>
            <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.75} />
          </a>
        </div>
      </div>
      {notes && (
        <ul className="shrink-0 px-4 md:px-5 py-3 space-y-1 border-b border-[#e6ecf5]/10 text-[14px] text-[#c2cbdb] bg-[#0a0f1a]">
          {era.since.map((s) => (
            <li key={s}>
              <span className="text-[#5b9cff] mr-2">▸</span>
              {s}
            </li>
          ))}
        </ul>
      )}
      <iframe key={era.id} src={snapshot(era.id)} title={`Jonathan's site, ${era.from} to ${era.to}`} className="flex-1 w-full border-0 bg-white" />
    </div>,
    document.body
  );
};

const Card = ({ img, from, to, look, onClick, href }: { img: string; from: string; to: string; look: string; onClick?: () => void; href?: string }) => {
  const body = (
    <>
      <div className="md:hidden rx-mono text-[10.5px] text-[#8692a8] mb-2.5">
        {from} — {to}
      </div>
      <img
        src={img}
        alt={`The site from ${from} to ${to}`}
        loading="lazy"
        className="w-full aspect-[16/10] object-cover object-top rounded-xl border border-[#e6ecf5]/15 group-hover:border-[#5b9cff]/70 group-hover:-translate-y-1 transition-all duration-300"
      />
      <div className="mt-3 text-[15px] text-[#8692a8] group-hover:text-[#c2cbdb] leading-snug transition-colors">{look}</div>
    </>
  );
  return href ? (
    <Link to={href} className="group block text-left">
      {body}
    </Link>
  ) : (
    <button onClick={onClick} className="group block w-full text-left">
      {body}
    </button>
  );
};

const Wayback = () => {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  // Opening and closing a version replace the entry, and back goes straight home: browser history here also
  // holds whatever the old site pushed inside its iframe, so "back" would land in it or reopen the viewer
  const show = (v?: string) => setParams(v ? { v } : {}, { replace: true });
  const home = () => navigate(HOME, { state: { resume: { section: "involvement" } } satisfies Resume });
  const open = ERAS.find((e) => e.id === params.get("v"));
  const stops = [...ERAS.map((e) => ({ from: e.from, to: e.to })), { from: NOW.from, to: "now" }];

  return (
    <Shell section="involvement" onBack={home}>
      <section className="px-5 md:px-10 pt-28 md:pt-36 max-w-[1280px] mx-auto">
        <Rise>
          <Label>wayback machine</Label>
          <h1 className="mt-5 text-[clamp(2.6rem,5.5vw,4.6rem)] italic font-light leading-[0.98]">Every version of this site.</h1>
          <p className="mt-5 max-w-xl text-[1.15rem] md:text-[1.25rem] text-[#c2cbdb] leading-snug">
            Rebuilt from the git history and frozen as they were. Some old dates were wrong; each one says what's changed since.
          </p>
        </Rise>

        <Rise d={0.15} className="mt-16 md:mt-24">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-0">
            {ERAS.map((e) => (
              <div key={e.id} className="md:px-3">
                <Card img={`/wayback-previews/${e.id}.jpg`} from={e.from} to={e.to} look={e.look} onClick={() => show(e.id)} />
              </div>
            ))}
            <div className="md:px-3">
              <Card img="/og.jpg" from={NOW.from} to="now" look={NOW.look} href="/" />
            </div>
          </div>

          {/* the reel's timeline: one stop under each version */}
          <div className="hidden md:grid grid-cols-4 mt-10 relative">
            <div className="absolute left-0 right-0 top-[5px] h-px bg-gradient-to-r from-[#8692a8]/0 via-[#8692a8]/40 to-[#5b9cff]" />
            {stops.map((s, i) => (
              <div key={s.from} className="relative flex flex-col items-center">
                <span className={`w-[11px] h-[11px] rounded-full border ${i === stops.length - 1 ? "bg-[#5b9cff] border-[#5b9cff] shadow-[0_0_14px_3px_rgba(91,156,255,0.5)]" : "bg-[#070b14] border-[#e6ecf5]/40"}`} />
                <span className="mt-3 rx-mono text-[10.5px] text-[#8692a8] whitespace-nowrap">
                  {s.from} — {s.to}
                </span>
              </div>
            ))}
          </div>
        </Rise>
      </section>
      {open && <Viewer era={open} onClose={() => show()} />}
    </Shell>
  );
};

export default Wayback;
