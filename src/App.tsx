import React from "react";
import logo from "./logo.svg";
import "./App.css";
import { FloatingDock } from "./components/floating-dock";
import { IconHome, IconSearch, IconBell, IconUser } from "@tabler/icons-react";

function App() {
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

  return (
    <div className="bg-black w-full min-h-screen flex flex-col">
      <FloatingDock
        items={dockItems}
        desktopClassName="fixed bottom-4 left-1/2 -translate-x-1/2"
        mobileClassName="fixed bottom-4 right-4"
      />
    </div>
  );
}

export default App;
