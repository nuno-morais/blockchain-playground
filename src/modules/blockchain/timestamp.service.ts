import { Injectable } from '@nestjs/common';

@Injectable()
export class TimestampService {
  public getTimestamp() {
    return new Date().getTime();
  }
}
