import { VersionSetting } from "./version-setting";

export interface LogoSetting {
  logoSettingId: string;
  logo: string;
  versionSetting: VersionSetting;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLogoSettingDto {
  logo?: string;
  versionSettingId: string;
}

export interface UpdateLogoSettingDto {
  logo?: string;
  versionSettingId?: string;
}

export interface LogoSettingFormData {
  versionSettingId: string;
  imageFile?: File;
}