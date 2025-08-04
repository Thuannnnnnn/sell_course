import { Module } from '@nestjs/common';
import { CertificateController } from './certificate.controller';
import { CertificateStaticController } from './certificateStatic.controller';
import { PublicCertificateController } from './public-certificate.controller';
import { CertificateService } from './certificate.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Certificate } from './entities/certificate.entity';
import { MailService } from '../../utilities/mail.service';

@Module({
  imports: [TypeOrmModule.forFeature([Certificate])],
  controllers: [
    CertificateController, 
    CertificateStaticController,
    PublicCertificateController,
  ],
  providers: [CertificateService, MailService],
  exports: [CertificateService],
})
export class CertificateModule {}