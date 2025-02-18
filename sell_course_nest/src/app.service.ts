import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    const blobUrl =
      'https://sdnmma.blob.core.windows.net/wdp/d3581eae-85c3-4782-83ff-81b63768e0f5-N%C3%A1%C2%BB%C2%99i%20dung%20thuy%C3%A1%C2%BA%C2%BFt%20tr%C3%83%C2%ACnh_Vinh.docx';

    const decodedUrl = decodeURIComponent(blobUrl);
    const blobName = decodedUrl.split('/').pop();

    return blobName;
  }
}
