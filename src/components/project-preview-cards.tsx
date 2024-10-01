import React, { useState, useRef, useEffect } from "react";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { IconX } from "@tabler/icons-react";

const ASPECT_RATIO = 628 / 942;

const Card = React.memo(
  ({
    card,
    index,
    hovered,
    setHovered,
    onCardClick,
  }: {
    card: any;
    index: number;
    hovered: number | null;
    setHovered: React.Dispatch<React.SetStateAction<number | null>>;
    onCardClick: (card: any) => void;
  }) => (
    <div
      onMouseEnter={() => setHovered(index)}
      onMouseLeave={() => setHovered(null)}
      onClick={() => onCardClick(card)}
      className={cn(
        "rounded-lg relative bg-gray-100 dark:bg-neutral-900 overflow-hidden w-full transition-all duration-300 ease-out cursor-pointer",
        hovered !== null && hovered !== index && "blur-sm scale-[0.98]"
      )}
      style={{ paddingBottom: `${100 / ASPECT_RATIO}%` }}
    >
      <img
        src={process.env.PUBLIC_URL + card.src}
        alt={card.title}
        className="absolute inset-0 object-cover w-full h-full"
      />
      <div
        className={cn(
          "absolute inset-0 bg-black/50 flex items-end py-8 px-4 transition-opacity duration-300",
          hovered === index ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="flex flex-col">
          <div className="text-xl font-bold text-transparent md:text-2xl bg-clip-text bg-gradient-to-b from-neutral-50 to-neutral-200">
            {card.title}
          </div>
          <text className="text-sm text-white">click for more info</text>
        </div>
      </div>
    </div>
  )
);

Card.displayName = "Card";

type Card = {
  title: string;
  src: string;
  logo: string;
  content: React.ReactNode;
};

const Popup = ({ card, onClose }: { card: Card; onClose: () => void }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 h-screen overflow-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 w-full h-full bg-black/80 backdrop-blur-lg"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        ref={containerRef}
        className="max-w-5xl mx-auto bg-white dark:bg-neutral-900 h-fit z-[60] my-10 p-4 md:p-10 rounded-3xl font-sans relative"
      >
        <button
          className="sticky right-0 flex items-center justify-center w-8 h-8 ml-auto bg-black rounded-full top-4 dark:bg-white"
          onClick={onClose}
        >
          <IconX className="w-6 h-6 text-neutral-100 dark:text-neutral-900" />
        </button>
        <div>
          <div>
            <text className="mt-4 text-2xl font-semibold text-white md:text-5xl">
              {card.title}
            </text>
            <img
              src={process.env.PUBLIC_URL + card.logo}
              alt={card.title}
              className="h-20 rounded-lg "
            />
          </div>
          <div className="py-10">{card.content}</div>
        </div>
      </motion.div>
    </div>
  );
};

export function FocusCards({ cards }: { cards: Card[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  const handleCardClick = (card: Card) => {
    setSelectedCard(card);
  };

  const handleClosePopup = () => {
    setSelectedCard(null);
  };

  return (
    <>
      <div className="grid w-full grid-cols-1 gap-4 mx-auto max-w-7xl sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, index) => (
          <Card
            key={card.title}
            card={card}
            index={index}
            hovered={hovered}
            setHovered={setHovered}
            onCardClick={handleCardClick}
          />
        ))}
      </div>
      <AnimatePresence>
        {selectedCard && (
          <Popup card={selectedCard} onClose={handleClosePopup} />
        )}
      </AnimatePresence>
    </>
  );
}
