import React, { useState, useEffect } from "react";
import logo from "./logo.svg";
import "./App.css";
import { FloatingDock } from "./components/floating-dock";
import { IconHome, IconSearch, IconBell, IconUser } from "@tabler/icons-react";
import { MultiStepLoader } from "./components/multi-step-loader";

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const dockItems = [
    {
      title: "Home",
      icon: (
        <IconHome className="w-full h-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/",
    },
    {
      title: "Search",
      icon: (
        <IconSearch className="w-full h-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/search",
    },
    {
      title: "Notifications",
      icon: (
        <IconBell className="w-full h-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/notifications",
    },
    {
      title: "Profile",
      icon: (
        <IconUser className="w-full h-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/profile",
    },
  ];

  const loadingStates = [
    { text: "Importing Jonathan's information..." },
    { text: "Fetching latest projects..." },
    { text: "Downloading app previews..." },
    { text: "Almost there..." },
  ];

  return (
    <div className="flex flex-col w-full min-h-screen bg-black">
      <MultiStepLoader
        loadingStates={loadingStates}
        loading={loading}
        duration={1000}
        loop={true}
      />
      {!loading && (
        <FloatingDock
          items={dockItems}
          desktopClassName="fixed bottom-4 left-1/2 -translate-x-1/2"
          mobileClassName="fixed bottom-4 right-4"
        />
      )}
    </div>
  );
}

export default App;

// https://ui.aceternity.com/components/compare
// https://ui.aceternity.com/components/apple-cards-carousel
// https://ui.aceternity.com/components/focus-cards
// https://ui.aceternity.com/components/animated-modal
// https://ui.aceternity.com/components/flip-words
// https://ui.aceternity.com/components/layout-grid
// https://ui.aceternity.com/components/wobble-card
