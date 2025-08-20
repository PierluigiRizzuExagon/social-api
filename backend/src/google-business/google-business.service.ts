import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { google } from 'googleapis';

export interface BusinessLocation {
  name: string;
  locationName: string;
  primaryPhone: string;
  websiteUri: string;
  regularHours: any;
  categories: any[];
  latlng: { latitude: number; longitude: number };
  address: any;
}

export interface BusinessPost {
  name: string;
  languageCode: string;
  summary: string;
  callToAction?: {
    actionType: string;
    url?: string;
  };
  media?: any[];
  topicType: string;
}

export interface ReviewReply {
  comment: string;
  updateTime: string;
}

@Injectable()
export class GoogleBusinessService {
  private async getMyBusinessClient(accessToken: string) {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    return google.mybusinessbusinessinformation({
      version: 'v1',
      auth: oauth2Client,
    });
  }

  private async getMyBusinessAccountManagement(accessToken: string) {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    return google.mybusinessaccountmanagement({
      version: 'v1',
      auth: oauth2Client,
    });
  }

  async getAccounts(accessToken: string) {
    try {
      const accountManagement =
        await this.getMyBusinessAccountManagement(accessToken);
      const response = await accountManagement.accounts.list();
      return response.data;
    } catch (error: any) {
      console.log('Errore Google completo:', error);

      // Rilancia l'errore originale di Google senza modifiche
      throw error;
    }
  }

  async getLocations(accessToken: string, accountName?: string) {
    try {
      const client = await this.getMyBusinessClient(accessToken);

      if (accountName) {
        const response = await client.accounts.locations.list({
          parent: accountName,
        });
        return response.data;
      } else {
        // Get all accounts first, then get locations for each
        const accounts = await this.getAccounts(accessToken);
        const allLocations: any[] = [];

        if (accounts.accounts) {
          for (const account of accounts.accounts) {
            try {
              if (account.name) {
                const response = await client.accounts.locations.list({
                  parent: account.name,
                });
                if (response.data && response.data.locations) {
                  allLocations.push(...response.data.locations);
                }
              }
            } catch (error: any) {
              console.warn(
                `Failed to get locations for account ${account.name}: ${error.message}`,
              );
            }
          }
        }

        return { locations: allLocations };
      }
    } catch (error: any) {
      console.log('Errore Google getLocations:', error);
      throw error;
    }
  }

  async updateLocation(
    accessToken: string,
    locationName: string,
    updateData: Partial<BusinessLocation>,
  ) {
    try {
      const client = await this.getMyBusinessClient(accessToken);
      const response = await client.locations.patch({
        name: locationName,
        updateMask: Object.keys(updateData).join(','),
        requestBody: updateData as any,
      });
      return response.data;
    } catch (error: any) {
      console.log('Errore Google updateLocation:', error);
      throw error;
    }
  }

  async createPost(
    accessToken: string,
    locationName: string,
    postData: BusinessPost,
  ) {
    try {
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({ access_token: accessToken });

      const client = google.mybusinessbusinessinformation({
        version: 'v1',
        auth: oauth2Client,
      });

      // Note: Google My Business Posts API has been deprecated
      // This is a placeholder for the new Google Business Profile API
      // You'll need to use the Google Business Profile API instead
      console.warn(
        'Google My Business Posts API has been deprecated. Please use Google Business Profile API.',
      );

      return { message: 'Post creation requires Google Business Profile API' };
    } catch (error: any) {
      console.log('Errore Google createPost:', error);
      throw error;
    }
  }

  async getReviews(accessToken: string, locationName: string) {
    try {
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({ access_token: accessToken });

      // Using Google Places API for reviews (requires different setup)
      // This is a simplified version - you'd need to implement proper review fetching
      console.warn(
        'Review fetching requires Google Places API or Google Business Profile API',
      );

      return { message: 'Review fetching requires additional API setup' };
    } catch (error: any) {
      console.log('Errore Google getReviews:', error);
      throw error;
    }
  }

  async replyToReview(accessToken: string, reviewName: string, reply: string) {
    try {
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({ access_token: accessToken });

      // This would require Google My Business API v4 or Google Business Profile API
      console.warn('Review replies require Google Business Profile API');

      return {
        message: 'Review reply requires Google Business Profile API setup',
      };
    } catch (error) {
      console.log('Errore Google replyToReview:', error);
      throw error;
    }
  }
}
