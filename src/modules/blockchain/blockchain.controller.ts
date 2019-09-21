import {
  Controller,
  Get,
  Post,
  Body,
  ValidationPipe,
  Inject,
} from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { Transaction } from './transaction.entity';

@Controller()
export class BlockchainController {
  constructor(
    @Inject('IDENTIFIER') private readonly identifier: string,
    private readonly blockchainService: BlockchainService,
  ) {}

  @Get('mine')
  mine() {
    const lastBlock = this.blockchainService.lastBlock();
    const lastProof = lastBlock.proof;
    const proof = this.blockchainService.proofOfWork(lastProof);

    this.blockchainService.newTransaction(
      new Transaction({
        sender: '0',
        recipient: this.identifier,
        amount: 1,
      }),
    );

    const previousHash = this.blockchainService.hash(lastBlock);
    const block = this.blockchainService.newBlock(proof, previousHash);

    return {
      message: 'New Block Forged',
      ...block,
    };
  }

  @Post('transactions')
  createTransaction(@Body(new ValidationPipe()) transaction: Transaction) {
    const index = this.blockchainService.newTransaction(transaction);
    return { message: `Transaction will be added to Block ${index}` };
  }

  @Get('chain')
  fullChain() {
    const chain = this.blockchainService.chain;
    return {
      chain,
      length: chain.length,
    };
  }

  @Post('nodes')
  registerNode(@Body() nodes: string[]) {
    nodes = nodes || [];
    nodes.forEach(node => {
      this.blockchainService.registerNode(node);
    });
    return {
      message: 'New nodes have been added.',
      total_nodes: this.blockchainService.nodes.size,
    };
  }

  @Get('nodes/resolve')
  async consensus() {
    const replaced = await this.blockchainService.resolveConflicts();
    const chain = this.blockchainService.chain;
    if (replaced) {
      return {
        message: 'Our chain was replaced',
        new_chain: chain,
      };
    }
    return {
      message: 'Our chain is authoritative',
      chain,
    };
  }
}
