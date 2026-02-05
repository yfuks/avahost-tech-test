import { IsString, IsIn } from 'class-validator';

export class CreateTicketDto {
  @IsString()
  listing_id!: string;

  @IsString()
  @IsIn(['internet', 'equipment', 'access', 'other'])
  category!: string;
}
