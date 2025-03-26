"use client";
import DashBoardTotal from "@/components/dashBoard/dashBoardTotal";
import Sidebar from "@/components/SideBar";
import { Container, Row } from "react-bootstrap";

export default function DashBoard() {
  return (
    <div className="d-flex">
      <div>
        <Sidebar />
      </div>
      <Container>
        <Row className="mt-3">
          <DashBoardTotal />
        </Row>
      </Container>
    </div>
  );
}
