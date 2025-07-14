import { VersionSetting, CreateVersionSettingDto, UpdateVersionSettingDto } from "../../types/version-setting";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const versionSettingApi = {
  // Lấy tất cả version settings
  getAll: async (): Promise<VersionSetting[]> => {
    const response = await fetch(`${API_BASE_URL}/version-settings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch version settings');
    }
    
    return response.json();
  },

  // Lấy version setting theo ID
  getById: async (id: string): Promise<VersionSetting> => {
    const response = await fetch(`${API_BASE_URL}/version-settings/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch version setting');
    }
    
    return response.json();
  },

  // Tạo version setting mới
  create: async (data: CreateVersionSettingDto): Promise<VersionSetting> => {
    const response = await fetch(`${API_BASE_URL}/version-settings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create version setting');
    }
    
    return response.json();
  },

  // Cập nhật version setting
  update: async (id: string, data: UpdateVersionSettingDto): Promise<VersionSetting> => {
    const response = await fetch(`${API_BASE_URL}/version-settings/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update version setting');
    }
    
    return response.json();
  },

  // Xóa version setting
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/version-settings/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete version setting');
    }
  },

  // Lấy version setting đang hoạt động
  getActive: async (): Promise<VersionSetting> => {
    const response = await fetch(`${API_BASE_URL}/version-settings/active`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch active version setting');
    }
    
    return response.json();
  },
};