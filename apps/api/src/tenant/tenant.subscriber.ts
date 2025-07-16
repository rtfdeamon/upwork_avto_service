import { DataSource, EntitySubscriberInterface, EventSubscriber, SelectQueryBuilder } from 'typeorm';
import { tenantStorage } from './tenant-context';

@EventSubscriber()
export class TenantSubscriber implements EntitySubscriberInterface {
  constructor(dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return Object;
  }

  beforeFind(event: any) {
    const store = tenantStorage.getStore();
    const userId = store?.userId;
    if (!userId) return;
    const qb: SelectQueryBuilder<any> = (event as any).queryBuilder;
    if (qb.expressionMap.mainAlias?.metadata.columns.find((c) => c.propertyName === 'user')) {
      qb.andWhere(`${qb.alias}."userId" = :userId`, { userId });
    }
  }
}
