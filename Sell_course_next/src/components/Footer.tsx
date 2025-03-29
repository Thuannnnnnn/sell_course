"use client";
import React from "react";
import { useLocale, useTranslations } from "next-intl";
import { Image } from "react-bootstrap";
import "../style/Footer.css";
import StartChatButton from "./chat_support/startChatButton";
import Link from "next/link";

const Footer: React.FC = () => {
  const t = useTranslations("footer");
  const locale = useLocale();
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
              <li>
                <Link
                  href={`/${locale}/chats/history`}
                  className="text-black text-decoration-none"
                >
                  {t("chatHistory")}
                </Link>
              </li>
              <StartChatButton />
            </ul>
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
