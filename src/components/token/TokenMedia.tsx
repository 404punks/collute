"use client";

import { useState } from "react";

export function TokenMedia({
  src,
  name,
  nsfw,
  large = false,
}: {
  src: string | null;
  name: string;
  nsfw: boolean | null;
  large?: boolean;
}) {
  const [revealed, setRevealed] = useState(nsfw !== true);
  const [failed, setFailed] = useState(false);
  const letter = name.trim().charAt(0).toUpperCase() || "•";

  if (!src || failed || !revealed) {
    return (
      <div>
        <div className={large ? "token-logo hero grid place-items-center text-lg font-bold" : "token-logo grid place-items-center font-bold"}>
          {letter}
        </div>
        {nsfw === true && !revealed ? (
          <button className="btn mt-2" type="button" onClick={() => setRevealed(true)}>
            Show image
          </button>
        ) : null}
        {nsfw === true && !revealed ? (
          <p className="faint mt-1 text-xs">coins-v2 reported nsfw=true. The image stays hidden until you ask for it.</p>
        ) : null}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={large ? "token-logo hero" : "token-logo"}
      src={src}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
