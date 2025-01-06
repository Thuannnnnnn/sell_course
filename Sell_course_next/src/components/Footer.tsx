"use client";
import React from "react";
import { useTranslations } from "next-intl";
import { Image } from "react-bootstrap";
import "../style/Footer.css";

const Footer: React.FC = () => {
  const t = useTranslations("footer");
  return (
    <footer className="footer">
      <div className="container">
        <div className="row">
          <div className="col-md-3 mb-1">
            <p className="title-custom">
              <Image
                src="/RedFlag_GoldenStar.png"
                alt="logo"
                rounded
                className="me-2"
                width={60}
              />{" "}
              <span className="red-flag">RedFlag</span>
              <span className="golden-star">GoldenStar</span>
            </p>
            <p>{t("phone")}</p>
            <p>{t("email")}</p>
            <p>{t("address")}</p>
          </div>

          <div className="col-md-2 mb-1">
            <h5>{t("about")}</h5>
            <ul className="list-unstyled">
              <li>{t("aboutList.0")}</li>
              <li>{t("aboutList.1")}</li>
              <li>{t("aboutList.2")}</li>
              <li>{t("aboutList.3")}</li>
            </ul>
          </div>
          <div className="col-md-3 mb-1">
            <h5>{t("products")}</h5>
            <ul className="list-unstyled">
              <li>{t("productList.0")}</li>
              <li>{t("productList.1")}</li>
              <li>{t("productList.2")}</li>
              <li>{t("productList.3")}</li>
              <li>{t("productList.4")}</li>
              <li>{t("productList.5")}</li>
            </ul>
          </div>
          <div className="col-md-2 mb-1">
            <h5>{t("tools")}</h5>
            <ul className="list-unstyled">
              <li>{t("toolsList.0")}</li>
              <li>{t("toolsList.1")}</li>
              <li>{t("toolsList.2")}</li>
              <li>{t("toolsList.3")}</li>
              <li>{t("toolsList.4")}</li>
              <li>{t("toolsList.5")}</li>
            </ul>
          </div>
          <div className="col-md-4 mb-1">
            <h5 className="title-custom">
              {t("companyName")}
              <span className="red-flag">RedFlag</span>
              <span className="golden-star">GoldenStar</span>
            </h5>
            <p>{t("taxCode")}</p>
            <p>{t("foundingDate")}</p>
            <p>{t("activityField")}</p>
          </div>
        </div>

        <div className="text-center mt-1">
          <p className="title-custom">
            <span> © 2018 - 2024 </span>
            <span className="red-flag">RedFlag </span>
            <span className="golden-star">GoldenStar </span>
            {t("copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
