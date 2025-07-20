import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certificate } from './entities/certificate.entity';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { UpdateCertificateDto } from './dto/update-certificate.dto';
import * as xmlbuilder from 'xmlbuilder';
import * as fs from 'fs';
import * as path from 'path';
import * as puppeteer from 'puppeteer'; // npm install puppeteer
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
    const templatePath = path.join(
      process.cwd(),
      'src',
      'modules',
      'certificate',
      'templates',
      'certificate-email.html',
    );
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

  async generateCertificatePDF(id: string): Promise<Buffer> {
    const certificate = await this.findOne(id);

    // Tạo HTML content thay vì XML
    const htmlContent = this.generateCertificateHTML(certificate);

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

      const pdf = await page.pdf({
        format: 'A4',
        landscape: true,
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px',
        },
      });
      // Convert Uint8Array to Buffer
      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }

  private generateCertificateHTML(certificate: Certificate): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Certificate of Completion</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Open+Sans:wght@300;400;600&display=swap');
            
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Open Sans', sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 20px;
            }
            
            .certificate {
                background: white;
                width: 800px;
                padding: 60px 80px;
                border-radius: 20px;
                text-align: center;
                position: relative;
                border: 8px solid #f8f9fa;
            }
            
            .certificate::before {
                content: '';
                position: absolute;
                top: 20px;
                left: 20px;
                right: 20px;
                bottom: 20px;
                border: 3px solid #667eea;
                border-radius: 12px;
                pointer-events: none;
            }
            
            .header {
                margin-bottom: 40px;
            }
            
            .logo {
                width: 80px;
                height: 80px;
                background: linear-gradient(135deg, #667eea, #764ba2);
                border-radius: 50%;
                margin: 0 auto 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 32px;
                font-weight: bold;
            }
            
            .institution {
                font-size: 24px;
                font-weight: 600;
                color: #2c3e50;
                margin-bottom: 10px;
            }
            
            .subtitle {
                font-size: 16px;
                color: #7f8c8d;
                font-weight: 300;
            }
            
            .title {
                font-family: 'Playfair Display', serif;
                font-size: 48px;
                font-weight: 700;
                color: #2c3e50;
                margin: 40px 0 20px;
                line-height: 1.2;
            }
            
            .presented-to {
                font-size: 18px;
                color: #7f8c8d;
                margin-bottom: 10px;
                font-weight: 300;
            }
            
            .recipient-name {
                font-family: 'Playfair Display', serif;
                font-size: 36px;
                font-weight: 700;
                color: #667eea;
                margin-bottom: 30px;
                padding: 10px 0;
                border-bottom: 3px solid #667eea;
                display: inline-block;
            }
            
            .completion-text {
                font-size: 18px;
                color: #2c3e50;
                line-height: 1.6;
                margin-bottom: 10px;
            }
            
            .course-name {
                font-size: 24px;
                font-weight: 600;
                color: #764ba2;
                margin: 20px 0 40px;
            }
            
            .footer {
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
                margin-top: 60px;
                padding-top: 40px;
                border-top: 2px solid #ecf0f1;
            }
            
            .date-section, .verification-section {
                text-align: center;
                flex: 1;
            }
            
            .date-label, .verification-label {
                font-size: 14px;
                color: #7f8c8d;
                margin-bottom: 5px;
                font-weight: 300;
            }
            
            .date-value, .verification-value {
                font-size: 16px;
                color: #2c3e50;
                font-weight: 600;
            }
            
            .signature-section {
                text-align: center;
                flex: 1;
            }
            
            .signature-line {
                width: 200px;
                height: 1px;
                background: #2c3e50;
                margin: 0 auto 10px;
            }
            
            .signature-label {
                font-size: 14px;
                color: #7f8c8d;
                font-weight: 300;
            }
            
            .verification-id {
                position: absolute;
                bottom: 10px;
                right: 20px;
                font-size: 10px;
                color: #bdc3c7;
                font-family: monospace;
            }
        </style>
    </head>
    <body>
        <div class="certificate">
            <div class="verification-id">ID: ${certificate.certificateId}</div>
            
            <div class="header">
                <div class="logo">🎓</div>
                <div class="institution">Learning Management System</div>
                <div class="subtitle">Official Certificate of Completion</div>
            </div>
            
            <div class="title">Certificate of Achievement</div>
            
            <div class="presented-to">This certificate is proudly presented to</div>
            <div class="recipient-name">${certificate.user.username}</div>
            
            <div class="completion-text">
                For successfully completing the course
            </div>
            <div class="course-name">${certificate.course.title}</div>
            
            <div class="completion-text">
                This achievement demonstrates dedication, skill, and commitment to continuous learning.
            </div>
            
            <div class="footer">
                <div class="date-section">
                    <div class="date-label">Date Issued</div>
                    <div class="date-value">${certificate.createdAt.toISOString().substring(0, 10)}</div>
                </div>
                
                <div class="signature-section">
                    <div class="signature-line"></div>
                    <div class="signature-label">Authorized Signature</div>
                </div>
                
                <div class="verification-section">
                    <div class="verification-label">Status</div>
                    <div class="verification-value">Valid</div>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
  }
}