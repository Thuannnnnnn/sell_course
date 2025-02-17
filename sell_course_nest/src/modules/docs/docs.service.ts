import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Docs } from './entities/docs.entity';
import { Repository } from 'typeorm';
import { DocsResponseDTO } from './dto/docResponseData.dto';
import { DocsRequestDTO } from './dto/docRequestData.dto';
import { Contents } from '../contents/entities/contents.entity';
import { azureUpload } from 'src/utilities/azure.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DocsService {
  constructor(
    @InjectRepository(Docs)
    private readonly DocsRepository: Repository<Docs>,
    @InjectRepository(Contents)
    private readonly contentsRepository: Repository<Contents>,
  ) {}

  async getAllDocs() {
    const docs = await this.DocsRepository.find({
      relations: ['contents'],
    });

    if (docs.length == 0) {
      throw new HttpException('No Docs found.', HttpStatus.NOT_FOUND);
    }

    const DocsResponseDTOs = docs.map((docs) => {
      return new DocsResponseDTO(
        docs.docsId,
        docs.title,
        docs.url,
        docs.createdAt,
      );
    });

    return DocsResponseDTOs;
  }

  async createDocs(
    doc: DocsRequestDTO,
    files?: {
      docFile?: Express.Multer.File[];
    },
  ): Promise<void> {
    const { contentsId } = doc;

    const contentData = await this.contentsRepository.findOne({
      where: { contentId: contentsId },
    });
    if (!contentData) {
      throw new HttpException(
        `User with ID content not found.`,
        HttpStatus.NOT_FOUND,
      );
    }

    let docUrl = '';

    if (files?.docFile?.[0]) {
      const file = files.docFile[0];
      const allowedMimeTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];

      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new HttpException(
          `Unsupported file type. Only PDF, DOC, and DOCX are allowed.`,
          HttpStatus.UNSUPPORTED_MEDIA_TYPE,
        );
      }
      docUrl = await azureUpload(files.docFile[0]);
    }

    await this.DocsRepository.save({
      docsId: uuidv4(),
      title: doc.title,
      url: docUrl,
      contentId: contentsId,
      createdAt: new Date(),
    });

    throw new HttpException(`Create docs oke`, HttpStatus.OK);
  }
}
