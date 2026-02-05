import { IsString, IsIn } from 'class-validator';

export class UpdateTicketDto {
  @IsString()
  @IsIn(['created', 'in_progress', 'resolved'])
  status!: string;
}
