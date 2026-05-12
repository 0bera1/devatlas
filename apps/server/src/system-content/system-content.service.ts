import { Inject, Injectable } from '@nestjs/common';
import type { SystemContentRecord } from './interfaces/system-content-record.interface';
import {
  SYSTEM_CONTENT_REPOSITORY,
  type ISystemContentRepository,
} from './interfaces/system-content-repository.interface';
import type { ISystemContentService } from './interfaces/system-content-service.interface';

@Injectable()
export class SystemContentService implements ISystemContentService {
  public constructor(
    @Inject(SYSTEM_CONTENT_REPOSITORY)
    private readonly repository: ISystemContentRepository,
  ) {}

  public async listSystemContent(): Promise<SystemContentRecord[]> {
    return this.repository.selectAllByCreatedAtDesc();
  }
}
