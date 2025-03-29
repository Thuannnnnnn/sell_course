"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useSession } from "next-auth/react";
import { deleteCart, fetchCart } from "@/app/api/cart/cart";
import { CartResponse } from "@/app/type/cart/cart";
import { Button, Card, Container, Row, Col } from "react-bootstrap";
import Banner from "@/components/Banner-Card";
import image from "../../../../public/banner_image.png";
import "../../../style/Cart.css";

const defaultImage = image;

export default function CartPage() {
  const t = useTranslations("cart");
  const tl = useTranslations("cartBanner");
  const { data: session } = useSession();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartResponse[]>([]);
  const locate = useLocale();

  useEffect(() => {
    const getCart = async () => {
      try {
        const token = session?.user?.token;
        const email = session?.user?.email;
        if (!token || !email) return;

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
      const response = await deleteCart(
        session.user.token,
        session.user.email,
        courseId
      );
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
      alert(t("emptyCartAlert"));
      return;
    }
    router.push(
      `/${locate}/payment?data=${encodeURIComponent(JSON.stringify(cartItems))}`
    );
  };

  return (
    <div className="cart-page">
      {/* Banner - Hidden on mobile */}
      <div className="d-none d-md-block mb-4">
        <Banner title={tl("title")} subtitle={tl("subtitle")} />
      </div>

      <Container fluid className="py-4">
        <Row className="g-4">
          {/* Cart Items Section */}
          <Col xs={12} md={7} lg={8}>
            <Card className="shadow-sm border-0">
              <Card.Body>
                <h3 className="mb-4 fw-bold text-dark">{t("yourCart")}</h3>
                {cartItems.length === 0 ? (
                  <p className="text-muted">{t("emptyCart")}</p>
                ) : (
                  cartItems.map(
                    ({
                      course_id,
                      cart_id,
                      course_img,
                      course_title,
                      course_price,
                    }) => (
                      <div
                        key={cart_id}
                        className="d-flex align-items-center border-bottom py-3"
                      >
                        <Image
                          src={course_img || defaultImage}
                          alt={course_title}
                          width={80}
                          height={80}
                          className="rounded me-3 object-fit-cover"
                        />
                        <div className="flex-grow-1">
                          <h6 className="mb-1 fw-semibold">{course_title}</h6>
                          <p className="mb-0 text-muted">
                            ${course_price.toFixed(2)}
                          </p>
                        </div>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="rounded-circle"
                          onClick={() => handleRemoveItem(course_id)}
                        >
                          <RiDeleteBin6Line size={18} />
                        </Button>
                      </div>
                    )
                  )
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Summary Section */}
          <Col xs={12} md={5} lg={4}>
            <Card
              className="shadow-sm border-0 sticky-top"
              style={{ top: "20px" }}
            >
              <Card.Body>
                <h3 className="mb-4 fw-bold text-dark">{t("summary")}</h3>
                <div className="mb-4">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">{t("subtotal")}</span>
                    <span className="fw-semibold">${subtotal.toFixed(2)}</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between">
                    <span className="fw-bold">{t("total")}</span>
                    <span className="fw-bold text-primary">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Checkout Button */}
                <Button
                  variant="primary"
                  className="w-100 rounded-pill py-2 fw-semibold"
                  onClick={handleCheckOut}
                >
                  {t("checkout")}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
