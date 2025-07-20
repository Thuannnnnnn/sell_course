import { Module } from '@nestjs/common';
import { CertificateController } from './certificate.controller';
import { CertificateStaticController } from './certificateStatic.controller'; // Add this import
import { CertificateService } from './certificate.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Certificate } from './entities/certificate.entity';
import { MailService } from '../../utilities/mail.service';

@Module({
  imports: [TypeOrmModule.forFeature([Certificate])],
  controllers: [
    CertificateController, 
    CertificateStaticController  // Add this controller
  ],
  providers: [CertificateService, MailService],
  exports: [CertificateService],
})
export class CertificateModule {}