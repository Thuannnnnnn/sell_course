"use client";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function FailurePage() {
  const t = useTranslations("checkout");

  return (
    <div className="payment-container">
      <h1>{t("payment_failed")}</h1>
      <p>{t("please_try_again")}</p>
      <Link href="/checkout" className="btn btn-danger">{t("retry_payment")}</Link>
      <Link href="/" className="btn btn-secondary">{t("back_home")}</Link>
    </div>
  );
}
