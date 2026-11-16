
import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/access';
import { DiscoveryQueryDto } from './dto/discovery.dto';
import { DiscoveryService } from './discovery.service';

@ApiTags('Discovery')
@Public()
@Controller('catalog')
export class DiscoveryController {
  constructor(private readonly discovery: DiscoveryService) {}

  @Get()
  @ApiOperation({
    summary: 'Browse published series and public creator uploads together',
  })
  list(@Query() query: DiscoveryQueryDto) {
    return this.discovery.list(query);
  }
}
