// Shared between the remix page shell and the Ask terminal.

export interface AskTerminalProps {
  // The drawer holding the terminal is open; focus the prompt each time this flips to true
  active: boolean;
  // Esc, `/exit` or `exit` inside the terminal
  onClose: () => void;
}
