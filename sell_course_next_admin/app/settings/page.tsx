"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { 
  Trash2, 
  Edit, 
  Plus, 
  X, 
  Upload, 
  RefreshCw, 
  Settings,
  ImageIcon,
  Monitor,
  Layers,
  CheckCircle,
  Eye
} from "lucide-react";
import { BannerSetting, LogoSetting, VersionSetting } from "app/types/setting";
import { settingsApi } from "app/api/settings/settings";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import { Button } from "components/ui/button";
import { Label } from "components/ui/label";
import { Input } from "components/ui/input";
import { Checkbox } from "@radix-ui/react-checkbox";
import { Badge } from "components/ui/badge";
import { toast } from 'sonner';

// Extended version type to include logo and banner IDs
interface ExtendedVersionSetting extends VersionSetting {
  logoId?: string;
  bannerId?: string;
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
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



  const loadVersions = useCallback(async () => {
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
      // Only set selected version if there isn't one already selected
      setSelectedVersion(prev => {
        if (!prev && versionsWithIds.length > 0) {
          return versionsWithIds.find((v) => v.isActive) || versionsWithIds[0];
        }
        return prev;
      });
    } catch {
    } finally {
      setLoading(false);
    }
  }, []); // Remove selectedVersion dependency to prevent infinite loop

  useEffect(() => {
    if (status === "loading") return;
    if (status === "authenticated") {
      loadVersions();
    }
  }, [loadVersions, status]);

  useEffect(() => {
    const loadDetails = async () => {
      if (!selectedVersion?.versionSettingId) return;
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
    };

    loadDetails();
  }, [selectedVersion?.versionSettingId]);

  // Helper function to reload current version details
  const reloadCurrentVersionDetails = async () => {
    if (!selectedVersion?.versionSettingId) return;
    try {
      const [logo, banner] = await Promise.all([
        settingsApi.getLogoByVersionId(selectedVersion.versionSettingId),
        settingsApi.getBannerByVersionId(selectedVersion.versionSettingId),
      ]);
      setLogoSetting(logo[0]);
      setBannerSetting(banner);
    } catch {}
  };

  const handleDeleteBanner = async () => {
    if (!bannerSetting || !selectedVersion) return;
    if (window.confirm("Are you sure you want to delete this banner?")) {
      try {
        await settingsApi.deleteBanner(bannerSetting.carouselSettingId);
        await reloadCurrentVersionDetails();
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
      await reloadCurrentVersionDetails();
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

      await settingsApi.updateVersionActive(version.versionSettingId, true);

      // Update versions state locally without full reload
      setVersions(prev => prev.map(v => ({
        ...v,
        isActive: v.versionSettingId === version.versionSettingId
      })));

      // Update selected version if it's the one being activated
      if (selectedVersion) {
        setSelectedVersion(prev => prev ? {
          ...prev,
          isActive: prev.versionSettingId === version.versionSettingId
        } : null);
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

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2" style={{borderColor: 'rgb(81, 61, 235)'}}></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Please log in to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4 bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg shadow-violet-200/50 border border-violet-200/50">
          <div className="w-12 h-12 rounded-xl mx-auto flex items-center justify-center shadow-lg shadow-violet-500/30" style={{backgroundColor: 'rgb(81, 61, 235)'}}>
            <RefreshCw className="w-6 h-6 text-white animate-spin" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-700">Loading Settings</h3>
            <p className="text-slate-500">Please wait while we load your configuration...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-violet-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                Settings
              </h1>
              <p className="text-slate-600 mt-1">Manage your platform&apos;s visual identity and branding</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Left Sidebar - Version Management */}
          <div className="xl:col-span-1">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl shadow-violet-200/60 hover:shadow-2xl hover:shadow-violet-300/60 transition-all duration-300 border border-violet-200/50">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg shadow-violet-500/30" style={{backgroundColor: 'rgb(81, 61, 235)'}}>
                      <Layers className="w-4 h-4 text-white" />
                    </div>
                    <CardTitle className="text-lg font-semibold text-slate-800">Versions</CardTitle>
                  </div>
                  <Button
                    onClick={handleAddVersion}
                    size="sm"
                    className="text-white border-0 shadow-lg hover:shadow-violet-500/40 transition-all duration-200 hover:opacity-90"
                    style={{backgroundColor: 'rgb(81, 61, 235)'}}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {versions.map((version) => (
                  <div
                    key={version.versionSettingId}
                    className={`group relative p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                      selectedVersion?.versionSettingId === version.versionSettingId
                        ? "border-violet-500 bg-gradient-to-r from-violet-50 to-purple-50 shadow-lg shadow-violet-500/20"
                        : "border-slate-200 bg-white hover:border-violet-300 hover:shadow-md"
                    }`}
                    onClick={() => handleVersionSelect(version)}
                  >
                    {/* Active Badge */}
                    {version.isActive && (
                      <div className="absolute -top-2 -right-2">
                        <Badge className="bg-green-500 text-white border-0 shadow-lg">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-800 group-hover:text-violet-600 transition-colors">
                            {version.VersionSettingtitle}
                          </h4>
                          <div className="flex items-center space-x-2 mt-2">
                            {version.logoId && (
                              <Badge variant="outline" className="text-xs border-green-300 text-green-700 bg-green-50">
                                <ImageIcon className="w-3 h-3 mr-1" />
                                Logo
                              </Badge>
                            )}
                            {version.bannerId && (
                              <Badge variant="outline" className="text-xs border-purple-300 text-purple-700 bg-purple-50">
                                <Monitor className="w-3 h-3 mr-1" />
                                Banner
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditVersion(version);
                            }}
                            className="h-8 w-8 p-0 hover:bg-violet-100"
                          >
                            <Edit className="w-3 h-3 text-slate-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteVersion(version.versionSettingId);
                            }}
                            disabled={version.isActive}
                            className="h-8 w-8 p-0 hover:bg-red-100 disabled:opacity-50"
                          >
                            <Trash2 className="w-3 h-3 text-red-500" />
                          </Button>
                        </div>

                        {/* Toggle Switch */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleActive(version);
                          }}
                          disabled={version.isActive}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                            version.isActive
                              ? "bg-green-500"
                              : "bg-slate-300 hover:bg-slate-400"
                          } ${version.isActive ? "cursor-default" : "cursor-pointer"}`}
                        >
                          <span
                            className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                              version.isActive ? "translate-x-5" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="xl:col-span-3">
            {selectedVersion ? (
              <div className="space-y-8">
                {/* Header */}
                <Card className="bg-white/90 backdrop-blur-sm shadow-xl shadow-violet-200/60 hover:shadow-2xl hover:shadow-violet-300/60 transition-all duration-300 border border-violet-200/50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30" style={{backgroundColor: 'rgb(81, 61, 235)'}}>
                          <Eye className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-slate-800">
                            {selectedVersion.VersionSettingtitle}
                          </h2>
                          <p className="text-slate-600">Configure branding assets for this version</p>
                        </div>
                      </div>
                      {selectedVersion.isActive && (
                        <Badge className="bg-green-500 text-white border-0 shadow-lg px-4 py-2">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Currently Active
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Logo and Banner Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Logo Management */}
                  <Card className="bg-white/90 backdrop-blur-sm shadow-xl shadow-violet-200/60 group hover:shadow-2xl hover:shadow-violet-300/60 transition-all duration-300 border border-violet-200/50">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg shadow-violet-500/30" style={{backgroundColor: 'rgb(81, 61, 235)'}}>
                            <ImageIcon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-xl font-semibold text-slate-800">Logo</CardTitle>
                            <p className="text-slate-500 text-sm">Brand logo image</p>
                          </div>
                        </div>
                        {(logoSetting?.logo || selectedVersion.logoId) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openUpdateModal("logo")}
                            className="border-violet-300 hover:border-violet-500 hover:text-violet-600 transition-colors"
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Update
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="relative">
                        {logoSetting?.logo ? (
                          <div className="group/logo relative bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-8 border-2 border-dashed border-slate-200 hover:border-violet-500 transition-all duration-300">
                            <div className="flex items-center justify-center min-h-[120px]">
                              <Image
                                src={logoSetting.logo}
                                alt="Logo"
                                width={200}
                                height={80}
                                className="max-h-20 object-contain"
                              />
                            </div>
                            <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover/logo:opacity-100 transition-opacity">
                              <div className="text-white text-center">
                                <RefreshCw className="w-8 h-8 mx-auto mb-2" />
                                <p className="text-sm font-medium">Click to update logo</p>
                              </div>
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleUploadOrUpdate(file, "logo", selectedVersion.logoId);
                                }
                              }}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              disabled={uploadingLogo}
                            />
                          </div>
                        ) : (
                          <div className="relative bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-8 border-2 border-dashed border-violet-200 hover:border-violet-400 transition-all duration-300 cursor-pointer group/upload">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleUploadOrUpdate(file, "logo", selectedVersion.logoId);
                                }
                              }}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              disabled={uploadingLogo}
                            />
                            <div className="text-center min-h-[120px] flex flex-col items-center justify-center">
                              {uploadingLogo ? (
                                <div className="space-y-3">
                                  <RefreshCw className="w-12 h-12 animate-spin mx-auto" style={{color: 'rgb(81, 61, 235)'}} />
                                  <p className="font-medium" style={{color: 'rgb(81, 61, 235)'}}>Uploading logo...</p>
                                </div>
                              ) : (
                                <div className="space-y-3 group-hover/upload:scale-105 transition-transform">
                                  <div className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto shadow-lg shadow-violet-500/30" style={{backgroundColor: 'rgb(81, 61, 235)'}}>
                                    <Upload className="w-8 h-8 text-white" />
                                  </div>
                                  <div>
                                    <p className="font-semibold" style={{color: 'rgb(81, 61, 235)'}}>Upload Logo</p>
                                    <p className="text-sm" style={{color: 'rgb(81, 61, 235)'}}>PNG, JPG, SVG up to 10MB</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Banner Management */}
                  <Card className="bg-white/90 backdrop-blur-sm shadow-xl shadow-violet-200/60 group hover:shadow-2xl hover:shadow-violet-300/60 transition-all duration-300 border border-violet-200/50">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg shadow-violet-500/30" style={{backgroundColor: 'rgb(81, 61, 235)'}}>
                            <Monitor className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-xl font-semibold text-slate-800">Banner</CardTitle>
                            <p className="text-slate-500 text-sm">Hero banner image</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {(bannerSetting?.carousel || selectedVersion.bannerId) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openUpdateModal("banner")}
                              className="border-violet-300 hover:border-violet-500 hover:text-violet-600 transition-colors"
                            >
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Update
                            </Button>
                          )}
                          {bannerSetting?.carousel && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleDeleteBanner}
                              className="border-red-300 text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="relative">
                        {bannerSetting?.carousel ? (
                          <div className="group/banner relative bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border-2 border-dashed border-slate-200 hover:border-purple-500 transition-all duration-300">
                            <div className="flex items-center justify-center min-h-[120px]">
                              <Image
                                src={bannerSetting.carousel}
                                alt="Banner"
                                width={300}
                                height={120}
                                className="max-h-28 object-contain rounded-lg"
                              />
                            </div>
                            <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover/banner:opacity-100 transition-opacity">
                              <div className="text-white text-center">
                                <RefreshCw className="w-8 h-8 mx-auto mb-2" />
                                <p className="text-sm font-medium">Click to update banner</p>
                              </div>
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleUploadOrUpdate(file, "banner", selectedVersion.bannerId);
                                }
                              }}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              disabled={uploadingBanner}
                            />
                          </div>
                        ) : (
                          <div className="relative bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-8 border-2 border-dashed border-violet-200 hover:border-violet-400 transition-all duration-300 cursor-pointer group/upload">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleUploadOrUpdate(file, "banner", selectedVersion.bannerId);
                                }
                              }}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              disabled={uploadingBanner}
                            />
                            <div className="text-center min-h-[120px] flex flex-col items-center justify-center">
                              {uploadingBanner ? (
                                <div className="space-y-3">
                                  <RefreshCw className="w-12 h-12 animate-spin mx-auto" style={{color: 'rgb(81, 61, 235)'}} />
                                  <p className="font-medium" style={{color: 'rgb(81, 61, 235)'}}>Uploading banner...</p>
                                </div>
                              ) : (
                                <div className="space-y-3 group-hover/upload:scale-105 transition-transform">
                                  <div className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto shadow-lg shadow-violet-500/30" style={{backgroundColor: 'rgb(81, 61, 235)'}}>
                                    <Upload className="w-8 h-8 text-white" />
                                  </div>
                                  <div>
                                    <p className="font-semibold" style={{color: 'rgb(81, 61, 235)'}}>Upload Banner</p>
                                    <p className="text-sm" style={{color: 'rgb(81, 61, 235)'}}>PNG, JPG, SVG up to 10MB</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl shadow-violet-200/60 hover:shadow-2xl hover:shadow-violet-300/60 transition-all duration-300 border border-violet-200/50">
                <CardContent className="p-12 text-center">
                  <div className="space-y-4">
                    <div className="w-16 h-16 rounded-xl mx-auto flex items-center justify-center shadow-lg shadow-violet-500/30" style={{backgroundColor: 'rgb(81, 61, 235)'}}>
                      <Settings className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-700">Select a Version</h3>
                      <p className="text-slate-500 mt-2">Choose a version from the sidebar to manage its branding assets</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Modern Update Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4" style={{background: 'rgb(81, 61, 235)'}}>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    {modalType === "logo" ? (
                      <ImageIcon className="w-4 h-4 text-white" />
                    ) : (
                      <Monitor className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <h2 className="text-xl font-semibold text-white">
                    Update {modalType === "logo" ? "Logo" : "Banner"}
                  </h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeModal}
                  className="text-white hover:bg-white/20 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              <div>
                <Label htmlFor="file-upload" className="text-sm font-semibold text-slate-700 block mb-3">
                  Select New {modalType === "logo" ? "Logo" : "Banner"} Image
                </Label>
                <div className="relative">
                  <Input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:text-white hover:file:opacity-90 border-2 border-dashed border-violet-300 rounded-xl p-4"
                    style={{'--file-bg': 'rgb(81, 61, 235)'} as React.CSSProperties}
                  />
                </div>
              </div>

              {previewUrl && (
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-slate-700">Preview</Label>
                  <div className="bg-gradient-to-br from-violet-50 to-purple-50 border-2 border-violet-200 rounded-2xl p-6">
                    <div className="flex justify-center">
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        width={modalType === "logo" ? 200 : 300}
                        height={modalType === "logo" ? 100 : 150}
                        className="object-contain rounded-lg max-h-32"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-6 py-4 flex justify-end space-x-3">
              <Button
                variant="ghost"
                onClick={closeModal}
                className="text-slate-600 hover:bg-slate-200"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdate}
                disabled={!selectedFile}
                className="text-white border-0 shadow-lg disabled:opacity-50"
                style={{backgroundColor: 'rgb(81, 61, 235)'}}
              >
                Update {modalType === "logo" ? "Logo" : "Banner"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modern Version Modal */}
      {showVersionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4" style={{background: 'rgb(81, 61, 235)'}}>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <Layers className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">
                    {editingVersion ? "Edit Version" : "Create New Version"}
                  </h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeVersionModal}
                  className="text-white hover:bg-white/20 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              <div>
                <Label htmlFor="version-title" className="text-sm font-semibold text-slate-700 block mb-3">
                  Version Title
                </Label>
                <Input
                  id="version-title"
                  type="text"
                  value={versionTitle}
                  onChange={(e) => setVersionTitle(e.target.value)}
                  placeholder="Enter version title (e.g., Spring 2025, Dark Theme)"
                  className="border-2 border-violet-200 rounded-xl focus:border-violet-500 focus:ring-violet-500"
                />
              </div>

              <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-xl">
                <Checkbox
                  id="version-active"
                  checked={versionActive}
                  onCheckedChange={(checked) => setVersionActive(checked === true)}
                  disabled={editingVersion?.isActive}
                  className="data-[state=checked]:border-violet-500"
                  style={{"--checkbox-bg": "rgb(81, 61, 235)"} as React.CSSProperties}
                />
                <div className="flex-1">
                  <Label htmlFor="version-active" className="text-sm font-medium text-slate-700">
                    Set as Active Version
                  </Label>
                  <p className="text-xs text-slate-500 mt-1">
                    {editingVersion?.isActive 
                      ? "This version is currently active and cannot be deactivated"
                      : "This will become the active version used across the platform"
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-6 py-4 flex justify-end space-x-3">
              <Button
                variant="ghost"
                onClick={closeVersionModal}
                className="text-slate-600 hover:bg-slate-200"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveVersion}
                disabled={!versionTitle}
                className="text-white border-0 shadow-lg disabled:opacity-50 hover:opacity-90"
                style={{backgroundColor: 'rgb(81, 61, 235)'}}
              >
                {editingVersion ? "Update Version" : "Create Version"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}