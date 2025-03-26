"use client";
import { useEffect, useState } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import {
  getCertificateByUserId,
  Certificate,
} from "@/app/api/certificate/certificate";
import Image from "next/image";
import { useSession } from "next-auth/react";

const CertificateList = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        if (!session?.user?.user_id) return;
        const data = await getCertificateByUserId(session?.user?.user_id);
        setCertificates(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, [session]);

  if (loading) {
    return <div className="text-center p-5">Đang tải...</div>;
  }

  if (error) {
    return <div className="text-center p-5 text-danger">{error}</div>;
  }

  return (
    <Container className="py-5">
      <h2 className="mb-4">Chứng chỉ của tôi</h2>
      <Row xs={1} md={2} lg={3} className="g-4">
        {certificates.map((certificate) => (
          <Col key={certificate.certificateId}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <div className="d-flex align-items-center mb-3">
                  <Image
                    src={certificate.course.imageInfo}
                    alt={certificate.course.title}
                    width={60}
                    height={60}
                    className="rounded me-3"
                  />
                  <div>
                    <Card.Title className="mb-1">
                      {certificate.title}
                    </Card.Title>
                    <Card.Subtitle className="text-muted">
                      {certificate.course.title}
                    </Card.Subtitle>
                  </div>
                </div>
                <Card.Text>
                  <small className="text-muted">
                    Ngày cấp:{" "}
                    {new Date(certificate.createdAt).toLocaleDateString(
                      "vi-VN"
                    )}
                  </small>
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default CertificateList;
