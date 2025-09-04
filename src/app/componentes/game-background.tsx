import React, { useState, useEffect } from "react";
import { type GameMessage as GameMessageType } from "@/lib/types";
import { Image } from "@/components/image";

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
    if (image?.base64Data && image?.base64Data !== currentImage?.base64Data) {
      setPreviousImage(currentImage);
      setShowNew(false);
      const timer = setTimeout(() => {
        setCurrentImage(image);
        setShowNew(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [image?.base64Data, currentImage?.base64Data]);

  return (
    <div className="h-screen w-full absolute top-0 left-0 z-0">
      <div className="absolute z-10 bg-black/70 size-full backdrop-blur-2xl"></div>

      {previousImage?.base64Data && (
        <Image
          base64={previousImage.base64Data}
          mediaType={previousImage.mediaType || ""}
          uint8Array={new Uint8Array()}
          className={`size-full object-cover absolute transition-opacity duration-500 ${
            showNew ? "opacity-0" : "opacity-100"
          }`}
        />
      )}

      <Image
        base64={currentImage?.base64Data || ""}
        mediaType={currentImage?.mediaType || ""}
        uint8Array={new Uint8Array()}
        className={`size-full object-cover transition-opacity duration-500 ${
          showNew ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
