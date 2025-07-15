process.env.http_proxy = '';
process.env.https_proxy = '';
process.env.HTTP_PROXY = '';
process.env.HTTPS_PROXY = '';
process.env.npm_config_https_proxy = '';
process.env.npm_config_http_proxy = '';
process.env.YARN_HTTP_PROXY = '';
process.env.YARN_HTTPS_PROXY = '';
import nock from 'nock';
import { UpworkAuthService } from '../src/upwork-auth/upwork-auth.service';
import { HttpService } from '@nestjs/axios';

(async () => {
  nock.disableNetConnect();
  const service = new UpworkAuthService(new HttpService(), null as any);
  const scope = nock('https://www.upwork.com')
    .post('/api/v3/oauth2/token')
    .reply(200, {
      access_token: 'a',
      refresh_token: 'b',
      expires_in: 3600,
    });

  const res = await service.exchangeCode('code');
  console.log(res);
  if (!scope.isDone()) throw new Error('HTTP not called');
})();
