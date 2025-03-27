"use client";
import { useState, useEffect, useRef } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Carousel,
  Button,
  Alert,
  Form,
  Modal,
} from "react-bootstrap";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { getSetting, UpdateSetting, Setting } from "@/app/api/setting/setting";
import { useSession } from "next-auth/react";

export default function SettingPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSetting, setSelectedSetting] = useState<Setting | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalType, setModalType] = useState<"logo" | "carousel">("logo");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [carouselFiles, setCarouselFiles] = useState<File[]>([]);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [carouselPreviews, setCarouselPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const carouselInputRef = useRef<HTMLInputElement>(null);

  const t = useTranslations("Settings");
  const { data: session } = useSession();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const token = session?.user?.token as string;
        if (!token) {
          setError("Bạn cần đăng nhập để xem cài đặt");
          setLoading(false);
          return;
        }

        const response = await getSetting(token);
        if ("message" in response) {
          throw new Error(response.message);
        }

        setSettings(response);
        // Mặc định chọn setting đang active
        const activeSetting = response.find((s: Setting) => s.isActive);
        setSelectedSetting(activeSetting || response[0]);
      } catch (err) {
        setError("Không thể tải cài đặt. Vui lòng thử lại sau.");
        console.error("Lỗi khi tải cài đặt:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [session]);

  const handleActivateSetting = async (id: string) => {
    try {
      const token = session?.user?.token as string;
      if (!token) {
        setError("Bạn cần đăng nhập để thực hiện thao tác này");
        return;
      }

      const request = new Request("", {
        method: "PATCH",
        body: JSON.stringify({ id, isActive: true }),
      });

      const response = await UpdateSetting(request, token);

      if ("message" in response) {
        throw new Error(response.message);
      }

      // Cập nhật trạng thái local
      const updatedSettings = settings.map((setting) => ({
        ...setting,
        isActive: setting.id === id,
      }));

      setSettings(updatedSettings);
      setSelectedSetting(updatedSettings.find((s) => s.id === id) || null);
      setError(null);
      showSuccessMessage(t("settingActivated"));
    } catch (err) {
      setError("Không thể kích hoạt cài đặt. Vui lòng thử lại.");
      console.error("Lỗi khi kích hoạt cài đặt:", err);
    }
  };

  const handleSelectSetting = (setting: Setting) => {
    setSelectedSetting(setting);
  };

  const openModal = (type: "logo" | "carousel") => {
    setModalType(type);
    setShowModal(true);

    // Reset các state khi mở modal
    setLogoFile(null);
    setCarouselFiles([]);
    setLogoPreview(null);
    setCarouselPreviews([]);
    setError(null);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type.startsWith("image/")) {
        setLogoFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setLogoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setError(t("invalidImageFormat"));
      }
    }
  };

  const handleCarouselChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const validFiles = files.filter((file) => file.type.startsWith("image/"));

      if (validFiles.length !== files.length) {
        setError(t("someInvalidImages"));
      }

      if (validFiles.length > 0) {
        setCarouselFiles(validFiles);

        // Tạo previews cho các files
        const previews: string[] = [];
        validFiles.forEach((file) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            previews.push(reader.result as string);
            if (previews.length === validFiles.length) {
              setCarouselPreviews([...previews]);
            }
          };
          reader.readAsDataURL(file);
        });
      }
    }
  };

  const handleSubmit = async () => {
    try {
      setUploading(true);
      const token = session?.user?.token as string;
      if (!token) {
        setError("Bạn cần đăng nhập để thực hiện thao tác này");
        setUploading(false);
        return;
      }

      if (!selectedSetting) {
        setError("Không có cài đặt nào được chọn");
        setUploading(false);
        return;
      }

      const formData = new FormData();
      formData.append("id", selectedSetting.id);

      if (modalType === "logo" && logoFile) {
        formData.append("logo", logoFile);
      } else if (modalType === "carousel" && carouselFiles.length > 0) {
        carouselFiles.forEach((file) => {
          formData.append("carousel", file);
        });
      } else {
        setError(
          modalType === "logo" ? t("noLogoSelected") : t("noCarouselSelected")
        );
        setUploading(false);
        return;
      }

      const request = new Request("", {
        method: "PATCH",
        body: formData,
      });

      const response = await UpdateSetting(request, token);

      if ("message" in response) {
        throw new Error(response.message);
      }

      // Cập nhật dữ liệu local
      const updatedSettings = settings.map((setting) =>
        setting.id === selectedSetting.id ? response : setting
      );

      setSettings(updatedSettings);
      setSelectedSetting(response);
      closeModal();
      showSuccessMessage(
        modalType === "logo" ? t("logoUpdated") : t("carouselUpdated")
      );
    } catch (err) {
      setError(
        `Không thể cập nhật ${
          modalType === "logo" ? "logo" : "carousel"
        }. Vui lòng thử lại.`
      );
      console.error(`Lỗi khi cập nhật ${modalType}:`, err);
    } finally {
      setUploading(false);
    }
  };

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h1 className="mb-4 text-center">{t("settingsTitle")}</h1>

      {error && <Alert variant="danger">{error}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      <Row>
        <Col md={4}>
          <Card className="mb-4">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">{t("availableSettings")}</h5>
            </Card.Header>
            <Card.Body>
              <div className="list-group">
                {settings.map((setting) => (
                  <Button
                    key={setting.id}
                    variant={
                      selectedSetting?.id === setting.id
                        ? "primary"
                        : "outline-primary"
                    }
                    className="mb-2 text-start d-flex justify-content-between align-items-center"
                    onClick={() => handleSelectSetting(setting)}
                  >
                    <span>
                      {t("setting")} #
                      {setting.id ? setting.id.substring(0, 8) : ""}
                    </span>
                    {setting.isActive && (
                      <span className="badge bg-success">{t("active")}</span>
                    )}
                  </Button>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
          {selectedSetting ? (
            <Card>
              <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">{t("settingDetails")}</h5>
                {!selectedSetting.isActive && (
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleActivateSetting(selectedSetting.id)}
                  >
                    {t("activate")}
                  </Button>
                )}
              </Card.Header>
              <Card.Body>
                <Row className="mb-4">
                  <Col
                    md={12}
                    className="d-flex justify-content-between align-items-center mb-2"
                  >
                    <h5>{t("logo")}</h5>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => openModal("logo")}
                    >
                      {t("updateLogo")}
                    </Button>
                  </Col>
                  <Col md={12}>
                    <div className="text-center p-3 border rounded mb-3">
                      {selectedSetting.logo ? (
                        <Image
                          src={selectedSetting.logo}
                          alt="Logo"
                          width={200}
                          height={100}
                          style={{ objectFit: "contain" }}
                        />
                      ) : (
                        <p className="text-muted">{t("noLogoAvailable")}</p>
                      )}
                    </div>
                  </Col>
                </Row>

                <Row>
                  <Col
                    md={12}
                    className="d-flex justify-content-between align-items-center mb-2"
                  >
                    <h5>{t("carousel")}</h5>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => openModal("carousel")}
                    >
                      {t("updateCarousel")}
                    </Button>
                  </Col>
                  <Col md={12}>
                    {selectedSetting.carousel &&
                    selectedSetting.carousel.length > 0 ? (
                      <Carousel>
                        {selectedSetting.carousel.map((image, index) => (
                          <Carousel.Item key={index}>
                            <div
                              style={{ height: "300px", position: "relative" }}
                            >
                              <Image
                                src={image}
                                alt={`Carousel image ${index + 1}`}
                                fill
                                style={{ objectFit: "cover" }}
                              />
                            </div>
                            <Carousel.Caption>
                              <h3>
                                {t("slide")} {index + 1}
                              </h3>
                            </Carousel.Caption>
                          </Carousel.Item>
                        ))}
                      </Carousel>
                    ) : (
                      <p className="text-muted text-center p-3 border rounded">
                        {t("noCarouselImages")}
                      </p>
                    )}
                  </Col>
                </Row>
              </Card.Body>
              <Card.Footer>
                <small className="text-muted">
                  ID: {selectedSetting.id} | {t("status")}:{" "}
                  {selectedSetting.isActive ? t("active") : t("inactive")}
                </small>
              </Card.Footer>
            </Card>
          ) : (
            <Alert variant="info">{t("selectSettingPrompt")}</Alert>
          )}
        </Col>
      </Row>

      {/* Modal cập nhật Logo/Carousel */}
      <Modal show={showModal} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalType === "logo" ? t("updateLogo") : t("updateCarousel")}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalType === "logo" ? (
            <div>
              <Form.Group controlId="logoUpload" className="mb-3">
                <Form.Label>{t("selectLogo")}</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  ref={logoInputRef}
                  onChange={handleLogoChange}
                />
                <Form.Text className="text-muted">
                  {t("logoFileRequirements")}
                </Form.Text>
              </Form.Group>

              {logoPreview && (
                <div className="text-center mt-3 mb-3">
                  <p>{t("logoPreview")}</p>
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "200px",
                      objectFit: "contain",
                    }}
                  />
                </div>
              )}
            </div>
          ) : (
            <div>
              <Form.Group controlId="carouselUpload" className="mb-3">
                <Form.Label>{t("selectCarouselImages")}</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  multiple
                  ref={carouselInputRef}
                  onChange={handleCarouselChange}
                />
                <Form.Text className="text-muted">
                  {t("carouselFileRequirements")}
                </Form.Text>
              </Form.Group>

              {carouselPreviews.length > 0 && (
                <div className="mt-3 mb-3">
                  <p>{t("carouselPreview")}</p>
                  <div className="d-flex flex-wrap gap-2">
                    {carouselPreviews.map((preview, index) => (
                      <img
                        key={index}
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        style={{
                          width: "100px",
                          height: "100px",
                          objectFit: "cover",
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            {t("cancel")}
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={
              uploading ||
              (modalType === "logo" ? !logoFile : carouselFiles.length === 0)
            }
          >
            {uploading ? t("uploading") : t("save")}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
