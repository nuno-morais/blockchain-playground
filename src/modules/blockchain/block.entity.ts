import { orderObjectCreator } from 'src/common/common/orderObjectCreator';
import { Transaction } from './transaction.entity';

export class Block {
  index: number = 0;
  timestamp: any = new Date().getTime();
  transactions: Transaction[] = [];
  proof: number = 0;
  previousHash: string = '';

  /**
   * constructor
   */
  public constructor(block: Partial<Block> = {}) {
    if (block) {
      for (const key in block) {
        if (block[key] != null) {
          this[key] = block[key];
        }
      }
    }
  }

  public toString() {
    const orderedObj = orderObjectCreator(this);
    return JSON.stringify(orderedObj);
  }
}
