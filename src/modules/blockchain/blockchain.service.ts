import { Injectable } from '@nestjs/common';
import { Block } from './block.entity';
import { Transaction } from './transaction.entity';
import { TimestampService } from './timestamp.service';
import { sha256 } from 'js-sha256';

@Injectable()
export class BlockchainService {
  public chain: Block[] = [];
  public currentTransactions: Transaction[] = [];

  constructor(private timestampService: TimestampService) {
    this.newBlock(100, '1');
  }

  public lastBlock() {
    return this.chain[this.chain.length - 1];
  }

  /**
   * Create a new Block in the Blockchain
   * @param proof: <number> The proof given by the Proof of Work algorithm
   * @param previous_hash: (Optional) <str> Hash of previous Block
   *
   * return a new block
   */
  public newBlock(proof: number, previousHash: string = null) {
    const block = new Block({
      index: this.chain.length + 1,
      timestamp: this.timestampService.getTimestamp(),
      transactions: this.currentTransactions,
      proof,
      previousHash: previousHash || this.hash(this.lastBlock()),
    });
    this.currentTransactions = [];
    this.chain.push(block);
    return block;
  }

  /**
   * Creates a new transaction to go into the next mined block
   * @param transaction
   *
   * return the index of the block that will hold this transaction
   */
  public newTransaction(transaction: Transaction) {
    this.currentTransactions.push(transaction);
    return this.lastBlock().index + 1;
  }

  public hash(block: Block) {
    const blockString = block.toString();
    return sha256.hex(blockString);
  }

  /**
   * Simple Proof of Work Algorithm:
   *   - Find a number p' such that hash(pp') contains leading 4 zeroes, where p is the previous p'
   *   - p is the previous proof, and p' is the new proof
   * @param lastProof
   *
   * return proof
   */
  public proofOfWork(lastProof: number): number {
    let proof = 0;
    while (!this.isValidProof(lastProof, proof)) {
      proof++;
    }
    return proof;
  }

  /**
   * Validates the Proof: Does hash(last_proof, proof) contain 4 leading zeroes?
   * @param lastProof
   * @param proof
   */
  private isValidProof(lastProof: number, proof: number): boolean {
    const guess = `${lastProof}${proof}`;
    const guessHash = sha256.hex(guess);
    return guessHash.slice(-4) === '0000';
  }
}
