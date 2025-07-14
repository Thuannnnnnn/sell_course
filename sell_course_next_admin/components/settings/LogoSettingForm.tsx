"use client";

import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { toast } from "sonner";
import { logoSettingApi } from "../../app/api/settings/logo-setting";
import { versionSettingApi } from "../../app/api/settings/version-setting";
import { LogoSetting, LogoSettingFormData } from "../../app/types/logo-setting";
import { VersionSetting } from "../../app/types/version-setting";
import Image from "next/image";

interface LogoSettingFormProps {
  logoSetting?: LogoSetting;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function LogoSettingForm({ logoSetting, onSuccess, onCancel }: LogoSettingFormProps) {
  const [formData, setFormData] = useState<LogoSettingFormData>({
    versionSettingId: logoSetting?.versionSetting?.versionSettingId || "",
    imageFile: undefined,
  });

  const [versionSettings, setVersionSettings] = useState<VersionSetting[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingVersions, setIsLoadingVersions] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(logoSetting?.logo || null);

  // Load version settings
  useEffect(() => {
    const loadVersionSettings = async () => {
      try {
        const versions = await versionSettingApi.getAll();
        setVersionSettings(versions);
      } catch {
        toast.error("Không thể tải danh sách phiên bản!");
      } finally {
        setIsLoadingVersions(false);
      }
    };

    loadVersionSettings();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Vui lòng chọn file hình ảnh!");
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File quá lớn! Vui lòng chọn file nhỏ hơn 5MB.");
        return;
      }

      setFormData(prev => ({ ...prev, imageFile: file }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!formData.versionSettingId) {
        toast.error("Vui lòng chọn phiên bản!");
        return;
      }

      if (!logoSetting && !formData.imageFile) {
        toast.error("Vui lòng chọn hình ảnh logo!");
        return;
      }

      if (logoSetting) {
        // Update existing logo setting
        await logoSettingApi.update(logoSetting.logoSettingId, formData);
        toast.success("Cập nhật logo thành công!");
      } else {
        // Create new logo setting
        await logoSettingApi.create(formData);
        toast.success("Tạo logo thành công!");
      }
      
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>
          {logoSetting ? "Cập nhật logo" : "Tạo logo mới"}
        </CardTitle>
        <CardDescription>
          {logoSetting 
            ? "Chỉnh sửa thông tin logo" 
            : "Tạo logo mới cho website"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="version">Phiên bản</Label>
            <Select
              value={formData.versionSettingId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, versionSettingId: value }))}
              disabled={isLoadingVersions}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn phiên bản" />
              </SelectTrigger>
              <SelectContent>
                {versionSettings.map((version) => (
                  <SelectItem key={version.versionSettingId} value={version.versionSettingId}>
                    {version.VersionSettingtitle || `Phiên bản ${version.versionSettingId.slice(0, 8)}`}
                    {version.isActive && " (Đang hoạt động)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo">Hình ảnh logo</Label>
            <Input
              id="logo"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isLoading}
            />
            <p className="text-sm text-muted-foreground">
              Chấp nhận: JPG, PNG, GIF. Kích thước tối đa: 5MB
            </p>
          </div>

          {previewUrl && (
            <div className="space-y-2">
              <Label>Xem trước</Label>
              <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
                <Image
                  src={previewUrl}
                  alt="Logo preview"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Hủy
              </Button>
            )}
            <Button type="submit" disabled={isLoading || isLoadingVersions}>
              {isLoading ? "Đang xử lý..." : (logoSetting ? "Cập nhật" : "Tạo mới")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}