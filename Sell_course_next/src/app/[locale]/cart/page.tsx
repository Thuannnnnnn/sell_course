"use client";

import { useState } from "react";
import Banner from "@/components/Banner-Card";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { RiDeleteBin6Line } from "react-icons/ri";
import "../../../style/Cart.css";
import image from "../../image/banner_image.png";
import { StaticImageData } from "next/image";

const defaultImage = image;

interface CartItem {
  id: number;
  image: string | StaticImageData;
  title: string;
  price: number;
  quantity: number;
}

export default function CartPage() {
  const t = useTranslations("cart");
  const tl = useTranslations("cartBanner");

  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      image: defaultImage,
      title: "Adobe Illustrator for Graphic Design",
      price: 187.0,
      quantity: 2,
    },
    {
      id: 2,
      image: defaultImage,
      title: "Adobe Illustrator for Graphic Design",
      price: 187.0,
      quantity: 2,
    },
  ]);

  const handleRemoveItem = (id: number) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);

  return (
    <div>
      <Banner title={tl("title")} subtitle={tl("subtitle")} />

      <div className="cart-container">
        <div className="cart-wrapper">
          <table className="cart-table">
            <thead>
              <tr>
                <th>Thumbnail</th>
                <th>Product</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Subtotal</th>
                <th>Remove</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map(({ id, image, title, price, quantity }) => (
                <tr key={id}>
                  <td className="thumbnail">
                    <Image src={image} alt={`Thumbnail of ${title}`} width={80} height={80} className="product-image" />
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
        </div>

        <div className="cart-summary">
          <h2>Cart totals</h2>
          <div className="cart-totals">
            <div className="cart-total-row">
              <span>Subtotal</span>
              <span className="cart-price">${subtotal}</span>
            </div>
            <div className="cart-total-row">
              <span>Total</span>
              <span className="cart-price">${subtotal}</span>
            </div>
          </div>
          <button className="buy-btn">Buy</button>
        </div>
      </div>
    </div>
  );
}
