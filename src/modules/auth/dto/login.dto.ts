import { ApiProperty } from '@nestjs/swagger';
import { IsByteLength, IsEmail, IsString, MaxLength } from 'class-validator';
import { NormalizeKey } from '../../../common/inputs';

export class LoginDto {
  @ApiProperty({ example: 'viewer@anistream.test', format: 'email' })
  @NormalizeKey()
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @ApiProperty({ example: 'An-example-passphrase-1', writeOnly: true })
  @IsString()
  @IsByteLength(1, 72, {
    message: 'password must contain 1 to 72 UTF-8 bytes',
  })
  password!: string;
}