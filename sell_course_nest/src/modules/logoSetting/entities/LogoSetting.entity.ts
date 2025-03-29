import { VersionSetting } from 'src/modules/vesionSetting/entities/vesionSetting.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('logo_settings')
export class LogoSetting {
  @PrimaryGeneratedColumn('uuid', { name: 'logo_setting_id' })
  logoSettingId: string;

  @Column({ nullable: false })
  logo: string;

  @ManyToOne(() => VersionSetting)
  @JoinColumn({ name: 'version_setting_id' })
  versionSetting: VersionSetting;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
