"use client";
import { verifyCertificate } from "@/app/api/certificate/certificate";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Form, Button, Container, Row, Col } from "react-bootstrap";

const VerifyCertificate = () => {
  const [certificate, setCertificate] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [certificateId, setCertificateId] = useState<string>("");

  const t = useTranslations("verifyCertificate");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certificateId.trim()) {
      setError(t("pleaseEnterCertificateId"));
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await verifyCertificate(certificateId);
      setCertificate(result);
    } catch {
      setCertificate(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <div className="text-center mb-4">
            <h2>{t("title")}</h2>
            <p>{t("description")}</p>
          </div>

          <Form onSubmit={handleVerify}>
            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                placeholder={t("inputPlaceholder")}
                value={certificateId}
                onChange={(e) => setCertificateId(e.target.value)}
                disabled={loading}
              />
            </Form.Group>

            <div className="d-grid gap-2">
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    {t("verifying")}
                  </>
                ) : (
                  t("verifyButton")
                )}
              </Button>
            </div>
          </Form>

          {error && (
            <div className="alert alert-danger mt-3 text-center" role="alert">
              {error}
            </div>
          )}

          {!error && certificate !== null && (
            <div className="text-center mt-4">
              {certificate ? (
                <div className="alert alert-success" role="alert">
                  <h4 className="alert-heading">✅ {t("validCertificate")}</h4>
                  <p>{t("validCertificateDescription")}</p>
                </div>
              ) : (
                <div className="alert alert-danger" role="alert">
                  <h4 className="alert-heading">
                    ❌ {t("invalidCertificate")}
                  </h4>
                  <p>{t("invalidCertificateDescription")}</p>
                </div>
              )}
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default VerifyCertificate;
