import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certificate } from './entities/certificate.entity';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { UpdateCertificateDto } from './dto/update-certificate.dto';
import * as xmlbuilder from 'xmlbuilder';
import * as fs from 'fs';
import * as path from 'path';
import { MailService } from '../../utilities/mail.service';

@Injectable()
export class CertificateService {
  constructor(
    @InjectRepository(Certificate)
    private certificateRepository: Repository<Certificate>,
    private mailService: MailService,
  ) {}

  async create(
    createCertificateDto: CreateCertificateDto,
  ): Promise<Certificate> {
    const certificate = this.certificateRepository.create({
      course: { courseId: createCertificateDto.courseId },
      user: { user_id: createCertificateDto.userId },
      title: createCertificateDto.title,
      createdAt: new Date(),
    });
    await this.certificateRepository.save(certificate);
    const certificateData = await this.findOne(certificate.certificateId);

    // Đọc template HTML
    const templatePath = './../../certificate/templates/certificate-email.html';
    console.log(templatePath);
    let htmlContent = fs.readFileSync(templatePath, 'utf8');

    // Thay thế các biến trong template
    htmlContent = htmlContent
      .replace('{{userName}}', certificateData.user.username)
      .replace('{{courseName}}', certificateData.course.title);

    // Gửi email với template HTML
    await this.mailService.sendSimpleEmail(
      certificateData.user.email,
      '🎉 Chúc mừng bạn đã hoàn thành khóa học!',
      htmlContent,
    );

    return certificateData;
  }

  async findAll(): Promise<Certificate[]> {
    return this.certificateRepository.find({
      relations: ['course', 'user'],
    });
  }

  async findByUserId(userId: string): Promise<Certificate[]> {
    return this.certificateRepository.find({
      where: { user: { user_id: userId } },
      relations: ['course', 'user'],
    });
  }

  async findOne(id: string): Promise<Certificate> {
    const certificate = await this.certificateRepository.findOne({
      where: { certificateId: id },
      relations: ['course', 'user'],
    });
    if (!certificate) {
      throw new NotFoundException(`Certificate with ID ${id} not found`);
    }
    return certificate;
  }

  async update(
    id: string,
    updateCertificateDto: UpdateCertificateDto,
  ): Promise<Certificate> {
    const certificate = await this.findOne(id);
    Object.assign(certificate, updateCertificateDto);
    return this.certificateRepository.save(certificate);
  }

  async remove(id: string): Promise<void> {
    const result = await this.certificateRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Certificate with ID ${id} not found`);
    }
  }

  async verifyCertificate(id: string): Promise<boolean> {
    const certificate = await this.findOne(id);
    return !!certificate;
  }

  async generateCertificateXML(id: string): Promise<string> {
    const certificate = await this.findOne(id);

    const xml = xmlbuilder
      .create('certificate')
      .dec('1.0', 'UTF-8')
      .instruction(
        'xml-stylesheet',
        'type="text/xsl" href="/certificates/certificate.xsl"',
      )
      .ele('id', certificate.certificateId)
      .up()
      .ele('title', certificate.title)
      .up()
      .ele('issuedDate', certificate.createdAt.toISOString())
      .up()
      .ele('course')
      .ele('id', certificate.course.courseId)
      .up()
      .ele('name', certificate.course.title)
      .up()
      .up()
      .ele('user')
      .ele('id', certificate.user.user_id)
      .up()
      .ele('name', certificate.user.username)
      .up()
      .ele('email', certificate.user.email)
      .up()
      .up()
      .ele('verification')
      .ele('status', 'valid')
      .up()
      .ele('verifiedAt', new Date().toISOString())
      .up()
      .up()
      .end({ pretty: true });

    // Lưu file XML
    const outputPath = path.join(process.cwd(), 'certificates', `${id}.xml`);
    await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.promises.writeFile(outputPath, xml);

    return xml;
  }
}
