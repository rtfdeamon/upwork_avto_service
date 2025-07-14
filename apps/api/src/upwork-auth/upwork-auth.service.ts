import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ApiKey } from '../entities/api-key.entity';

@Injectable()
export class UpworkAuthService {
  private readonly log = new Logger(UpworkAuthService.name);
  constructor(
    private http: HttpService,
    @InjectRepository(ApiKey) private keys: Repository<ApiKey>,
  ) {}

  private tokenUrl = 'https://www.upwork.com/api/v3/oauth2/token';

  async exchangeCode(code: string) {
    const params = new URLSearchParams();
    params.append('client_id', process.env.UPWORK_CLIENT_ID || '');
    params.append('client_secret', process.env.UPWORK_CLIENT_SECRET || '');
    params.append('redirect_uri', process.env.UPWORK_REDIRECT || '');
    params.append('grant_type', 'authorization_code');
    params.append('code', code);

    const res = await this.http.axiosRef.post(this.tokenUrl, params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return res.data;
  }

  async refreshToken(refreshToken: string) {
    const params = new URLSearchParams();
    params.append('client_id', process.env.UPWORK_CLIENT_ID || '');
    params.append('client_secret', process.env.UPWORK_CLIENT_SECRET || '');
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', refreshToken);


    try {
      const res = await this.http.axiosRef.post(this.tokenUrl, params.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      return res.data;
    } catch (err) {
      this.log.error('token refresh request failed', err);
      throw err;
    }
  }

  @Cron('0 */15 * * * *')
  async refreshSoonExpiring() {
    const soon = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const keys = await this.keys.find({ where: { expiresAt: LessThan(soon) } });
    for (const key of keys) {
      try {
        this.log.log(`Refreshing token for ${key.id}`);
        const data = await this.refreshToken(key.refreshToken);
        key.refreshToken = data.refresh_token;
        key.expiresAt = new Date(Date.now() + data.expires_in * 1000);
        await this.keys.save(key);
        this.log.log(`Refreshed token for ${key.id}`);
      } catch (err) {
        this.log.error('Failed to refresh token', err);
      }
    }
  }
}
