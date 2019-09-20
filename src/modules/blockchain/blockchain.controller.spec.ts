import { Test, TestingModule } from '@nestjs/testing';
import { BlockchainService } from './blockchain.service';
import { BlockchainController } from './blockchain.controller';

describe('BlockchainController', () => {
  let blockchain: TestingModule;

  beforeAll(async () => {
    blockchain = await Test.createTestingModule({
      controllers: [BlockchainController],
      providers: [BlockchainService],
    }).compile();
  });

  describe('getHello', () => {
    it('should return "Hello World!"', () => {
      const blockchainController = blockchain.get<BlockchainController>(
        BlockchainController,
      );
      expect(blockchainController.getHello()).toBe('Hello World!');
    });
  });
});
