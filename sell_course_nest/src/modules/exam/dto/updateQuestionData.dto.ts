// import {
//   IsArray,
//   IsNotEmpty,
//   IsString,
//   ValidateNested,
//   IsUUID,
// } from 'class-validator';
// import { Type } from 'class-transformer';
// import { UpdateAnswerDto } from './updateAnswerData.dto';

// export class UpdateQuestionDto {
//   @IsUUID()
//   @IsNotEmpty({ message: 'Question ID is required' })
//   questionId: string;

//   @IsString()
//   @IsNotEmpty({ message: 'Question text is required' })
//   question: string;

//   @IsArray()
//   @ValidateNested({ each: true })
//   @Type(() => UpdateAnswerDto)
//   answers: UpdateAnswerDto[];
// }

import { IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class UpdateAnswerDto {
  @IsString()
  answerId: string;

  @IsString()
  answer: string;

  isCorrect: boolean;
}

export class UpdateQuestionDto {
  @IsString()
  question: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateAnswerDto)
  answers: UpdateAnswerDto[];
}
