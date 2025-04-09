"use client";
import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import {
  getCertificateByUserId,
  deleteCertificate,
  Certificate,
} from "@/app/api/certificate/certificate";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

const CertificateList = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
  const router = useRouter();
  const t = useTranslations("certificateList");
  const locale = useLocale();
  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        if (!session?.user?.user_id) return;
        const data = await getCertificateByUserId(session?.user?.user_id);
        setCertificates(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("error"));
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, [session, t]);

  const handleDelete = async (certificateId: string) => {
    if (!confirm(t("deleteConfirmation"))) return;

    try {
      await deleteCertificate(certificateId);
      setCertificates((prev) =>
        prev.filter(
          (certificate) => certificate.certificateId !== certificateId
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : t("deleteError"));
    }
  };

  if (loading) {
    return <div className="text-center p-5">{t("loading")}</div>;
  }

  if (error) {
    return <div className="text-center p-5 text-danger">{error}</div>;
  }

  return (
    <Container className="py-5">
      <h2 className="mb-4">{t("title")}</h2>
      <Row xs={1} md={2} lg={3} className="g-4">
        {certificates.map((certificate) => (
          <Col key={certificate.certificateId}>
            <Card
              className="h-100 shadow-sm card-hover"
              onClick={() =>
                router.push(
                  `/${locale}/profile/certificate/${certificate.certificateId}`
                )
              }
              style={{ cursor: "pointer" }}
            >
              <Card.Body>
                <div className="d-flex align-items-center mb-3">
                  <Image
                    src={certificate.course.imageInfo}
                    alt={certificate.course.title}
                    width={150}
                    height={100}
                    className="rounded me-3"
                  />
                </div>
                <Card.Title className="mb-1">
                  {certificate.course.title}
                </Card.Title>
                <Card.Title className="mb-1">
                  {certificate.certificateId}
                </Card.Title>
                <Card.Text>
                  <small className="text-muted">
                    {t("issueDate")}:{" "}
                    {new Date(certificate.createdAt).toLocaleDateString(
                      "vi-VN"
                    )}
                  </small>
                </Card.Text>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(certificate.certificateId);
                  }}
                >
                  {t("deleteButton")}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default CertificateList;
