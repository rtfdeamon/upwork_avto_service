import { AppDataSource } from './data-source';

AppDataSource.initialize()
  .then(async () => {
    await AppDataSource.runMigrations();
    console.log('✅ Migrations finished');
    await AppDataSource.destroy();
  })
  .catch((err: unknown) => {
    console.error(err);
    process.exit(1);
  });
