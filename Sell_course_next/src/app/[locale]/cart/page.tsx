"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation"; // Import useRouter
import { RiDeleteBin6Line } from "react-icons/ri";
import "../../../style/Cart.css";
import Banner from "@/components/Banner-Card";
import image from "../../image/banner_image.png";
import { useSession } from "next-auth/react";
import { deleteCart, fetchCart } from "@/app/api/cart/cart";
import { CartResponse } from "@/app/type/cart/cart";
import { Button } from "react-bootstrap";

const defaultImage = image;

export default function CartPage() {
  const t = useTranslations("cart");
  const tl = useTranslations("cartBanner");
  const { data: session } = useSession();
  const router = useRouter(); // Khởi tạo useRouter
  const [cartItems, setCartItems] = useState<CartResponse[]>([]);
  const locate = useLocale();
  useEffect(() => {
    const getCart = async () => {
      try {
        const token = session?.user?.token;
        if (!token) return;

        const email = session?.user?.email;
        if (!email) return;
        const response = await fetchCart(token, email);
        setCartItems(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error("Error fetching cart:", error);
      }
    };

    if (session) {
      getCart();
    }
  }, [session]);

  const subtotal = cartItems.reduce((acc, item) => acc + item.course_price, 0);

  const handleRemoveItem = async (courseId: string) => {
    if (!session?.user?.token || !session?.user?.email) return;

    try {
      const response = await deleteCart(session.user.token, session?.user?.email, courseId);
      if (response.statusCode === 200) {
        setCartItems(cartItems.filter((item) => item.course_id !== courseId));
      } else {
        console.error("Failed to remove item:", response.message);
      }
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };
  const handleCheckOut = () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    router.push(`/${locate}/payment?data=${encodeURIComponent(JSON.stringify(cartItems))}`);
  };

  return (
    <div>
      <Banner title={tl("title")} subtitle={tl("subtitle")} />

      <div className="cart-container">
        <div className="cart-wrapper">
          <table className="cart-table">
            <thead>
              <tr>
                <th>{t("thumbnail")}</th>
                <th>{t("product")}</th>
                <th>{t("price")}</th>
                <th>{t("remove")}</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map(({ course_id, cart_id, course_img, course_title, course_price }) => (
                <tr key={cart_id}>
                  <td className="thumbnail">
                    <Image
                      src={course_img || defaultImage}
                      alt={course_title}
                      width={100}
                      height={100}
                      className="product-image rounded"
                    />
                  </td>
                  <td className="product-title">{course_title}</td>
                  <td className="product-price">${course_price}</td>
                  <td className="remove-cell">
                    <Button variant="outline-light" onClick={() => handleRemoveItem(course_id)}>
                      <RiDeleteBin6Line size={22} color="red" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="cart-summary">
            <h2>{t("title")}</h2>
            <div className="cart-totals">
              <div className="cart-total-row">
                <span>{t("subtotal")}</span>
                <span className="cart-price">${subtotal}</span>
              </div>
              <div className="cart-total-row">
                <span>{t("total")}</span>
                <span className="cart-price">${subtotal}</span>
              </div>
            </div>
            <Button className="buy-btn" onClick={handleCheckOut}>
              {t("checkout")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
