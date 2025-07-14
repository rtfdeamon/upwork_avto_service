import { AppDataSource } from './data-source';

AppDataSource.initialize()
  .then(() => AppDataSource.runMigrations())
  .then(() => {
    console.log('Migrations executed');
    return AppDataSource.destroy();
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
