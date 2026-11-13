import { ApiProperty } from '@nestjs/swagger';
import {
  IsByteLength,
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { NormalizeKey } from '../../../common/inputs';

export const USERNAME_PATTERN = /^[a-z0-9_]{3,32}$/;

export class RegisterDto {
  @ApiProperty({ example: 'viewer_one', minLength: 3, maxLength: 32 })
  @NormalizeKey()
  @IsString()
  @Matches(USERNAME_PATTERN, {
    message: 'username must contain 3 to 32 letters, numbers or underscores',
  })
  username!: string;

  @ApiProperty({ example: 'viewer@anistream.test', format: 'email' })
  @NormalizeKey()
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @ApiProperty({ example: 'An-example-passphrase-1', minLength: 10, writeOnly: true })
  @IsString()
  @MinLength(10)
  @IsByteLength(10, 72, {
    message: 'password must contain 10 to 72 UTF-8 bytes',
  })
  password!: string;
}