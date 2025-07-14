"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { toast } from "sonner";
import { versionSettingApi } from "../../app/api/settings/version-setting";
import { VersionSetting, CreateVersionSettingDto, UpdateVersionSettingDto } from "../../app/types/version-setting";

interface VersionSettingFormProps {
  versionSetting?: VersionSetting;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function VersionSettingForm({ versionSetting, onSuccess, onCancel }: VersionSettingFormProps) {
  const [formData, setFormData] = useState<{
    VersionSettingtitle: string;
    isActive: boolean;
  }>({
    VersionSettingtitle: versionSetting?.VersionSettingtitle || "",
    isActive: versionSetting?.isActive ?? true,
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (versionSetting) {
        // Update existing version setting
        const updateData: UpdateVersionSettingDto = {
          VersionSettingtitle: formData.VersionSettingtitle,
          isActive: formData.isActive,
        };
        await versionSettingApi.update(versionSetting.versionSettingId, updateData);
        toast.success("Cập nhật phiên bản thành công!");
      } else {
        // Create new version setting
        const createData: CreateVersionSettingDto = {
          VersionSettingtitle: formData.VersionSettingtitle,
          isActive: formData.isActive,
        };
        await versionSettingApi.create(createData);
        toast.success("Tạo phiên bản thành công!");
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
          {versionSetting ? "Cập nhật phiên bản" : "Tạo phiên bản mới"}
        </CardTitle>
        <CardDescription>
          {versionSetting 
            ? "Chỉnh sửa thông tin phiên bản setting" 
            : "Tạo phiên bản setting mới để quản lý logo và banner"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tiêu đề phiên bản</Label>
            <Input
              id="title"
              type="text"
              value={formData.VersionSettingtitle}
              onChange={(e) => setFormData(prev => ({ ...prev, VersionSettingtitle: e.target.value }))}
              placeholder="Nhập tiêu đề phiên bản"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
            />
            <Label htmlFor="active">Kích hoạt</Label>
          </div>

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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Đang xử lý..." : (versionSetting ? "Cập nhật" : "Tạo mới")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}