// Shared between the remix page shell (WS4) and the Ask terminal (WS5). Frozen during a round.

export type AchievementId =
  | "story" // entered Story mode
  | "explorer" // scrolled through every section
  | "vibe" // hovered or clicked the vibe graph
  | "shockwave" // clicked the particles
  | "ask" // got a first answer from the terminal
  | "unknown" // the terminal admitted it didn't know
  | "hire"; // ran `sudo hire jonathan`

export interface AskTerminalProps {
  // The drawer holding the terminal is open; focus the prompt each time this flips to true
  active: boolean;
  // Esc, `/exit` or `exit` inside the terminal
  onClose: () => void;
  // Fire freely; the shell dedupes
  onUnlock: (id: AchievementId) => void;
}
