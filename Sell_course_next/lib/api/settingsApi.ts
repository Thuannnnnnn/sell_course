import { ApiResponse } from "../../app/types/setting";
import {
  BannerSetting,
  CreateVersionSettingDto,
  LogoSetting,
  UpdateVersionSettingDto,
  VersionSetting,
} from "../../app/types/setting";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

function isAxiosErrorWithMessage(error: unknown): error is { response: { data: { message: string } } } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: unknown }).response === 'object' &&
    (error as { response?: unknown }).response !== null &&
    'data' in (error as { response: { data?: unknown } }).response &&
    typeof (error as { response: { data?: unknown } }).response.data === 'object' &&
    (error as { response: { data?: unknown } }).response.data !== null &&
    'message' in (error as { response: { data: { message?: unknown } } }).response.data
  );
}

export const settingsApi = {
  // Version Settings
  async getVersionSettings(): Promise<VersionSetting[]> {
    try {
      const response = await api.get("/version-settings");
      return response.data;
    } catch (error) {
      if (isAxiosErrorWithMessage(error)) {
        throw new Error(error.response.data.message);
      }
      throw new Error("Failed to fetch version settings.");
    }
  },

  async getVersionById(id: string): Promise<VersionSetting> {
    try {
      const response = await api.get(`/version-settings/${id}`);
      return response.data;
    } catch (error) {
      if (isAxiosErrorWithMessage(error)) {
        throw new Error(error.response.data.message);
      }
      throw new Error("Failed to fetch version by id.");
    }
  },

  async createVersion(data: CreateVersionSettingDto): Promise<VersionSetting> {
    try {
      const response = await api.post("/version-settings", data);
      return response.data;
    } catch (error) {
      if (isAxiosErrorWithMessage(error)) {
        throw new Error(error.response.data.message);
      }
      throw new Error("Failed to create version setting.");
    }
  },

  async updateVersion(
    id: string,
    data: UpdateVersionSettingDto
  ): Promise<VersionSetting> {
    try {
      const response = await api.patch(`/version-settings/${id}`, data);
      return response.data;
    } catch (error) {
      if (isAxiosErrorWithMessage(error)) {
        throw new Error(error.response.data.message);
      }
      throw new Error("Failed to update version setting.");
    }
  },

  async deleteVersion(id: string): Promise<ApiResponse> {
    try {
      const response = await api.delete(`/version-settings/${id}`);
      return response.data;
    } catch (error) {
      if (isAxiosErrorWithMessage(error)) {
        throw new Error(error.response.data.message);
      }
      throw new Error("Failed to delete version setting.");
    }
  },

  async updateVersionActive(
    id: string,
    isActive: boolean
  ): Promise<VersionSetting> {
    try {
      const response = await api.patch(`/version-settings/${id}`, { isActive });
      return response.data;
    } catch (error) {
      if (isAxiosErrorWithMessage(error)) {
        throw new Error(error.response.data.message);
      }
      throw new Error("Failed to update version active status.");
    }
  },

  async getActiveVersion(): Promise<VersionSetting> {
    try {
      const response = await api.get(`${API_BASE_URL}/version-settings/active`);
      return response.data;
    } catch (error) {
      if (isAxiosErrorWithMessage(error)) {
        throw new Error(error.response.data.message);
      }
      throw new Error("Failed to fetch active version.");
    }
  },

  // Logo Settings
  async getLogoByVersionId(versionId: string): Promise<LogoSetting[]> {
    try {
      const response = await api.get(`/logo-settings/by-version/${versionId}`);
      console.log("getLogoByVersionId", response.data);
      return response.data
    } catch (error) {
      if (isAxiosErrorWithMessage(error)) {
        throw new Error(error.response.data.message);
      }
      throw new Error("Failed to fetch logo settings.");
    }
    
  },

  async updateLogo(versionId: string, file: File, logoId: string): Promise<LogoSetting> {
    const formData = new FormData();
    formData.append("imageInfo", file);
    formData.append("versionSettingId", versionId);
    try {
      const response = await api.patch(`/logo-settings/${logoId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      if (isAxiosErrorWithMessage(error)) {
        throw new Error(error.response.data.message);
      }
      throw new Error("Failed to upload/update logo. Please try again.");
    }
  },

  async deleteLogo(id: string): Promise<ApiResponse> {
    try {
      const response = await api.delete(`/logo-settings/${id}`);
      return response.data;
    } catch (error) {
      if (isAxiosErrorWithMessage(error)) {
        throw new Error(error.response.data.message);
      }
      throw new Error("Failed to delete logo.");
    }
  },

  async createLogo(versionId: string, file: File): Promise<LogoSetting> {
    const formData = new FormData();
    formData.append("imageInfo", file);
    formData.append("versionSettingId", versionId);
    try {
      const response = await api.post(`/logo-settings`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      if (isAxiosErrorWithMessage(error)) {
        throw new Error(error.response.data.message);
      }
      throw new Error("Failed to upload logo. Please try again.");
    }
  },

  // Banner Settings (formerly Carousel)
  async getBannerByVersionId(versionId: string): Promise<BannerSetting | null> {
    try {
      const response = await api.get(
        `/carousel-settings/by-version/${versionId}`
      );
      return response.data.length > 0 ? response.data[0] : null;
    } catch (error) {
      if (isAxiosErrorWithMessage(error)) {
        throw new Error(error.response.data.message);
      }
      return null;
    }
  },

  async updateBanner(versionId: string, file: File, bannerId: string): Promise<BannerSetting> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("versionSettingId", versionId);
    try {
      const response = await api.patch(`/carousel-settings/${bannerId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      if (isAxiosErrorWithMessage(error)) {
        throw new Error(error.response.data.message);
      }
      throw new Error("Failed to upload/update banner. Please try again.");
    }
  },

  async deleteBanner(id: string): Promise<ApiResponse> {
    try {
      const response = await api.delete(`/carousel-settings/${id}`);
      return response.data;
    } catch (error) {
      if (isAxiosErrorWithMessage(error)) {
        throw new Error(error.response.data.message);
      }
      throw new Error("Failed to delete banner.");
    }
  },

  async createBanner(versionId: string, file: File): Promise<BannerSetting> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("versionSettingId", versionId);
    try {
      const response = await api.post(`/carousel-settings`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      if (isAxiosErrorWithMessage(error)) {
        throw new Error(error.response.data.message);
      }
      throw new Error("Failed to upload banner. Please try again.");
    }
  },
};
