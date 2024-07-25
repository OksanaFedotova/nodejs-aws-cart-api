import { NestFactory } from '@nestjs/core';
import { configure as serverlessExpress } from '@codegenie/serverless-express';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { Callback, Context, Handler } from 'aws-lambda';

let server: Handler;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: (req, callback) => callback(null, true),
  });
  app.use(helmet());
  await app.init(); // Инициализация приложения NestJS

  const expressApp = app.getHttpAdapter().getInstance(); // Получение экземпляра Express приложения

  if (process.env.NODE_ENV === 'production') {
    // Код для AWS Lambda
    return serverlessExpress({ app: expressApp }); // Возвращение серверного обработчика для Lambda
  } else {
    // Код для локального запуска
    const port = process.env.PORT || 4000;
    expressApp.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
    return null; // Для локального запуска не требуется возвращать серверный обработчик
  }
}

export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  server = server ?? (await bootstrap()); // Инициализация сервера при первом вызове
  if (server) {
    return server(event, context, callback); // Обработка запроса для AWS Lambda
  }
  return null; // Локальная среда не требует обработки
};

// Запуск сервера локально
if (require.main === module) {
  bootstrap().catch((err) => {
    console.error('Error bootstrapping the application', err);
    process.exit(1);
  });
}
