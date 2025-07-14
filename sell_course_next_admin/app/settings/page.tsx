"use client";

import { useState, useEffect } from "react";
import { Button } from "components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { toast } from "sonner";
import { Plus, Edit, Trash2, Settings } from "lucide-react";
// import { versionSettingApi } from "@/app/api/settings/version-setting";
// import { logoSettingApi } from "@/app/api/settings/logo-setting";
// import { carouselSettingApi } from "@/app/api/settings/carousel-setting";
// import { VersionSetting } from "@/app/types/version-setting";
// import { LogoSetting } from "@/app/types/logo-setting";
// import { CarouselSetting } from "@/app/types/carousel-setting";
// import VersionSettingForm from "@/components/settings/VersionSettingForm";
// import LogoSettingForm from "@/components/settings/LogoSettingForm";
// import CarouselSettingForm from "@/components/settings/CarouselSettingForm";
import Image from "next/image";
import { VersionSetting } from "app/types/version-setting";
import { LogoSetting } from "app/types/logo-setting";
import { CarouselSetting } from "app/types/carousel-setting";
import { carouselSettingApi, logoSettingApi, versionSettingApi } from "app/api/settings";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "components/ui/alert-dialog";
import { CarouselSettingForm, LogoSettingForm, VersionSettingForm } from "components/settings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "components/ui/card";
import { Badge } from "components/ui/badge";

export default function SettingsPage() {
  const [versionSettings, setVersionSettings] = useState<VersionSetting[]>([]);
  const [logoSettings, setLogoSettings] = useState<LogoSetting[]>([]);
  const [carouselSettings, setCarouselSettings] = useState<CarouselSetting[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<string>("");
  
  const [isLoading, setIsLoading] = useState(true);
  const [isVersionDialogOpen, setIsVersionDialogOpen] = useState(false);
  const [isLogoDialogOpen, setIsLogoDialogOpen] = useState(false);
  const [isCarouselDialogOpen, setIsCarouselDialogOpen] = useState(false);
  
  const [editingVersionSetting, setEditingVersionSetting] = useState<VersionSetting | undefined>();
  const [editingLogoSetting, setEditingLogoSetting] = useState<LogoSetting | undefined>();
  const [editingCarouselSetting, setEditingCarouselSetting] = useState<CarouselSetting | undefined>();

  // Load data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [versions, logos, carousels] = await Promise.all([
        versionSettingApi.getAll(),
        logoSettingApi.getAll(),
        carouselSettingApi.getAll()
      ]);
      
      setVersionSettings(versions);
      setLogoSettings(logos);
      setCarouselSettings(carousels);
      
      // Set default selected version to active version
      const activeVersion = versions.find(v => v.isActive);
      if (activeVersion) {
        setSelectedVersion(activeVersion.versionSettingId);
      }
    } catch {
      toast.error("Không thể tải dữ liệu settings!");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter settings by selected version
  const filteredLogos = logoSettings.filter(logo => 
    selectedVersion ? logo.versionSetting?.versionSettingId === selectedVersion : true
  );
  
  const filteredCarousels = carouselSettings.filter(carousel => 
    selectedVersion ? carousel.versionSetting?.versionSettingId === selectedVersion : true
  );

  // Delete handlers
  const handleDeleteVersion = async (id: string) => {
    try {
      await versionSettingApi.delete(id);
      toast.success("Xóa phiên bản thành công!");
      loadData();
    } catch {
      toast.error("Không thể xóa phiên bản!");
    }
  };

  const handleDeleteLogo = async (id: string) => {
    try {
      await logoSettingApi.delete(id);
      toast.success("Xóa logo thành công!");
      loadData();
    } catch {
      toast.error("Không thể xóa logo!");
    }
  };

  const handleDeleteCarousel = async (id: string) => {
    try {
      await carouselSettingApi.delete(id);
      toast.success("Xóa banner thành công!");
      loadData();
    } catch {
      toast.error("Không thể xóa banner!");
    }
  };

  // Form success handlers
  const handleFormSuccess = () => {
    loadData();
    setIsVersionDialogOpen(false);
    setIsLogoDialogOpen(false);
    setIsCarouselDialogOpen(false);
    setEditingVersionSetting(undefined);
    setEditingLogoSetting(undefined);
    setEditingCarouselSetting(undefined);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Settings</h1>
          <p className="text-muted-foreground">Quản lý logo, banner và phiên bản website</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isVersionDialogOpen} onOpenChange={setIsVersionDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Thêm phiên bản
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Tạo phiên bản mới</DialogTitle>
              </DialogHeader>
              <VersionSettingForm
                onSuccess={handleFormSuccess}
                onCancel={() => setIsVersionDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="versions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="versions">Phiên bản</TabsTrigger>
          <TabsTrigger value="logos">Logo</TabsTrigger>
          <TabsTrigger value="banners">Banner</TabsTrigger>
        </TabsList>

        <TabsContent value="versions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {versionSettings.map((version) => (
              <Card key={version.versionSettingId} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {version.VersionSettingtitle || `Phiên bản ${version.versionSettingId.slice(0, 8)}`}
                    </CardTitle>
                    <Badge variant={version.isActive ? "default" : "secondary"}>
                      {version.isActive ? "Hoạt động" : "Không hoạt động"}
                    </Badge>
                  </div>
                  <CardDescription>
                    Tạo: {new Date(version.createdAt).toLocaleDateString("vi-VN")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedVersion(version.versionSettingId)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Chọn phiên bản
                    </Button>
                    
                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingVersionSetting(version)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Chỉnh sửa phiên bản</DialogTitle>
                          </DialogHeader>
                          <VersionSettingForm
                            versionSetting={editingVersionSetting}
                            onSuccess={handleFormSuccess}
                            onCancel={() => setEditingVersionSetting(undefined)}
                          />
                        </DialogContent>
                      </Dialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                            <AlertDialogDescription>
                              Bạn có chắc muốn xóa phiên bản này? Hành động này không thể hoàn tác.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteVersion(version.versionSettingId)}>
                              Xóa
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="logos" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Phiên bản hiện tại:</span>
              <Badge variant="outline">
                {versionSettings.find(v => v.versionSettingId === selectedVersion)?.VersionSettingtitle || "Chưa chọn"}
              </Badge>
            </div>
            <Dialog open={isLogoDialogOpen} onOpenChange={setIsLogoDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm logo
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Tạo logo mới</DialogTitle>
                </DialogHeader>
                <LogoSettingForm
                  onSuccess={handleFormSuccess}
                  onCancel={() => setIsLogoDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLogos.map((logo) => (
              <Card key={logo.logoSettingId}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Logo</CardTitle>
                  <CardDescription>
                    {logo.versionSetting?.VersionSettingtitle || "Không có tiêu đề"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative w-full h-32 border rounded-lg overflow-hidden">
                    <Image
                      src={logo.logo}
                      alt="Logo"
                      fill
                      className="object-contain"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingLogoSetting(logo)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Chỉnh sửa logo</DialogTitle>
                        </DialogHeader>
                        <LogoSettingForm
                          logoSetting={editingLogoSetting}
                          onSuccess={handleFormSuccess}
                          onCancel={() => setEditingLogoSetting(undefined)}
                        />
                      </DialogContent>
                    </Dialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                          <AlertDialogDescription>
                            Bạn có chắc muốn xóa logo này? Hành động này không thể hoàn tác.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteLogo(logo.logoSettingId)}>
                            Xóa
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="banners" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Phiên bản hiện tại:</span>
              <Badge variant="outline">
                {versionSettings.find(v => v.versionSettingId === selectedVersion)?.VersionSettingtitle || "Chưa chọn"}
              </Badge>
            </div>
            <Dialog open={isCarouselDialogOpen} onOpenChange={setIsCarouselDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm banner
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Tạo banner mới</DialogTitle>
                </DialogHeader>
                <CarouselSettingForm
                  onSuccess={handleFormSuccess}
                  onCancel={() => setIsCarouselDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCarousels.map((carousel) => (
              <Card key={carousel.carouselSettingId}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Banner</CardTitle>
                  <CardDescription>
                    {carousel.versionSetting?.VersionSettingtitle || "Không có tiêu đề"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative w-full h-48 border rounded-lg overflow-hidden">
                    <Image
                      src={carousel.carousel}
                      alt="Banner"
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingCarouselSetting(carousel)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Chỉnh sửa banner</DialogTitle>
                        </DialogHeader>
                        <CarouselSettingForm
                          carouselSetting={editingCarouselSetting}
                          onSuccess={handleFormSuccess}
                          onCancel={() => setEditingCarouselSetting(undefined)}
                        />
                      </DialogContent>
                    </Dialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                          <AlertDialogDescription>
                            Bạn có chắc muốn xóa banner này? Hành động này không thể hoàn tác.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteCarousel(carousel.carouselSettingId)}>
                            Xóa
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}