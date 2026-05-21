import React, { useState, useEffect } from "react";
import { type GameMessage as GameMessageType } from "@/lib/types";

export default function GameBackground({
  image,
}: {
  image: GameMessageType["image"];
}) {
  const [currentImage, setCurrentImage] = useState(image);
  const [previousImage, setPreviousImage] = useState<
    GameMessageType["image"] | null
  >(null);
  const [showNew, setShowNew] = useState(true);

  useEffect(() => {
    if (image?.url && image?.url !== currentImage?.url) {
      setPreviousImage(currentImage);
      setShowNew(false);
      const timer = setTimeout(() => {
        setCurrentImage(image);
        setShowNew(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [image?.url, currentImage?.url]);

  return (
    <div className="h-screen w-full absolute top-0 left-0 z-0">
      <div className="absolute z-10 bg-black/70 size-full backdrop-blur-2xl"></div>

      {previousImage?.url && (
        <img
          src={previousImage.url}
          alt=""
          className={`size-full object-cover absolute transition-opacity duration-500 ${
            showNew ? "opacity-0" : "opacity-100"
          }`}
        />
      )}

      {currentImage?.url ? (
        <img
          src={currentImage.url}
          alt=""
          className={`size-full object-cover transition-opacity duration-500 ${
            showNew ? "opacity-100" : "opacity-0"
          }`}
        />
      ) : (
        <img
          src="/bg.webp"
          alt="Default background"
          className={`size-full object-cover transition-opacity duration-500 ${
            showNew ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </div>
  );
}
