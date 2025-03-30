import {
  CarouselSetting,
  LogoSetting,
  VersionSetting,
} from "@/app/type/settings/Settings";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const settingsApi = {
  getVersionSettings: async () => {
    const response = await axios.get<VersionSetting[]>(
      `${API_URL}/version-settings`
    );
    return Array.isArray(response.data) ? response.data : [];
  },

  getVersionSettingsActive: async () => {
    try {
      // First try getting all versions
      const allVersions = await axios.get<VersionSetting[]>(
        `${API_URL}/version-settings`
      );
      
      // Then find the active one
      const activeVersion = Array.isArray(allVersions.data) 
        ? allVersions.data.find(version => version.isActive) 
        : null;
      
      if (activeVersion) {
        console.log("Found active version from list:", activeVersion);
        return activeVersion;
      }
      
      // If no active version found, try direct endpoint as fallback
      console.log("No active version found in list, trying direct endpoint");
      const response = await axios.get<VersionSetting>(
        `${API_URL}/version-settings/active`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching active version:", error);
      return null;
    }
  },

  createVersion: async (data: {
    VersionSettingtitle: string;
    isActive: boolean;
  }) => {
    const response = await axios.post(`${API_URL}/version-settings`, data);
    return response.data;
  },

  updateVersion: async (
    id: string,
    data: { VersionSettingtitle?: string; isActive?: boolean }
  ) => {
    const response = await axios.patch(
      `${API_URL}/version-settings/${id}`,
      data
    );
    return response.data;
  },

  updateVersionActive: async (id: string, isActive: boolean) => {
    const response = await axios.patch(`${API_URL}/version-settings/${id}`, {
      isActive: isActive,
    });
    return response.data;
  },

  deleteVersion: async (id: string) => {
    await axios.delete(`${API_URL}/version-settings/${id}`);
  },

  deleteCarousel: async (id: string) => {
    await axios.delete(`${API_URL}/carousel-settings/${id}`);
  },

  getLogoByVersionId: async (versionId: string) => {
    const response = await axios.get<LogoSetting[]>(
      `${API_URL}/logo-settings/by-version/${versionId}`
    );
    return response.data;
  },

  getCarouselByVersionId: async (versionId: string) => {
    const response = await axios.get<CarouselSetting[]>(
      `${API_URL}/carousel-settings/by-version/${versionId}`
    );
    return response.data;
  },

  updateLogo: async (versionId: string, file: File) => {
    const formData = new FormData();
    formData.append("imageInfo", file);
    formData.append("versionSettingId", versionId);

    const response = await axios.post(`${API_URL}/logo-settings`, formData);
    return response.data;
  },

  updateCarousel: async (versionId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("versionSettingId", versionId);

    const response = await axios.post(`${API_URL}/carousel-settings`, formData);
    return response.data;
  },

  activateVersion: async (versionId: string) => {
    const response = await axios.patch(
      `${API_URL}/version-settings/${versionId}`,
      {
        isActive: true,
      }
    );
    return response.data;
  },
};