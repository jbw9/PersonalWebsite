import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { experiences } from "../../data";
import { projects } from "../../data/projects";
import { milestones } from "../../data/journey";

const slug = (s: string) => s.toLowerCase().replace(/\(.*?\)|,|\.|inc/g, "").trim().replace(/\s+/g, "-");

type Log = [tag: "ok" | "warn" | "raw", text: string];

const LOG: Log[] = [
  ["raw", "JonathanOS 26.10 — kernel 6.2.0-uiuc (jonathan@champaign) #1 SMP"],
  ["raw", "Command line: BOOT_IMAGE=/vmlinuz-jonathan root=/dev/curiosity ro quiet"],
  ["raw", "Memory: 3.90/4.00 GPA available"],
  ["ok", "Mounted /uiuc/cs"],
  ["ok", "Mounted /uiuc/econ"],
  ["raw", "Unmounting /finance-major … done"],
  ...milestones.filter((m) => !m.dip).slice(1, 6).map((m): Log => ["ok", `Reached target ${m.short}`]),
  ["warn", "NullPointerException in cs124/mp3 — recovered"],
  ...experiences
    .slice()
    .reverse()
    .map((x): Log => ["ok", `Started ${slug(x.company)}.service — ${x.title}`]),
  ["raw", "Loading aws-msk.ko (Managed Streaming for Apache Kafka) …"],
  ["ok", "Loaded kafka-streams module"],
  ...projects.slice(1).map((p): Log => ["ok", `Linked /projects/${p.id.toLowerCase()}`]),
  ["raw", "Starting taxbuddy.service …"],
  ["ok", "Started taxbuddy.service — 1040-NR in under 10 minutes"],
  ["ok", "Reached target Graphical Interface"],
  ["raw", "Welcome, guest."],
];

const STEP = 42; // ms per log line
const LOG_START = 900;
const LOG_END = LOG_START + LOG.length * STEP;

const Boot = ({ onDone }: { onDone: () => void }) => {
  const [t, setT] = useState(0);

  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = () => {
      const now = performance.now() - start;
      setT(now);
      if (now > LOG_END + 450) onDone();
      else raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const skip = () => onDone();
    window.addEventListener("pointerdown", skip);
    window.addEventListener("keydown", skip);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
    };
  }, [onDone]);

  const shown = Math.max(0, Math.min(LOG.length, Math.floor((t - LOG_START) / STEP)));
  const first = Math.max(0, shown - 13);
  const progress = Math.min(1, Math.max(0, (t - LOG_START + 200) / (LOG_END - LOG_START + 200)));

  return (
    <motion.div
      className="absolute inset-0 z-[100] bg-black overflow-hidden"
      exit={{ opacity: 0, scale: 1.04, filter: "blur(6px)" }}
      transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* CRT power-on: a line snaps across, then opens into the screen */}
      <motion.div
        className="absolute left-0 right-0 top-1/2 h-[2px] -mt-px bg-white origin-center"
        initial={{ scaleX: 0, scaleY: 1, opacity: 1 }}
        animate={{ scaleX: [0, 1, 1], scaleY: [1, 1, 400], opacity: [1, 1, 0] }}
        transition={{ duration: 0.55, times: [0, 0.35, 1], ease: "easeOut" }}
        style={{ boxShadow: "0 0 30px 6px rgba(160,190,255,0.9)" }}
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.7, filter: "blur(12px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)", y: t > LOG_START ? -8 : 0 }}
          transition={{ delay: 0.4, duration: 0.6, ease: [0.2, 0.9, 0.3, 1] }}
          className="flex flex-col items-center"
        >
          <div
            className="w-[72px] h-[72px] rounded-[22px] grid place-items-center text-[38px] font-bold relative"
            style={{
              background: "linear-gradient(135deg,#FF5F05 0%,#E11D74 55%,#6D28D9 100%)",
              boxShadow: "0 0 60px 0 rgba(225,29,116,0.55), inset 0 1px 0 rgba(255,255,255,0.4)",
            }}
          >
            J
          </div>
          <div className="mt-5 text-[22px] font-semibold tracking-[-0.02em]">
            Jonathan<span className="font-light text-white/60">OS</span>
          </div>
        </motion.div>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: t > LOG_START - 200 ? 1 : 0 }}
          className="mt-7 w-[220px] h-[4px] rounded-full bg-white/15 overflow-hidden"
        >
          <div
            className="h-full rounded-full"
            style={{ width: `${progress * 100}%`, background: "linear-gradient(90deg,#FF5F05,#E11D74,#8B5CF6)" }}
          />
        </motion.div>

        {/* Scrolling boot log */}
        <div
          className="os-mono mt-8 w-full max-w-[640px] h-[210px] overflow-hidden text-[11.5px] leading-[1.6] text-white/70 relative"
          style={{ maskImage: "linear-gradient(to bottom, transparent, black 45%)", WebkitMaskImage: "linear-gradient(to bottom, transparent, black 45%)" }}
        >
          <div className="absolute bottom-0 left-0 right-0">
            {LOG.slice(first, shown).map(([tag, text], i) => (
              <div key={first + i} className="whitespace-nowrap overflow-hidden text-ellipsis">
                {tag === "ok" && (
                  <span className="text-white/50">
                    [<span className="text-[#30D158]">  OK  </span>]{" "}
                  </span>
                )}
                {tag === "warn" && (
                  <span className="text-white/50">
                    [<span className="text-[#FFD60A]"> WARN </span>]{" "}
                  </span>
                )}
                {tag === "raw" && <span className="text-white/35">[{((first + i) * 0.0731).toFixed(6).padStart(12)}] </span>}
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute inset-0 os-scanlines pointer-events-none" />
      <div className="absolute bottom-24 left-0 right-0 text-center text-[11px] text-white/25">click or press any key to skip</div>
    </motion.div>
  );
};

export default Boot;
