import { Controller, Get, UseGuards, Req, Res, Post } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

type Provider = 'google' | 'facebook';

interface OAuthTokens {
  access_token: string;
  refresh_token?: string;
}

interface LoginResult {
  access_token: string;
  google_tokens?: OAuthTokens;
  facebook_tokens?: OAuthTokens;
}

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  private buildCallbackUrl(
    frontendUrl: string,
    provider: Provider,
    loginResult: LoginResult,
  ): string {
    const params = new URLSearchParams();

    // token JWT dell'app
    params.set('token', loginResult.access_token);
    params.set('provider', provider);

    // token provider specifici, solo se presenti
    if (provider === 'google' && loginResult.google_tokens) {
      params.set('google_access_token', loginResult.google_tokens.access_token);
      if (loginResult.google_tokens.refresh_token) {
        params.set(
          'google_refresh_token',
          loginResult.google_tokens.refresh_token,
        );
      }
    }

    if (provider === 'facebook' && loginResult.facebook_tokens) {
      params.set(
        'facebook_access_token',
        loginResult.facebook_tokens.access_token,
      );
      if (loginResult.facebook_tokens.refresh_token) {
        params.set(
          'facebook_refresh_token',
          loginResult.facebook_tokens.refresh_token,
        );
      }
    }

    return `${frontendUrl}/auth/callback?${params.toString()}`;
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Avvia il flow OAuth di Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    try {
      const loginResult = (await this.authService.login(
        // @ts-expect-error: user è popolato da Passport
        req.user,
        'google',
      )) as LoginResult;

      const frontendUrl =
        this.configService.get<string>('frontend.url') ??
        'http://localhost:3000';

      const redirectUrl = this.buildCallbackUrl(
        frontendUrl,
        'google',
        loginResult,
      );

      res.redirect(redirectUrl);
    } catch (error: unknown) {
      const frontendUrl =
        this.configService.get<string>('frontend.url') ??
        'http://localhost:3000';
      const errorMessage =
        error instanceof Error ? error.message : 'Authentication error';
      res.redirect(
        `${frontendUrl}/auth/error?error=${encodeURIComponent(errorMessage)}`,
      );
    }
  }

  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuth() {
    // Avvia il flow OAuth di Facebook
  }

  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuthRedirect(@Req() req: Request, @Res() res: Response) {
    try {
      const loginResult = (await this.authService.login(
        // @ts-expect-error: user è popolato da Passport
        req.user,
        'facebook',
      )) as LoginResult;

      const frontendUrl =
        this.configService.get<string>('frontend.url') ??
        'http://localhost:3000';

      const redirectUrl = this.buildCallbackUrl(
        frontendUrl,
        'facebook',
        loginResult,
      );

      res.redirect(redirectUrl);
    } catch (error: unknown) {
      const frontendUrl =
        this.configService.get<string>('frontend.url') ??
        'http://localhost:3000';
      const errorMessage =
        error instanceof Error ? error.message : 'Authentication error';
      res.redirect(
        `${frontendUrl}/auth/error?error=${encodeURIComponent(errorMessage)}`,
      );
    }
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  logout() {
    return { message: 'Logged out successfully' };
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  getProfile(@Req() req: Request) {
    return req.user;
  }
}
