import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import Boot from "./Boot";
import Desktop from "./Desktop";
import Phone from "./Phone";
import "./os.css";

const prefersReduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isPhone = () => window.innerWidth < 700;

const JonathanOS = () => {
  const [booted, setBooted] = useState(prefersReduced);
  const [phone, setPhone] = useState(isPhone);
  const [session, setSession] = useState(0); // "Restart…" remounts everything and reboots

  useEffect(() => {
    const r = () => setPhone(isPhone());
    window.addEventListener("resize", r);
    return () => window.removeEventListener("resize", r);
  }, []);

  const done = useCallback(() => setBooted(true), []);
  const restart = useCallback(() => {
    setBooted(prefersReduced());
    setSession((s) => s + 1);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <div className="v-os fixed inset-0 overflow-hidden bg-black">
        <motion.div
          className="absolute inset-0"
          initial={false}
          animate={{ scale: booted ? 1 : 1.15, opacity: booted ? 1 : 0 }}
          transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="os-wall">
            <div className="os-blob os-blob-a" />
            <div className="os-blob os-blob-b" />
            <div className="os-blob os-blob-c" />
            <div className="os-blob os-blob-d" />
            <div className="os-grain" />
          </div>
        </motion.div>
        {booted && (phone ? <Phone key={session} /> : <Desktop key={session} onRestart={restart} />)}
        <AnimatePresence>{!booted && <Boot key={session} onDone={done} />}</AnimatePresence>
      </div>
    </MotionConfig>
  );
};

export default JonathanOS;
