import { Injectable } from '@nestjs/common';
import { Block } from './block.entity';
import { Transaction } from './transaction.entity';
import { TimestampService } from './timestamp.service';
import { sha256 } from 'js-sha256';
import * as rp from 'request-promise';

@Injectable()
export class BlockchainService {
  public nodes: Set<string> = new Set();
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

  public registerNode(address: string): void {
    this.nodes.add(address);
  }

  /**
   * Determine if a given blockchain is valid
   * @param chain
   */
  public validChain(chain: Block[]): boolean {
    let lastBlock = chain[0];
    let currentIndex = 1;
    let isValid: boolean = true;

    while (isValid && currentIndex < chain.length) {
      const block = chain[currentIndex];
      // tslint:disable-next-line: no-console
      console.debug(`${lastBlock.toString()}`);
      // tslint:disable-next-line: no-console
      console.debug(`${block.toString()}`);
      // tslint:disable-next-line: no-console
      console.debug(`\n-------\n`);

      isValid =
        block.previousHash === this.hash(lastBlock) &&
        this.isValidProof(lastBlock.proof, block.proof);

      lastBlock = block;
      currentIndex++;
    }

    return isValid;
  }

  /**
   * This is our Consensus Algorithm, it resolves conflicts
   * by replacing our chain with the longest one in the network.
   */
  public async resolveConflicts(): Promise<boolean> {
    const neighbours = this.nodes;
    let newChain = null;

    let maxLength = this.chain.length;
    for (const [_, value] of neighbours.entries()) {
      if (value != null) {
        const response = await rp({
          method: 'GET',
          uri: `${value}/chain`,
          json: true,
          resolveWithFullResponse: true,
          simple: false,
        });

        if (response.statusCode === 200) {
          const length = response.body.length;
          const chain = response.body.chain.map(c => new Block(c));
          if (length > maxLength && this.validChain(chain)) {
            maxLength = length;
            newChain = chain;
          }
        }

        if (newChain != null) {
          this.chain = newChain;
          return true;
        }

        return false;
      }
    }
  }
}
