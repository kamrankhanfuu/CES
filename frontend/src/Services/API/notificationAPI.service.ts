import BaseAPIService from './base.service';
import { AxiosResponse } from 'axios';

export class NotificationAPI extends BaseAPIService {
  async loadNotifications(params: any): Promise<AxiosResponse<any>> {
    return await this.api.get(
      `/notifications/`,
      params,
      {
        withDetailErrors: true,
      },
    );
  }

  async markAsRead(params: any): Promise<AxiosResponse<any>> {
    return await this.api.put(
      `/notifications/`,
      params,
      {
        withDetailErrors: true,
      },
    );
  }

  async deleteNotification(params: any): Promise<AxiosResponse<any>> {
    return await this.api.delete(
      `/notifications/${params.id}`,
      {
        withDetailErrors: true,
      },
    );
  }
}

export default new NotificationAPI();
