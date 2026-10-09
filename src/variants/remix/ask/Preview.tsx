import AskTerminal from "./AskTerminal";

// Temporary route (/v/ask-preview): the terminal in a drawer-sized frame (540px on desktop, full-screen on phones)
const Preview = () => (
  <div className="h-screen w-full bg-[#2a2420] flex justify-end">
    <div className="h-full w-full sm:w-[540px] sm:border-l border-black/60 shadow-2xl">
      <AskTerminal active onClose={() => console.log("close")} onUnlock={(id) => console.log("unlock", id)} />
    </div>
  </div>
);

export default Preview;
