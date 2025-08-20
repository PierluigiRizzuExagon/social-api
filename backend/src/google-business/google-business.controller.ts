import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { User } from '../common/decorators/user.decorator';
import { GoogleBusinessService } from './google-business.service';
import type { BusinessLocation, BusinessPost } from './google-business.service';

@Controller('google-business')
@UseGuards(JwtAuthGuard)
export class GoogleBusinessController {
  constructor(private googleBusinessService: GoogleBusinessService) {}

  private extractGoogleToken(authHeader: string): string {
    if (!authHeader || !authHeader.startsWith('Google ')) {
      throw new BadRequestException(
        'Google access token required in X-Google-Token header',
      );
    }
    return authHeader.substring(7); // Remove 'Google ' prefix
  }

  @Get('test-connection')
  async testConnection(@Headers('x-google-token') googleToken: string) {
    const accessToken = this.extractGoogleToken(googleToken);
    try {
      // Test base Google API access
      const { google } = require('googleapis');
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({ access_token: accessToken });

      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
      const userInfo = await oauth2.userinfo.get();

      return {
        success: true,
        message: 'Google API connection successful - Basic access confirmed',
        userInfo: userInfo.data,
        note: 'Per testare Google My Business, usa i bottoni specifici (ma con parsimonia per evitare limiti quota)',
        availableScopes: ['email', 'profile', 'business.manage'],
        tokenInfo: {
          hasAccessToken: !!accessToken,
          tokenLength: accessToken.length,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to connect to Google API',
      };
    }
  }

  @Get('accounts')
  async getAccounts(@Headers('x-google-token') googleToken: string) {
    const accessToken = this.extractGoogleToken(googleToken);
    return this.googleBusinessService.getAccounts(accessToken);
  }

  @Get('accounts/mock')
  async getAccountsMock() {
    // Dati di esempio per testing senza usare quota API
    return {
      accounts: [
        {
          name: 'accounts/demo-account-123',
          accountName: 'La Mia Attività Demo',
          type: 'BUSINESS',
          state: {
            status: 'UNVERIFIED',
          },
        },
      ],
      fromCache: false,
      note: 'Questi sono dati MOCK per testing - non reali. Le quote My Business API sono nascoste e molto basse!',
      quotaInfo: {
        problem: 'Google My Business API ha quote nascoste e molto basse',
        solution:
          'Usa i dati MOCK per sviluppo, richiedi aumento quota per produzione',
        tipicalLimits: 'Circa 100-300 richieste/giorno per progetto',
      },
    };
  }

  @Get('locations')
  async getLocations(
    @Headers('x-google-token') googleToken: string,
    @Param('accountName') accountName?: string,
  ) {
    const accessToken = this.extractGoogleToken(googleToken);
    return this.googleBusinessService.getLocations(accessToken, accountName);
  }

  @Get('locations/mock')
  async getLocationsMock() {
    // Dati di esempio per testing senza usare quota API
    return {
      locations: [
        {
          name: 'locations/demo-location-456',
          languageCode: 'it',
          storeCode: 'DEMO001',
          locationName: 'Ristorante Demo',
          primaryPhone: '+39 123 456 7890',
          websiteUri: 'https://esempio.com',
          categories: {
            primaryCategory: {
              name: 'gcid:restaurant',
              displayName: 'Ristorante',
            },
          },
          address: {
            regionCode: 'IT',
            locality: 'Roma',
            addressLines: ['Via Roma 123'],
          },
          latlng: {
            latitude: 41.9028,
            longitude: 12.4964,
          },
        },
      ],
      fromCache: false,
      note: 'Questi sono dati MOCK per testing - non reali',
    };
  }

  @Get('locations/:accountName')
  async getLocationsByAccount(
    @Headers('x-google-token') googleToken: string,
    @Param('accountName') accountName: string,
  ) {
    const accessToken = this.extractGoogleToken(googleToken);
    return this.googleBusinessService.getLocations(accessToken, accountName);
  }

  @Put('locations/:locationName')
  async updateLocation(
    @Headers('x-google-token') googleToken: string,
    @Param('locationName') locationName: string,
    @Body() updateData: Partial<BusinessLocation>,
  ) {
    const accessToken = this.extractGoogleToken(googleToken);
    return this.googleBusinessService.updateLocation(
      accessToken,
      locationName,
      updateData,
    );
  }

  @Post('locations/:locationName/posts')
  async createPost(
    @Headers('x-google-token') googleToken: string,
    @Param('locationName') locationName: string,
    @Body() postData: BusinessPost,
  ) {
    const accessToken = this.extractGoogleToken(googleToken);
    return this.googleBusinessService.createPost(
      accessToken,
      locationName,
      postData,
    );
  }

  @Get('locations/:locationName/reviews')
  async getReviews(
    @Headers('x-google-token') googleToken: string,
    @Param('locationName') locationName: string,
  ) {
    const accessToken = this.extractGoogleToken(googleToken);
    return this.googleBusinessService.getReviews(accessToken, locationName);
  }

  @Post('reviews/:reviewName/reply')
  async replyToReview(
    @Headers('x-google-token') googleToken: string,
    @Param('reviewName') reviewName: string,
    @Body() replyData: { comment: string },
  ) {
    const accessToken = this.extractGoogleToken(googleToken);
    return this.googleBusinessService.replyToReview(
      accessToken,
      reviewName,
      replyData.comment,
    );
  }
}
