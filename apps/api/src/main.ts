import './tracing';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import { LoggingInterceptor } from './logging.interceptor';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());
  app.use('/stripe/webhook', bodyParser.raw({ type: '*/*' }));
  const port = parseInt(process.env.PORT || '3000', 10);
  await app.listen(port);
}
bootstrap();
