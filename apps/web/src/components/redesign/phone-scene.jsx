"use client";
import Image from "next/image";
import { redesignCopy } from "@/content/site";
import React from "react";

const screens = [
  { value: "voce", file: "painel-antonio-r11.webp" },
  { value: "familia", file: "painel-maria-r11.webp" },
];

export function PhoneScene({ perspective }) {
  const description =
    perspective === "familia"
      ? redesignCopy.iphone_mostrando_o_painel_de_maria_na_perspectiva_de_um_fami
      : redesignCopy.iphone_mostrando_o_painel_de_antonio_na_perspectiva_de_quem_;
  return (
    <figure
      className="family-art phone-scene"
      role="img"
      aria-label={description}
    >
      <Image
        sizes="(max-width: 767px) 90vw, 540px"
        className="phone-scene-backdrop"
        src="/brand/cenario-ritmo-r12.webp"
        alt=""
        width="1254"
        height="1254"
        loading="lazy"
      />
      <div className="phone-device" aria-hidden="true">
        <div className="phone-bezel">
          <div className="phone-display">
            {screens.map((screen) => (
              <Image
                sizes="235px"
                key={screen.value}
                className={
                  "phone-screen-capture" +
                  (screen.value === perspective ? " is-active" : "")
                }
                src={"/brand/" + screen.file}
                alt=""
                width="1170"
                height="2532"
                loading="lazy"
                draggable="false"
              />
            ))}
            <span className="phone-island" />
          </div>
        </div>
        <span className="phone-side-button" />
      </div>
    </figure>
  );
}
