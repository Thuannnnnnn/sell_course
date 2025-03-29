export interface VersionSetting {
  versionSettingId: string;
  VersionSettingtitle: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LogoSetting {
  logoSettingId: string;
  logo: string;
  versionSetting: VersionSetting;
}

export interface CarouselSetting {
  carouselSettingId: string;
  carousel: string;
  versionSetting: VersionSetting;
}
