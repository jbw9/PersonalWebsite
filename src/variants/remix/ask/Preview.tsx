import AskTerminal from "./AskTerminal";

// Temporary route (/v/ask-preview) so the terminal can be built before the shell embeds it
const Preview = () => (
  <div className="h-screen w-screen bg-black p-6">
    <AskTerminal active onClose={() => console.log("close")} onUnlock={(id) => console.log("unlock", id)} />
  </div>
);

export default Preview;
