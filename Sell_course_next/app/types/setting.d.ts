// Types for Settings
export interface VersionSetting {
  versionSettingId: string;
  isActive: boolean;
  VersionSettingtitle: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LogoSetting {
  logoSettingId: string;
  logo: string;
  versionSetting: VersionSetting;
  createdAt: Date;
  updatedAt: Date;
}

export interface BannerSetting {
  carouselSettingId: string;
  carousel: string;
  versionSetting: VersionSetting;
  createdAt: Date;
  updatedAt: Date;
}

// DTOs for API calls
export interface CreateVersionSettingDto {
  VersionSettingtitle: string;
  isActive: boolean;
}

export interface UpdateVersionSettingDto {
  VersionSettingtitle?: string;
  isActive?: boolean;
}

export interface CreateLogoSettingDto {
  versionSettingId: string;
}

export interface UpdateLogoSettingDto {
  versionSettingId?: string;
}

export interface CreateBannerSettingDto {
  versionSettingId: string;
}

export interface UpdateBannerSettingDto {
  versionSettingId?: string;
}

// API Response types
export interface ApiResponse {
  message: string;
  success: boolean;
}

