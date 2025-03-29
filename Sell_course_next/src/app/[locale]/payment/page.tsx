"use client";
import { CartResponse } from "@/app/type/cart/cart";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Button,
  Form,
  Row,
  Col,
  Alert,
  Container,
  Card,
} from "react-bootstrap";
import Banner from "@/components/Banner-Card";
import { payment } from "@/app/api/payment/payment";
import { getPromotionByCode } from "@/app/api/promotion/promotion";
import { useSession } from "next-auth/react";
import "../../../style/Payment.css"; // Assuming you’ll update this CSS file

export default function CheckoutPage() {
  const t = useTranslations("checkout");
  const searchParams = useSearchParams();
  const [paymentItems, setPaymentItems] = useState<CartResponse[]>([]);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [error, setError] = useState("");
  const { data: session } = useSession();

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

  const total = paymentItems.reduce((acc, item) => acc + item.course_price, 0);
  const finalTotal = total - discount;
  const locate = useLocale();

  const handlePromoCodeApply = async () => {
    try {
      if (!promoCode) {
        setError(t("enterPromoCode"));
        return;
      }
      const token = session?.user?.token;
      if (!token) {
        setError(t("authError"));
        return;
      }
      const promotion = await getPromotionByCode(promoCode, token);
      if (promotion && promotion.discount) {
        setDiscount(total * (promotion.discount / 100));
        setError("");
      } else {
        setDiscount(0);
        setError(t("invalidPromoCode"));
      }
    } catch {
      setDiscount(0);
      setError(t("invalidPromoCode"));
    }
  };

  const handleCheckOut = async () => {
    try {
      const paymentData = {
        amount: finalTotal,
        description: "Thanh toán đơn hàng",
        items: paymentItems.map((item) => ({
          name: item.course_title,
          quantity: 1,
          price: item.course_price,
          courseId: item.course_id,
        })),
        lang: locate,
        email: session?.user.email,
      };
      const response = await payment(paymentData);
      if (response?.checkoutUrl) {
        window.location.href = response.checkoutUrl;
      } else {
        alert(t("paymentError"));
      }
    } catch {
      alert(t("paymentError"));
    }
  };

  return (
    <div className="checkout-page">
      {/* Banner - Hidden on mobile */}
      <div className="d-none d-md-block mb-4">
        <Banner title={t("title")} subtitle={t("subtitle")} />
      </div>

      <Container fluid className="py-4">
        <Row className="g-4">
          {/* Cart Items Section */}
          <Col xs={12} md={7} lg={8}>
            <Card className="shadow-sm border-0">
              <Card.Body>
                <h3 className="mb-4 fw-bold text-dark">{t("yourCart")}</h3>
                {paymentItems.length === 0 ? (
                  <p className="text-muted">{t("emptyCart")}</p>
                ) : (
                  paymentItems.map(
                    ({ cart_id, course_img, course_title, course_price }) => (
                      <div
                        key={cart_id}
                        className="d-flex align-items-center border-bottom py-3"
                      >
                        <Image
                          src={course_img}
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
                      </div>
                    )
                  )
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Summary and Payment Section */}
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
                    <span className="fw-semibold">${total.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">{t("discount")}</span>
                      <span className="text-success">
                        -${discount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <hr />
                  <div className="d-flex justify-content-between">
                    <span className="fw-bold">{t("total")}</span>
                    <span className="fw-bold text-primary">
                      ${finalTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Promo Code Section */}
                <Form className="mb-4">
                  <Form.Group controlId="promoCode" className="mb-3">
                    <Form.Control
                      type="text"
                      placeholder={t("enterPromoCode")}
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="rounded-pill"
                    />
                  </Form.Group>
                  <Button
                    variant="outline-primary"
                    className="w-100 rounded-pill"
                    onClick={handlePromoCodeApply}
                  >
                    {t("applyPromoCode")}
                  </Button>
                  {error && (
                    <Alert variant="danger" className="mt-3 rounded">
                      {error}
                    </Alert>
                  )}
                </Form>

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
