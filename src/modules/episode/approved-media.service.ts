import { Injectable } from '@nestjs/common';
import { httpsUrl } from '../../common/inputs';

@Injectable()
export class ApprovedMediaService {
  approvedUrl(value: string) {
    const url = httpsUrl(value);
    const hosts = (process.env.MEDIA_HOSTS ?? '')
      .split(',').map((host) => host.trim().toLowerCase());
    return url && hosts.includes(url.hostname) && url.href.length <= 2048
      ? url.href : undefined;
  }
}