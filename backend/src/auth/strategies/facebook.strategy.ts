import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-facebook';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('facebook.clientId'),
      clientSecret: configService.get<string>('facebook.clientSecret'),
      callbackURL: configService.get<string>('facebook.redirectUri'),
      scope: [
        'email',
        'public_profile',
        'pages_show_list',
        'pages_read_engagement',
        'pages_manage_posts',
        'pages_manage_engagement',
        'pages_read_user_content',
        'pages_manage_metadata',
      ],
      profileFields: ['id', 'displayName', 'photos', 'email'],
    } as any);
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: (error: any, user?: any) => void,
  ): void {
    try {
      const user = this.authService.validateFacebookUser(
        profile,
        accessToken,
        refreshToken,
      );
      done(null, user);
    } catch (error) {
      done(error, false);
    }
  }
}
