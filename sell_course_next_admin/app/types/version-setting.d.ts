export interface VersionSetting {
  versionSettingId: string;
  isActive: boolean;
  VersionSettingtitle?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVersionSettingDto {
  isActive?: boolean;
  VersionSettingtitle?: string;
}

export interface UpdateVersionSettingDto {
  isActive?: boolean;
  VersionSettingtitle?: string;
}