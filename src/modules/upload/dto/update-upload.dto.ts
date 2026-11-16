
import { OmitType, PartialType } from '@nestjs/swagger';

import { CreateUploadDto } from './create-upload.dto';

export class UpdateUploadDto extends PartialType(
  OmitType(CreateUploadDto, ['rightsConfirmed'] as const), { skipNullProperties: false },
) {}
