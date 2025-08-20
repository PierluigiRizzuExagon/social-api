import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture: string;
  accessToken: string;
  refreshToken: string;
}

export interface FacebookUser {
  id: string;
  email: string;
  name: string;
  picture: string;
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  validateGoogleUser(
    profile: any,
    accessToken: string,
    refreshToken: string,
  ): GoogleUser {
    const user: GoogleUser = {
      id: profile.id,
      email: profile.emails[0].value,
      name: profile.displayName,
      picture: profile.photos[0].value,
      accessToken,
      refreshToken,
    };

    return user;
  }

  validateFacebookUser(
    profile: any,
    accessToken: string,
    refreshToken: string,
  ): FacebookUser {
    const user: FacebookUser = {
      id: profile.id,
      email: profile.emails?.[0]?.value || `${profile.id}@facebook.local`,
      name: profile.displayName,
      picture: profile.photos?.[0]?.value || '',
      accessToken,
      refreshToken,
    };

    return user;
  }

  login(
    user: GoogleUser | FacebookUser,
    provider: 'google' | 'facebook' = 'google',
  ) {
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      provider,
    };

    const tokens =
      provider === 'google'
        ? {
            google_tokens: {
              access_token: user.accessToken,
              refresh_token: user.refreshToken,
            },
          }
        : {
            facebook_tokens: {
              access_token: user.accessToken,
              refresh_token: user.refreshToken,
            },
          };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        provider,
      },
      ...tokens,
    };
  }

  validateJwtPayload(payload: any) {
    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    };
  }
}
