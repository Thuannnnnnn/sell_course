"use client";
import Certificate from "@/components/certificate/certificate";
import { useParams } from "next/navigation";
import { Container } from "react-bootstrap";
const CertificatePage = () => {
  const params = useParams();
  const id = params.id as string;

  return (
    <Container className="mt-5 mb-5">
      <Certificate id={id} />
    </Container>
  );
};

export default CertificatePage;
