import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { VersionSetting } from '../../vesionSetting/entities/vesionSetting.entity';

@Entity('carousel_settings')
export class CarouselSetting {
  @PrimaryGeneratedColumn('uuid', { name: 'carousel_setting_id' })
  carouselSettingId: string;

  @Column({ nullable: false })
  carousel: string;

  @ManyToOne(() => VersionSetting, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'version_setting_id' })
  versionSetting: VersionSetting;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
