import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function nestSwaggerConfig<
  T extends INestApplication = INestApplication,
>(app: T) {
  const config = new DocumentBuilder();
  config
    .setTitle('Linkit API')
    .setDescription(
      `
## Linkit Open API Specification

반환되는 에러코드에 대한 정의입니다!

### [폴더]\n

- F001 - 폴더 이름이 중복되는 경우 입니다\n
- F002 - 폴더가 사용자의 폴더가 아닌 경우 입니다
- F003 - 수정하려는 폴더 이름이 기존 이름과 동일한 이름입니다
\n

### [피드]\n

- P001 - 피드가 사용자의 피드가 아닌경우 입니다
\n
### [Classification]\n

- C001 - Classification이 이미 삭제된 경우입니다(추천해준 폴더로 옮겼을때)
\n
### [Validation]\n
- V000 - Dto, Query Param등에 대한 Validation 오류입니다
      `,
    )
    .setVersion('1.0.0')
    .setContact(
      'Dorabangs Node.js Team',
      'https://github.com/mash-up-kr/Dorabangs-Node',
      'some@email.com',
    )
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config.build());
  SwaggerModule.setup('docs', app, document, {
    explorer: true,
    customSiteTitle: 'Linkit API OAS',
    swaggerOptions: {
      persistAuthorization: true, // https://github.com/scottie1984/swagger-ui-express/issues/44#issuecomment-974749930
      displayRequestDuration: true,
    },
  });
}
