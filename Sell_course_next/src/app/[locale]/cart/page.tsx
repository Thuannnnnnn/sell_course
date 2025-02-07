"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { RiDeleteBin6Line } from "react-icons/ri";
import "../../../style/Cart.css";
import Banner from "@/components/Banner-Card";
import image from "../../image/banner_image.png";
import { useSession } from "next-auth/react";
import { fetchCart } from "@/app/api/cart/cart";
import { CartResponse } from "@/app/type/cart/cart";

const defaultImage = image;

export default function CartPage() {
  const t = useTranslations("cart");
  const tl = useTranslations("cartBanner");
  const { data: session } = useSession();

  const [cartItems, setCartItems] = useState<CartResponse[]>([]);

  useEffect(() => {
    const getCart = async () => {
      try {
        const token = session?.user?.token;
        if (!token || !session?.user?.id) return;

        const response = await fetchCart(token, session.user.id);
        setCartItems(response || []);
      } catch (error) {
        console.error("Error fetching cart:", error);
      }
    };

    if (session) {
      getCart();
    }
  }, [session]);

  // ✅ Tính tổng giá trị giỏ hàng
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2);

  // ✅ Xử lý xóa sản phẩm khỏi giỏ hàng
  const handleRemoveItem = (id: string) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  return (
    <div>
      <Banner title={tl("title")} subtitle={tl("subtitle")} />

      <div className="cart-container">
        {cartItems.length > 0 ? (
          <div className="cart-wrapper">
            <table className="cart-table">
              <thead>
                <tr>
                  <th>{t("thumbnail")}</th>
                  <th>{t("product")}</th>
                  <th>{t("price")}</th>
                  <th>{t("quantity")}</th>
                  <th>{t("subtotal")}</th>
                  <th>{t("remove")}</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map(({ }) => (
                  <tr key={id}>
                    <td className="thumbnail">
                      <Image src={image || defaultImage} alt={title} width={80} height={80} className="product-image" />
                    </td>
                    <td className="product-title">{title}</td>
                    <td className="product-price">${price.toFixed(2)}</td>
                    <td className="product-quantity">{quantity}</td>
                    <td className="subtotal">${(price * quantity).toFixed(2)}</td>
                    <td className="remove-cell">
                      <button className="remove-btn" onClick={() => handleRemoveItem(id)}>
                        <RiDeleteBin6Line size={22} color="red" />
                      </button>
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
              <button className="buy-btn">{t("checkout")}</button>
            </div>
          </div>
        ) : (
          <p className="empty-cart">{t("emptyMessage")}</p>
        )}
      </div>
    </div>
  );
}
