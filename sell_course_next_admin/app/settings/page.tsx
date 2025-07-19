"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Trash2, Edit, Plus, X, Upload, RefreshCw } from "lucide-react";
import { BannerSetting, LogoSetting, VersionSetting } from "app/types/setting";
import { settingsApi } from "app/api/settings/settings";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import { Button } from "components/ui/button";
import { Label } from "components/ui/label";
import { Input } from "components/ui/input";
import { Checkbox } from "@radix-ui/react-checkbox";
import { toast } from 'sonner';

// Extended version type to include logo and banner IDs
interface ExtendedVersionSetting extends VersionSetting {
  logoId?: string;
  bannerId?: string;
}

export default function SettingsPage() {
  const [versions, setVersions] = useState<ExtendedVersionSetting[]>([]);
  const [selectedVersion, setSelectedVersion] =
    useState<ExtendedVersionSetting | null>(null);
  const [logoSetting, setLogoSetting] = useState<LogoSetting | null>(null);
  const [bannerSetting, setBannerSetting] = useState<BannerSetting | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"logo" | "banner">("logo");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [showVersionModal, setShowVersionModal] = useState(false);
  const [editingVersion, setEditingVersion] =
    useState<ExtendedVersionSetting | null>(null);
  const [versionTitle, setVersionTitle] = useState("");
  const [versionActive, setVersionActive] = useState(false);

  useEffect(() => {
    loadVersions();
  }, []);

  const loadVersions = async () => {
    try {
      const data = await settingsApi.getVersionSettings();
      // Load logo and banner IDs for each version
      const versionsWithIds = await Promise.all(
        data.map(async (version: VersionSetting) => {
          try {
            const [logoData, bannerData] = await Promise.all([
              settingsApi.getLogoByVersionId(version.versionSettingId),
              settingsApi.getBannerByVersionId(version.versionSettingId),
            ]);

            return {
              ...version,
              logoId: logoData?.[0]?.logoSettingId || undefined,
              bannerId: bannerData?.carouselSettingId || undefined,
            };
          } catch {
            return {
              ...version,
              logoId: undefined,
              bannerId: undefined,
            };
          }
        })
      );

      setVersions(versionsWithIds);
      if (versionsWithIds.length > 0 && !selectedVersion) {
        const activeVersion =
          versionsWithIds.find((v) => v.isActive) || versionsWithIds[0];
        setSelectedVersion(activeVersion);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const loadVersionDetails = useCallback(async () => {
    if (!selectedVersion) return;
    try {
      const [logo, banner] = await Promise.all([
        settingsApi.getLogoByVersionId(selectedVersion.versionSettingId),
        settingsApi.getBannerByVersionId(selectedVersion.versionSettingId),
      ]);
      setLogoSetting(logo[0]);
      setBannerSetting(banner);

      // Update the selected version with the IDs
      setSelectedVersion((prev) =>
        prev
          ? {
              ...prev,
              logoId: logo[0]?.logoSettingId,
              bannerId: banner?.carouselSettingId,
            }
          : null
      );

      // Update the versions array with the IDs
      setVersions((prev) =>
        prev.map((v) =>
          v.versionSettingId === selectedVersion.versionSettingId
            ? {
                ...v,
                logoId: logo[0]?.logoSettingId,
                bannerId: banner?.carouselSettingId,
              }
            : v
        )
      );
    } catch {}
  }, [selectedVersion]);

  useEffect(() => {
    if (selectedVersion?.versionSettingId) {
      loadVersionDetails();
    }
  }, [selectedVersion?.versionSettingId, loadVersionDetails]);

  const handleDeleteBanner = async () => {
    if (!bannerSetting || !selectedVersion) return;
    if (window.confirm("Are you sure you want to delete this banner?")) {
      try {
        await settingsApi.deleteBanner(bannerSetting.carouselSettingId);
        await loadVersionDetails();
      } catch (error) {
        console.error("Failed to delete banner:", error);
      }
    }
  };

  const handleVersionSelect = (version: ExtendedVersionSetting) => {
    setLogoSetting(null);
    setBannerSetting(null);
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

  // Enhanced upload/update function
  const handleUploadOrUpdate = async (
    file: File,
    type: "logo" | "banner",
    Id?: string
  ) => {
    if (!selectedVersion) return;

    try {
      if (type === "logo") {
        setUploadingLogo(true);
        if (Id || selectedVersion.logoId) {
          // Update
          await settingsApi.updateLogo(
            selectedVersion.versionSettingId,
            file,
            Id || selectedVersion.logoId || ""
          );
        } else {
          // Create
          await settingsApi.createLogo(
            selectedVersion.versionSettingId,
            file
          );
        }
      } else {
        setUploadingBanner(true);
        if (Id || selectedVersion.bannerId) {
          // Update
          await settingsApi.updateBanner(
            selectedVersion.versionSettingId,
            file,
            Id || selectedVersion.bannerId || ""
          );
        } else {
          // Create
          await settingsApi.createBanner(
            selectedVersion.versionSettingId,
            file
          );
        }
      }
      await loadVersionDetails();
      toast.success(`${type === "logo" ? "Logo" : "Banner"} ${Id || (type === "logo" ? selectedVersion.logoId : selectedVersion.bannerId) ? "updated" : "uploaded"} successfully!`);
    } catch (error) {
      console.error(
        `Failed to ${
          type === "logo" ? "upload/update logo" : "upload/update banner"
        }:`,
        error
      );
      toast.error(
        `Failed to ${
          type === "logo" ? "upload/update logo" : "upload/update banner"
        }. Please try again.`
      );
    } finally {
      if (type === "logo") {
        setUploadingLogo(false);
      } else {
        setUploadingBanner(false);
      }
    }
  };

  const handleToggleActive = async (version: ExtendedVersionSetting) => {
    try {
      if (version.isActive) return;

      const currentSelectedId = selectedVersion?.versionSettingId;
      await settingsApi.updateVersionActive(version.versionSettingId, true);

      const data = await settingsApi.getVersionSettings();
      // Reload versions with IDs
      const versionsWithIds = await Promise.all(
        data.map(async (v: VersionSetting) => {
          try {
            const [logoData, bannerData] = await Promise.all([
              settingsApi.getLogoByVersionId(v.versionSettingId),
              settingsApi.getBannerByVersionId(v.versionSettingId),
            ]);

            return {
              ...v,
              logoId: logoData?.[0]?.logoSettingId || undefined,
              bannerId: bannerData?.carouselSettingId || undefined,
            };
          } catch {
            return {
              ...v,
              logoId: undefined,
              bannerId: undefined,
            };
          }
        })
      );

      setVersions(versionsWithIds);
      console.log("versionsWithIds", versionsWithIds);

      if (currentSelectedId) {
        const updatedSelectedVersion = versionsWithIds.find(
          (v) => v.versionSettingId === currentSelectedId
        );
        if (updatedSelectedVersion) {
          setSelectedVersion(updatedSelectedVersion);
        }
      }

      localStorage.setItem("activeVersionId", version.versionSettingId);
      window.dispatchEvent(new Event("activeVersionIdChanged"));
      console.log("activeVersionId", version.versionSettingId);
      toast.success("Version activated successfully!");
    } catch {
      toast.error("Failed to activate version. Please try again.");
    }
  };

  const handleUpdate = async () => {
    if (!selectedFile || !selectedVersion) return;

    // Use stored IDs from selectedVersion, fallback to current settings
    const targetId =
      modalType === "logo"
        ? selectedVersion.logoId || logoSetting?.logoSettingId
        : selectedVersion.bannerId || bannerSetting?.carouselSettingId;

    if (!targetId) {
      console.error("No target ID found for update");
      return;
    }

    try {
      await handleUploadOrUpdate(selectedFile, modalType, targetId);
      setShowModal(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      // Toast success is already handled in handleUploadOrUpdate
    } catch (error) {
      console.error("Update failed:", error);
      // Toast error is already handled in handleUploadOrUpdate
    }
  };

  const handleAddVersion = () => {
    setEditingVersion(null);
    setVersionTitle("");
    setVersionActive(false);
    setShowVersionModal(true);
  };

  const handleEditVersion = (version: ExtendedVersionSetting) => {
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
        await settingsApi.createVersion({
          VersionSettingtitle: versionTitle,
          isActive: versionActive,
        });
      }
      setShowVersionModal(false);
      loadVersions();
      toast.success(`Version ${editingVersion ? "updated" : "created"} successfully!`);
    } catch {
      toast.error(`Failed to ${editingVersion ? "update" : "create"} version. Please try again.`);
    }
  };

  const handleDeleteVersion = async (versionId: string) => {
    if (window.confirm("Are you sure you want to delete this version?")) {
      try {
        await settingsApi.deleteVersion(versionId);
        loadVersions();
      } catch {}
    }
  };

  const openUpdateModal = (type: "logo" | "banner") => {
    setModalType(type);
    setSelectedFile(null);
    setPreviewUrl(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const closeVersionModal = () => {
    setShowVersionModal(false);
    setVersionTitle("");
    setVersionActive(false);
    setEditingVersion(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-lg font-medium text-gray-600 animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Settings
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel - Version List */}
          <div className="lg:col-span-4">
            <Card className="shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-semibold">
                    Available Settings
                  </CardTitle>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleAddVersion}
                    className="bg-white text-indigo-600 hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add New
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 bg-white">
                <div className="space-y-3">
                  {versions.map((version) => (
                    <div key={version.versionSettingId} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <button
                          className={`flex-1 text-left px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            selectedVersion?.versionSettingId ===
                            version.versionSettingId
                              ? "bg-indigo-500 text-white hover:bg-indigo-600"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                          onClick={() => handleVersionSelect(version)}
                        >
                          {version.VersionSettingtitle}
                        </button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditVersion(version)}
                          className="border-gray-300 hover:bg-indigo-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleDeleteVersion(version.versionSettingId)
                          }
                          disabled={version.isActive}
                          className="border-gray-300 text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center space-x-2 pl-2">
                        <div className="flex items-center">
                          <button
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              version.isActive
                                ? "bg-indigo-500"
                                : "bg-gray-300"
                            } ${
                              version.isActive
                                ? "cursor-default"
                                : "cursor-pointer"
                            }`}
                            onClick={() =>
                              !version.isActive && handleToggleActive(version)
                            }
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                version.isActive
                                  ? "translate-x-6"
                                  : "translate-x-1"
                              }`}
                            />
                          </button>
                          <Label
                            htmlFor={`active-switch-${version.versionSettingId}`}
                            className="text-sm text-gray-600 ml-2"
                          >
                            Active
                          </Label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Settings Details */}
          <div className="lg:col-span-8">
            {selectedVersion && (
              <Card className="shadow-xl rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-4">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-semibold">
                      Setting Details
                    </CardTitle>
                    {selectedVersion.isActive && (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="bg-green-500 text-white hover:bg-green-600 transition-colors"
                      >
                        Active
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-6 bg-white">
                  {/* Logo Section */}
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold text-gray-900">
                        Logo
                      </h3>
                      {(logoSetting?.logo || selectedVersion.logoId) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openUpdateModal("logo")}
                          className="border-gray-300 hover:bg-indigo-50"
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Update Logo
                        </Button>
                      )}
                    </div>
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center bg-gray-50 relative transition-all hover:border-indigo-300">
                      {logoSetting?.logo ? (
                        <div className="group relative">
                          <Image
                            src={logoSetting.logo}
                            alt="Logo"
                            width={200}
                            height={100}
                            className="mx-auto object-contain"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                            <div className="text-white text-center">
                              <RefreshCw className="h-8 w-8 mx-auto mb-2" />
                              <p className="text-sm">Click to update</p>
                            </div>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleUploadOrUpdate(
                                  file,
                                  "logo",
                                  selectedVersion.logoId
                                );
                              }
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            disabled={uploadingLogo}
                          />
                        </div>
                      ) : (
                        <div className="py-8">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleUploadOrUpdate(
                                  file,
                                  "logo",
                                  selectedVersion.logoId
                                );
                              }
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            disabled={uploadingLogo}
                          />
                          <div className="text-gray-500">
                            {uploadingLogo ? (
                              <div className="flex items-center justify-center">
                                <RefreshCw className="h-8 w-8 animate-spin mr-2 text-indigo-500" />
                                <span>Uploading...</span>
                              </div>
                            ) : (
                              <>
                                <Upload className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                                <p className="text-gray-600">Click to upload logo</p>
                                <p className="text-sm text-gray-400">
                                  PNG, JPG, GIF up to 10MB
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Banner Section */}
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold text-gray-900">
                        Banner
                      </h3>
                      <div className="flex gap-2">
                        {(bannerSetting?.carousel ||
                          selectedVersion.bannerId) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openUpdateModal("banner")}
                            className="border-gray-300 hover:bg-indigo-50"
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Update Banner
                          </Button>
                        )}
                        {bannerSetting?.carousel && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDeleteBanner}
                            className="border-gray-300 text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center bg-gray-50 relative transition-all hover:border-indigo-300">
                      {bannerSetting?.carousel ? (
                        <div className="group relative">
                          <Image
                            src={bannerSetting.carousel}
                            alt="Banner"
                            width={400}
                            height={200}
                            className="mx-auto object-contain"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                            <div className="text-white text-center">
                              <RefreshCw className="h-8 w-8 mx-auto mb-2" />
                              <p className="text-sm">Click to update</p>
                            </div>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleUploadOrUpdate(
                                  file,
                                  "banner",
                                  selectedVersion.bannerId
                                );
                              }
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            disabled={uploadingBanner}
                          />
                        </div>
                      ) : (
                        <div className="py-8">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleUploadOrUpdate(
                                  file,
                                  "banner",
                                  selectedVersion.bannerId
                                );
                              }
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            disabled={uploadingBanner}
                          />
                          <div className="text-gray-500">
                            {uploadingBanner ? (
                              <div className="flex items-center justify-center">
                                <RefreshCw className="h-8 w-8 animate-spin mr-2 text-indigo-500" />
                                <span>Uploading...</span>
                              </div>
                            ) : (
                              <>
                                <Upload className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                                <p className="text-gray-600">Click to upload banner</p>
                                <p className="text-sm text-gray-400">
                                  PNG, JPG, GIF up to 10MB
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Update Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {modalType === "logo" ? "Update Logo" : "Update Banner"}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeModal}
                className="hover:bg-gray-100 rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="file-upload" className="text-sm font-medium text-gray-700">
                  {modalType === "logo"
                    ? "Select New Logo Image"
                    : "Select New Banner Image"}
                </Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="mt-2 border-gray-300 rounded-lg"
                />
              </div>
              {previewUrl && (
                <div className="text-center">
                  <Label className="text-sm font-medium text-gray-700">Preview</Label>
                  <div className="mt-2 border rounded-xl p-2 bg-gray-50">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      width={200}
                      height={200}
                      className="mx-auto object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={closeModal}
                className="border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdate}
                disabled={!selectedFile}
                className="bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Update {modalType === "logo" ? "Logo" : "Banner"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Version Modal */}
      {showVersionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingVersion ? "Edit Version" : "Add New Version"}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeVersionModal}
                className="hover:bg-gray-100 rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="version-title" className="text-sm font-medium text-gray-700">
                  Version Title
                </Label>
                <Input
                  id="version-title"
                  type="text"
                  value={versionTitle}
                  onChange={(e) => setVersionTitle(e.target.value)}
                  placeholder="Enter version title"
                  className="mt-2 border-gray-300 rounded-lg"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="version-active"
                  checked={versionActive}
                  onCheckedChange={(checked) =>
                    setVersionActive(checked === true)
                  }
                  disabled={editingVersion?.isActive}
                />
                <Label htmlFor="version-active" className="text-sm text-gray-600">
                  Active
                </Label>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={closeVersionModal}
                className="border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveVersion}
                disabled={!versionTitle}
                className="bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}