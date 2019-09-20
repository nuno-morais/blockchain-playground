import { IsString, IsInt } from 'class-validator';
import { orderObjectCreator } from 'src/common/common/orderObjectCreator';

export class Transaction {
  @IsString()
  sender: string;
  @IsString()
  recipient: string;
  @IsInt()
  amount: number;

  /**
   * constructor
   */
  public constructor(transaction: Partial<Transaction> = {}) {
    if (transaction) {
      for (const key in transaction) {
        if (transaction[key] != null) {
          this[key] = transaction[key];
        }
      }
    }
  }

  public toString(): string {
    const orderedObj = orderObjectCreator(this);
    return JSON.stringify(orderedObj);
  }
}
