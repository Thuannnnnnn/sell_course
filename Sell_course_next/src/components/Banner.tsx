"use client";

import { useTranslations } from "next-intl";
import React from "react";
import Image from "next/image";
import banner_img from "../../public/IMG_3922-1024x661.png";
import "../style/Banner.css";

const Banner = () => {
  const t = useTranslations("banner");

  return (
    <section className="colorBackground">
      <div className="bannerSection">
        <div>
          <h1 className="bannerTitle"> {t("bannerTitle")} </h1>
          <p className="bannerDecription"> {t("bannerDecription")} </p>
          <button className="btn-banner">
            <span>{t("bannerButtom")} </span>
          </button>
        </div>
        <div>
          <Image
            className="imageBanner"
            src={banner_img}
            alt="Learning Banner"
          />
        </div>
      </div>
    </section>
  );
};

export default Banner;
