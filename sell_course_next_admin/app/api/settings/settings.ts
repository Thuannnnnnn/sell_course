import { ApiResponse } from "app/types/api-response";
import {
  BannerSetting,
  CreateVersionSettingDto,
  LogoSetting,
  UpdateVersionSettingDto,
  VersionSetting,
} from "app/types/setting";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const settingsApi = {
  // Version Settings
  async getVersionSettings(): Promise<VersionSetting[]> {
    const response = await api.get("/version-settings");
    return response.data;
  },

  async getVersionById(id: string): Promise<VersionSetting> {
    const response = await api.get(`/version-settings/${id}`);
    return response.data;
  },

  async createVersion(data: CreateVersionSettingDto): Promise<VersionSetting> {
    const response = await api.post("/version-settings", data);
    return response.data;
  },

  async updateVersion(
    id: string,
    data: UpdateVersionSettingDto
  ): Promise<VersionSetting> {
    const response = await api.patch(`/version-settings/${id}`, data);
    return response.data;
  },

  async deleteVersion(id: string): Promise<ApiResponse> {
    const response = await api.delete(`/version-settings/${id}`);
    return response.data;
  },

  async updateVersionActive(
    id: string,
    isActive: boolean
  ): Promise<VersionSetting> {
    const response = await api.patch(`/version-settings/${id}`, { isActive });
    return response.data;
  },

  async getActiveVersion(): Promise<VersionSetting> {
    const response = await api.get("/version-settings/active");
    return response.data;
  },

  // Logo Settings
  async getLogoByVersionId(versionId: string): Promise<LogoSetting[]> {
    const response = await api.get(`/logo-settings/by-version/${versionId}`);
    return response.data;
  },

  async updateLogo(versionId: string, file: File, logoId: string): Promise<LogoSetting> {
    const formData = new FormData();
    formData.append("imageInfo", file);
    formData.append("versionSettingId", versionId);

    const response = await api.patch(`/logo-settings/${logoId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  async deleteLogo(id: string): Promise<ApiResponse> {
    const response = await api.delete(`/logo-settings/${id}`);
    return response.data;
  },

  // Banner Settings (formerly Carousel)
  async getBannerByVersionId(versionId: string): Promise<BannerSetting | null> {
    try {
      const response = await api.get(
        `/carousel-settings/by-version/${versionId}`
      );
      return response.data.length > 0 ? response.data[0] : null;
    } catch (error) {
      return error instanceof Error ? null : null;
    }
  },

  async updateBanner(versionId: string, file: File, bannerId: string): Promise<BannerSetting> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("versionSettingId", versionId);

    const response = await api.patch(`/carousel-settings/${bannerId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  async deleteBanner(id: string): Promise<ApiResponse> {
    const response = await api.delete(`/carousel-settings/${id}`);
    return response.data;
  },
};
