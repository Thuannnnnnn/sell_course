'use client'
import React, { useState } from "react";
import Image from 'next/image';
import { Container, Card, Form, Button, Table } from "react-bootstrap";
import { FaBagShopping, FaMoneyBills } from "react-icons/fa6";
import { useSession } from "next-auth/react";

const ConfirmOrder = () => {
  const { data: session } = useSession();
  const [order, setOrder] = useState({
    buyerName: "",
    products: [
      { id: 1, name: "Loaded Pizza", price: 129900, imageUrl: "/images/loaded-pizza.jpg" },
      { id: 2, name: "Not Quite Loaded Pizza", price: 109900, imageUrl: "/images/not-quite-loaded-pizza.jpg" },
    ],
    paymentMethod: "",
    note: "",
  });

  const totalAmount = order.products.reduce((sum, product) => sum + product.price, 0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    setOrder({ ...order, [e.target.name]: value });
  };

  const handleConfirm = () => {
    alert("Đơn hàng đã được xác nhận!");
  };

  return (
    <Container className="mt-4 mb-4 px-5">
      <Card className="shadow-lg border-light rounded">
        <Card.Body>
          <Card.Title className="mb-3"><FaBagShopping /> Checkout</Card.Title>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Tên người mua</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập tên người mua"
                name="buyerName"
                value={session?.user.name || ""}
                onChange={handleChange}
                className="shadow-sm"
                disabled
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Nội dung</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Nhập ghi chú"
                name="note"
                value={order.note}
                onChange={handleChange}
                className="shadow-sm"
              />
            </Form.Group>
          </Form>

          <Table bordered className="mt-4">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {order.products.map((product) => (
                <tr key={product.id}>
                  <td className="d-flex align-items-center">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      width={50}
                      height={50}
                      className="rounded me-3"
                    />
                    {product.name}
                  </td>
                  <td>{(product.price / 1000).toLocaleString()} VND</td>
                </tr>
              ))}
            </tbody>
          </Table>

          <div className="mt-3 d-flex justify-content-between">
            <strong>Subtotal</strong>
            <span>{(totalAmount / 1000).toLocaleString()} VND</span>
          </div>
          <hr />
          <div className="d-flex justify-content-between">
            <h5 className="fw-bolder"><FaMoneyBills /> Total</h5>
            <h5>{(totalAmount / 1000).toLocaleString()} VND</h5>
          </div>
          <Button
            className="mt-3 w-100"
            variant="primary"
            onClick={handleConfirm}
          >
            Confirm Order
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ConfirmOrder;
