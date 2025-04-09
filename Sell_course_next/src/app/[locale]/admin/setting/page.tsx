"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Form,
  Modal,
  Carousel,
} from "react-bootstrap";
import Image from "next/image";
import "@/style/Settings.css";
import {
  VersionSetting,
  LogoSetting,
  CarouselSetting,
} from "@/app/type/settings/Settings";
import { settingsApi } from "@/app/api/setting/setting";
import { useTranslations } from "next-intl";
import Sidebar from "@/components/SideBar";

export default function SettingsPage() {
  const [versions, setVersions] = useState<VersionSetting[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<VersionSetting | null>(
    null
  );
  const [logoSetting, setLogoSetting] = useState<LogoSetting | null>(null);
  const [carouselSetting, setCarouselSetting] = useState<CarouselSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"logo" | "carousel">("logo");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [showVersionModal, setShowVersionModal] = useState(false);
  const [editingVersion, setEditingVersion] = useState<VersionSetting | null>(
    null
  );
  const [versionTitle, setVersionTitle] = useState("");
  const [versionActive, setVersionActive] = useState(false);
  const t = useTranslations("settings");
  useEffect(() => {
    loadVersions();
  }, []);

  const loadVersions = async () => {
    try {
      const data = await settingsApi.getVersionSettings();
      setVersions(data);
      if (data.length > 0) {
        const activeVersion = data.find((v) => v.isActive) || data[0];
        setSelectedVersion(activeVersion);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCarousel = async (carouselId: string) => {
    if (window.confirm(t("carousel.deleteConfirm"))) {
      try {
        await settingsApi.deleteCarousel(carouselId);
        await loadVersionDetails();
      } catch (error) {
        console.error("Failed to delete carousel:", error);
      }
    }
  };

  const loadVersionDetails = useCallback(async () => {
    if (!selectedVersion) return;

    try {
      const [logo, carousel] = await Promise.all([
        settingsApi.getLogoByVersionId(selectedVersion.versionSettingId),
        settingsApi.getCarouselByVersionId(selectedVersion.versionSettingId),
      ]);
      setLogoSetting(logo[0]);
      setCarouselSetting(carousel);
    } catch {}
  }, [selectedVersion]);

  useEffect(() => {
    loadVersions();
  }, []);

  useEffect(() => {
    if (selectedVersion?.versionSettingId) {
      loadVersionDetails();
    }
  }, [selectedVersion?.versionSettingId, loadVersionDetails]);

  const handleVersionSelect = (version: VersionSetting) => {
    // Reset current states
    setLogoSetting(null);
    setCarouselSetting([]);

    // Set new version
    setSelectedVersion(version);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleToggleActive = async (version: VersionSetting) => {
    try {
      // Nếu version đang active thì không cho tắt
      if (version.isActive) {
        return;
      }

      await settingsApi.updateVersionActive(version.versionSettingId, true);
      await loadVersions();
    } catch {}
  };

  const handleUpdate = async () => {
    if (!selectedVersion || !selectedFile) return;

    try {
      if (modalType === "logo") {
        await settingsApi.updateLogo(
          selectedVersion.versionSettingId,
          selectedFile
        );
      } else {
        await settingsApi.updateCarousel(
          selectedVersion.versionSettingId,
          selectedFile
        );
      }
      await loadVersionDetails();
      setShowModal(false);
    } catch {}
  };
  const handleAddVersion = () => {
    setEditingVersion(null);
    setVersionTitle("");
    setVersionActive(false);
    setShowVersionModal(true);
  };

  const handleEditVersion = (version: VersionSetting) => {
    setEditingVersion(version);
    setVersionTitle(version.VersionSettingtitle);
    setVersionActive(version.isActive);
    setShowVersionModal(true);
  };

  const handleSaveVersion = async () => {
    try {
      if (editingVersion) {
        await settingsApi.updateVersion(editingVersion.versionSettingId, {
          VersionSettingtitle: versionTitle,
          isActive: versionActive,
        });
      } else {
        // Create new version
        await settingsApi.createVersion({
          VersionSettingtitle: versionTitle,
          isActive: versionActive,
        });
      }
      setShowVersionModal(false);
      loadVersions();
    } catch {}
  };

  const handleDeleteVersion = async (versionId: string) => {
    if (window.confirm(t("modal.deleteConfirm"))) {
      try {
        await settingsApi.deleteVersion(versionId);
        loadVersions();
      } catch {}
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="d-flex">
      <div>
        <Sidebar />
      </div>
      <Container className="py-4">
        <h1 className="text-center mb-4">{t("title")}</h1>

        <Row>
          <Col md={4}>
            <Card>
              <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">{t("availableSettings")}</h5>
                <Button variant="light" size="sm" onClick={handleAddVersion}>
                  {t("addNew")}
                </Button>
              </Card.Header>
              <Card.Body>
                <div className="list-group">
                  {versions.map((version) => (
                    <div
                      key={version.versionSettingId}
                      className="d-flex flex-column mb-2"
                    >
                      <div className="d-flex align-items-center mb-1">
                        <Button
                          variant={
                            selectedVersion?.versionSettingId ===
                            version.versionSettingId
                              ? "primary"
                              : "outline-primary"
                          }
                          className="flex-grow-1 text-start d-flex justify-content-between align-items-center me-2"
                          onClick={() => handleVersionSelect(version)}
                        >
                          <span>{version.VersionSettingtitle}</span>
                        </Button>
                        <div className="d-flex gap-1">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => handleEditVersion(version)}
                          >
                            {t("edit")}
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() =>
                              handleDeleteVersion(version.versionSettingId)
                            }
                            disabled={version.isActive}
                          >
                            {t("delete")}
                          </Button>
                        </div>
                      </div>
                      <div className="d-flex align-items-center ps-2">
                        <Form.Check
                          type="switch"
                          id={`active-switch-${version.versionSettingId}`}
                          label={t("active")}
                          checked={version.isActive}
                          onChange={() => handleToggleActive(version)}
                          disabled={version.isActive}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={8}>
            {selectedVersion ? (
              <Card>
                <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">{t("settingDetails")}</h5>
                  {selectedVersion.isActive && (
                    <Button variant="success" size="sm">
                      {t("activate")}
                    </Button>
                  )}
                </Card.Header>
                <Card.Body>
                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h5>{t("logo.title")}</h5>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => {
                          setModalType("logo");
                          setShowModal(true);
                        }}
                      >
                        {t("logo.update")}
                      </Button>
                    </div>
                    <div className="border rounded p-3 text-center">
                      {logoSetting?.logo ? (
                        <Image
                          src={logoSetting.logo}
                          alt="Logo"
                          width={200}
                          height={100}
                          style={{ objectFit: "contain" }}
                        />
                      ) : (
                        <p className="text-muted">{t("logo.noLogo")}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h5>{t("carousel.title")}</h5>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => {
                          setModalType("carousel");
                          setShowModal(true);
                        }}
                      >
                        {t("carousel.update")}
                      </Button>
                    </div>

                    {carouselSetting.length > 0 ? (
                      <>
                        {/* Carousel Slider */}
                        <Carousel className="mb-3">
                          {carouselSetting.map((image) => (
                            <Carousel.Item key={image.carouselSettingId}>
                              <Image
                                className="d-block w-100"
                                src={image.carousel}
                                alt="Carousel"
                                width={1200}
                                height={300}
                                style={{ height: "300px", objectFit: "cover" }}
                                priority
                              />
                            </Carousel.Item>
                          ))}
                        </Carousel>

                        {/* Thumbnail Grid */}
                        <div className="border rounded p-3">
                          <Row xs={2} md={3} lg={4} className="g-3">
                            {carouselSetting.map((image) => (
                              <Col key={image.carouselSettingId}>
                                <div className="position-relative">
                                  <Image
                                    src={image.carousel}
                                    alt="Carousel thumbnail"
                                    width={200}
                                    height={150}
                                    style={{
                                      width: "100%",
                                      height: "150px",
                                      objectFit: "cover",
                                      borderRadius: "4px",
                                    }}
                                  />
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    className="position-absolute top-0 end-0 m-1"
                                    onClick={() =>
                                      handleDeleteCarousel(
                                        image.carouselSettingId
                                      )
                                    }
                                  >
                                    <i className="bi bi-trash"></i>
                                  </Button>
                                </div>
                              </Col>
                            ))}
                          </Row>
                        </div>
                      </>
                    ) : (
                      <p className="text-muted text-center">
                        {t("carousel.noCarousel")}
                      </p>
                    )}
                  </div>
                </Card.Body>
              </Card>
            ) : (
              <Alert variant="info">{t("pleaseSelect")}</Alert>
            )}
          </Col>
        </Row>

        {/* Update Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>
              {modalType === "logo" ? t("logo.update") : t("carousel.update")}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label>
                {modalType === "logo"
                  ? t("logo.selectImage")
                  : t("carousel.selectImage")}
              </Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
              />
            </Form.Group>
            {previewUrl && (
              <div className="mt-3 text-center">
                <h6>{t("modal.preview")}</h6>
                <Image
                  src={previewUrl}
                  alt="Preview"
                  width={200}
                  height={200}
                  style={{ objectFit: "contain" }}
                />
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              {t("modal.cancel")}
            </Button>
            <Button
              variant="primary"
              onClick={handleUpdate}
              disabled={!selectedFile}
            >
              {t("modal.saveChanges")}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Version Modal */}
        <Modal
          show={showVersionModal}
          onHide={() => setShowVersionModal(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {editingVersion
                ? t("modal.editVersion")
                : t("modal.addNewVersion")}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>{t("modal.versionTitle")}</Form.Label>
                <Form.Control
                  type="text"
                  value={versionTitle}
                  onChange={(e) => setVersionTitle(e.target.value)}
                  placeholder={t("modal.enterTitle")}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label={t("active")}
                  checked={versionActive}
                  onChange={(e) => setVersionActive(e.target.checked)}
                  disabled={editingVersion?.isActive}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowVersionModal(false)}
            >
              {t("modal.cancel")}
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveVersion}
              disabled={!versionTitle}
            >
              {t("modal.saveChanges")}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
}
