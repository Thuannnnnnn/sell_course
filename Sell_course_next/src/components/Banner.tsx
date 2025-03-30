"use client";

import { useTranslations } from "next-intl";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Carousel, Spinner } from "react-bootstrap";
import banner_img from "../../public/IMG_3922-1024x661.png";
import "../style/Banner.css";
import { settingsApi } from "@/app/api/setting/setting";
import { CarouselSetting, VersionSetting } from "@/app/type/settings/Settings";

const Banner = () => {
  const t = useTranslations("banner");
  const [activeVersionSetting, setActiveVersionSetting] = useState<VersionSetting | null>(null);
  const [carouselImages, setCarouselImages] = useState<CarouselSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActiveSettings = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching active version settings for Banner");
        
        // Get active version
        const activeVersion = await settingsApi.getVersionSettingsActive();
        
        if (activeVersion) {
          console.log("Active version found for Banner:", activeVersion);
          setActiveVersionSetting(activeVersion);
          
          // Get carousel images for this version
          console.log("Fetching carousel for version ID:", activeVersion.versionSettingId);
          const carouselData = await settingsApi.getCarouselByVersionId(activeVersion.versionSettingId);
          
          if (carouselData && carouselData.length > 0) {
            console.log("Carousel data found:", carouselData.length, "images");
            setCarouselImages(carouselData);
          } else {
            console.log("No carousel images found for this version");
            setCarouselImages([]);
          }
        } else {
          console.log("No active version found");
          setError("No active version settings found");
        }
      } catch (error) {
        console.error("Error fetching banner settings:", error);
        setError("Error loading banner settings");
      } finally {
        setLoading(false);
      }
    };
    
    fetchActiveSettings();
  }, []);

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <section className="colorBackground d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </section>
    );
  }

  // Show error message if something went wrong
  if (error) {
    return (
      <section className="colorBackground">
        <div className="bannerSection">
          <div>
            <h1 className="bannerTitle">{t("bannerTitle")}</h1>
            <p className="bannerDecription">{t("bannerDecription")}</p>
            <button className="btn-banner">
              <span>{t("bannerButtom")}</span>
            </button>
          </div>
          <div>
            <Image
              className="imageBanner"
              src={banner_img}
              alt="Learning Banner"
              width={553}
              height={426}
              style={{ objectFit: "contain", objectPosition: "center" }}
            />
          </div>
        </div>
      </section>
    );
  }

  // Display carousel if we have images, otherwise fall back to default banner
  return (
    <section className="colorBackground">
      {carouselImages.length > 0 ? (
        <div className="carousel-wrapper">
          <Carousel className="carousel-container" indicators={true} controls={true}>
            {carouselImages.map((image, index) => (
              <Carousel.Item key={image.carouselSettingId || index}>
                <div className="carousel-image-container">
                  <Image
                    className="carousel-image"
                    src={image.carousel}
                    alt={`Slide ${index + 1}`}
                    width={1600}
                    height={600}
                    priority={index === 0}
                    style={{ objectFit: "cover", objectPosition: "center 30%" }}
                  />
                </div>
                <Carousel.Caption className="carousel-caption">
                  <div className="caption-content">
                    <h1 className="bannerTitle">{t("bannerTitle")}</h1>
                    <p className="bannerDecription">{t("bannerDecription")}</p>
                    <button className="btn-banner">
                      <span>{t("bannerButtom")}</span>
                    </button>
                  </div>
                </Carousel.Caption>
              </Carousel.Item>
            ))}
          </Carousel>
        </div>
      ) : (
        <div className="bannerSection">
          <div>
            <h1 className="bannerTitle">{t("bannerTitle")}</h1>
            <p className="bannerDecription">{t("bannerDecription")}</p>
            <button className="btn-banner">
              <span>{t("bannerButtom")}</span>
            </button>
          </div>
          <div>
            <Image
              className="imageBanner"
              src={banner_img}
              alt="Learning Banner"
              width={553}
              height={426}
              style={{ objectFit: "contain", objectPosition: "center" }}
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default Banner;