import { AskTerminalProps } from "../contracts";

// Placeholder until WS5 builds the terminal
const AskTerminal = ({ onClose }: AskTerminalProps) => (
  <div className="h-full w-full bg-[#0d0b09] text-[#efe6d8] font-mono p-4 text-sm">
    ask terminal — coming soon <button onClick={onClose}>[close]</button>
  </div>
);

export default AskTerminal;
