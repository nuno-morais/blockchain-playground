import { Module } from '@nestjs/common';
import { BlockchainController } from './blockchain.controller';
import { BlockchainService } from './blockchain.service';
import { TimestampService } from './timestamp.service';
import * as uuidv4 from 'uuid/v4';

@Module({
  imports: [],
  controllers: [BlockchainController],
  providers: [
    BlockchainService,
    TimestampService,
    {
      provide: 'IDENTIFIER',
      useValue: uuidv4(),
    },
  ],
})
export class BlockchainModule {}
