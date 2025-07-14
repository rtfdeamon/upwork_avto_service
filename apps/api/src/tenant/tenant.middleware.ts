import { Injectable, NestMiddleware } from '@nestjs/common';
import { tenantStorage } from './tenant-context';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const userId = req.user?.sub;
    tenantStorage.run({ userId }, () => next());
  }
}
