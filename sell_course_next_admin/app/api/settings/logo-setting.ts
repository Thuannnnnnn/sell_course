import { LogoSetting, LogoSettingFormData } from "../../types/logo-setting";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const logoSettingApi = {
  // Lấy tất cả logo settings
  getAll: async (): Promise<LogoSetting[]> => {
    const response = await fetch(`${API_BASE_URL}/logo-settings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch logo settings');
    }
    
    return response.json();
  },

  // Lấy logo setting theo ID
  getById: async (id: string): Promise<LogoSetting> => {
    const response = await fetch(`${API_BASE_URL}/logo-settings/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch logo setting');
    }
    
    return response.json();
  },

  // Lấy logo settings theo version ID
  getByVersionId: async (versionId: string): Promise<LogoSetting[]> => {
    const response = await fetch(`${API_BASE_URL}/logo-settings/by-version/${versionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch logo settings by version');
    }
    
    return response.json();
  },

  // Tạo logo setting mới
  create: async (data: LogoSettingFormData): Promise<LogoSetting> => {
    const formData = new FormData();
    formData.append('versionSettingId', data.versionSettingId);
    
    if (data.imageFile) {
      formData.append('imageInfo', data.imageFile);
    }
    
    const response = await fetch(`${API_BASE_URL}/logo-settings`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to create logo setting');
    }
    
    return response.json();
  },

  // Cập nhật logo setting
  update: async (id: string, data: LogoSettingFormData): Promise<LogoSetting> => {
    const formData = new FormData();
    formData.append('versionSettingId', data.versionSettingId);
    
    if (data.imageFile) {
      formData.append('imageInfo', data.imageFile);
    }
    
    const response = await fetch(`${API_BASE_URL}/logo-settings/${id}`, {
      method: 'PATCH',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to update logo setting');
    }
    
    return response.json();
  },

  // Xóa logo setting
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/logo-settings/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete logo setting');
    }
  },
};