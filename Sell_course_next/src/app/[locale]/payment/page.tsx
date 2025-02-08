"use client";
import { CartResponse } from "@/app/type/cart/cart";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Table, Button } from "react-bootstrap";
import Banner from "@/components/Banner-Card";
import { payment } from "@/app/api/payment/payment";
import "../../../style/Cart.css";
import { useSession } from "next-auth/react";

export default function CheckoutPage() {
  const t = useTranslations("checkout");
  const searchParams = useSearchParams();
  const [paymentItems, setPaymentItems] = useState<CartResponse[]>([]);
  useEffect(() => {
    const data = searchParams.get("data");
    if (data) {
      try {
        setPaymentItems(JSON.parse(decodeURIComponent(data)));
      } catch (error) {
        console.error("Invalid checkout data", error);
      }
    }
  }, [searchParams]);
  const { data: session } = useSession();
  const total = paymentItems.reduce((acc, item) => acc + item.course_price, 0);
  const locate = useLocale();
  const handleCheckOut = async () => {
    try {
      const paymentData = {
        amount: total,
        description: "Thanh toán đơn hàng",
        items: paymentItems.map((item) => ({
          name: item.course_title,
          quantity: 1,
          price: item.course_price,
          courseId: item.course_id,
        })),
        lang: locate,
        userId: session?.user.id,

      };

      const response = await payment(paymentData);
      if (response?.checkoutUrl) {
        window.location.href = response.checkoutUrl;
      } else {
      }
    } catch {
      alert("Lỗi khi thanh toán!");
    }
  };

  return (
    <div>
      <Banner title={t("title")} subtitle={t("title")} />

      <div className="cart-container">
        <div className="cart-wrapper">
          <Table striped bordered hover responsive className="cart-table">
            <tbody>
              {paymentItems.map(({ cart_id, course_img, course_title, course_price }) => (
                <tr key={cart_id}>
                  <td className="thumbnail">
                    <Image
                      src={course_img}
                      alt={course_title}
                      width={100}
                      height={100}
                      className="product-image rounded"
                    />
                  </td>
                  <td className="product-title">{course_title}</td>
                  <td className="product-price">${course_price}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          <div className="cart-summary text-end">
            <h2>{t("title")}</h2>
            <div className="cart-totals">
              <div className="cart-total-row">
                <span>{t("subtotal")}</span>
                <span className="cart-price">${total}</span>
              </div>
              <div className="cart-total-row">
                <span>{t("total")}</span>
                <span className="cart-price">${total}</span>
              </div>
            </div>
            <Button className="buy-btn mt-3" onClick={handleCheckOut}>
              {t("checkout")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
