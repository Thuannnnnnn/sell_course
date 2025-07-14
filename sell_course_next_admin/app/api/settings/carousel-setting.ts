import { CarouselSetting, CarouselSettingFormData } from "../../types/carousel-setting";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const carouselSettingApi = {
  // Lấy tất cả carousel settings
  getAll: async (): Promise<CarouselSetting[]> => {
    const response = await fetch(`${API_BASE_URL}/carousel-settings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch carousel settings');
    }
    
    return response.json();
  },

  // Lấy carousel setting theo ID
  getById: async (id: string): Promise<CarouselSetting> => {
    const response = await fetch(`${API_BASE_URL}/carousel-settings/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch carousel setting');
    }
    
    return response.json();
  },

  // Lấy carousel settings theo version ID
  getByVersionId: async (versionId: string): Promise<CarouselSetting[]> => {
    const response = await fetch(`${API_BASE_URL}/carousel-settings/by-version/${versionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch carousel settings by version');
    }
    
    return response.json();
  },

  // Tạo carousel setting mới
  create: async (data: CarouselSettingFormData): Promise<CarouselSetting> => {
    const formData = new FormData();
    formData.append('versionSettingId', data.versionSettingId);
    
    if (data.imageFile) {
      formData.append('file', data.imageFile);
    }
    
    const response = await fetch(`${API_BASE_URL}/carousel-settings`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to create carousel setting');
    }
    
    return response.json();
  },

  // Cập nhật carousel setting
  update: async (id: string, data: CarouselSettingFormData): Promise<CarouselSetting> => {
    const formData = new FormData();
    formData.append('versionSettingId', data.versionSettingId);
    
    if (data.imageFile) {
      formData.append('file', data.imageFile);
    }
    
    const response = await fetch(`${API_BASE_URL}/carousel-settings/${id}`, {
      method: 'PATCH',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to update carousel setting');
    }
    
    return response.json();
  },

  // Xóa carousel setting
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/carousel-settings/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete carousel setting');
    }
  },
};