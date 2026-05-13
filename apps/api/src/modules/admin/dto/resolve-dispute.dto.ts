import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { DisputeStatus } from '../../shop/entities/order.entity';

export class ResolveDisputeDto {
  @IsEnum([DisputeStatus.RESOLVED_REFUND, DisputeStatus.RESOLVED_RELEASE])
  status: DisputeStatus.RESOLVED_REFUND | DisputeStatus.RESOLVED_RELEASE;

  @IsString()
  @IsNotEmpty()
  resolutionNotes: string;
}
