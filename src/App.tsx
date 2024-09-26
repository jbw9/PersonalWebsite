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
        <IconHome className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/",
    },
    {
      title: "Search",
      icon: (
        <IconSearch className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/search",
    },
    {
      title: "Notifications",
      icon: (
        <IconBell className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/notifications",
    },
    {
      title: "Profile",
      icon: (
        <IconUser className="h-full w-full text-neutral-500 dark:text-neutral-300" />
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
    <div className="bg-black w-full min-h-screen flex flex-col">
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
