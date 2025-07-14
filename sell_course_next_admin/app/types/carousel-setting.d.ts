import { VersionSetting } from "./version-setting";

export interface CarouselSetting {
  carouselSettingId: string;
  carousel: string;
  versionSetting: VersionSetting;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCarouselSettingDto {
  carousel?: string;
  versionSettingId: string;
}

export interface UpdateCarouselSettingDto {
  carousel?: string;
  versionSettingId?: string;
}

export interface CarouselSettingFormData {
  versionSettingId: string;
  imageFile?: File;
}