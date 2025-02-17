import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Docs } from './entities/docs.entity';
import { Repository } from 'typeorm';
import { DocsResponseDTO } from './dto/docResponseData.dto';
import { DocsRequestDTO } from './dto/docRequestData.dto';
import { Contents } from '../contents/entities/contents.entity';
import {
  azureDelete,
  azureEdit,
  azureUpload,
} from 'src/utilities/azure.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DocsService {
  constructor(
    @InjectRepository(Docs)
    private readonly docsRepository: Repository<Docs>,
    @InjectRepository(Contents)
    private readonly contentsRepository: Repository<Contents>,
  ) {}

  async getAllDocs() {
    const docs = await this.docsRepository.find({
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
    file?: { file?: Express.Multer.File[] },
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
    const existingDoc = await this.docsRepository.findOne({
      where: { contents: { contentId: doc.contentsId } },
    });

    if (existingDoc) {
      throw new HttpException(
        'This content is already associated with another document.',
        HttpStatus.BAD_REQUEST,
      );
    }
    let docUrl = '';

    if (file?.file?.[0]) {
      const fille = file.file[0];
      const allowedMimeTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];

      if (allowedMimeTypes.includes(fille.mimetype)) {
        docUrl = await azureUpload(file.file[0]);
      } else {
        throw new HttpException(
          `Unsupported file type. Only PDF, DOC, and DOCX are allowed.`,
          HttpStatus.UNSUPPORTED_MEDIA_TYPE,
        );
      }
    }

    await this.docsRepository.save({
      docsId: uuidv4(),
      title: doc.title,
      url: docUrl,
      contents: contentData,
      createdAt: new Date(),
    });

    throw new HttpException(`Create docs oke`, HttpStatus.OK);
  }

  async updatedDocs(
    docsId: string,
    updateData: Partial<DocsRequestDTO>,
    file?: { file?: Express.Multer.File[] },
  ): Promise<void> {
    const doc = await this.docsRepository.findOne({
      where: { docsId },
      relations: ['contents'],
    });

    const { contentsId } = updateData;
    const contentData = await this.contentsRepository.findOne({
      where: { contentId: contentsId },
    });
    if (!contentData) {
      throw new HttpException(
        `User with ID content not found.`,
        HttpStatus.NOT_FOUND,
      );
    }

    const existingDoc = await this.docsRepository.findOne({
      where: { contents: { contentId: updateData.contentsId } },
    });

    if (existingDoc) {
      throw new HttpException(
        'This content is already associated with another document.',
        HttpStatus.BAD_REQUEST,
      );
    }
    let docUrl = doc.url;

    if (file?.file?.[0]) {
      const fille = file.file[0];
      const allowedMimeTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];

      if (allowedMimeTypes.includes(fille.mimetype)) {
        const blobName = docUrl.split('/').pop();
        docUrl = await azureEdit(blobName, fille);
      } else {
        throw new HttpException(
          `Unsupported file type. Only PDF, DOC, and DOCX are allowed.`,
          HttpStatus.UNSUPPORTED_MEDIA_TYPE,
        );
      }
    }

    Object.assign(doc, updateData, {
      title: doc.title,
      url: docUrl,
      contents: contentData,
      createdAt: doc.createdAt,
    });

    throw new HttpException(`update docs oke`, HttpStatus.OK);
  }

  async deleteDoc(docsId: string): Promise<void> {
    const doc = await this.docsRepository.findOne({
      where: { docsId },
    });

    if (!doc) {
      throw new HttpException(
        `Course with ID doc not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    const blobName = doc.url.split('/').pop();
    await azureDelete(blobName);

    await this.docsRepository.remove(doc);
    throw new HttpException('Removed', HttpStatus.OK);
  }
}
