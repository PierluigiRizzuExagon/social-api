import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Headers,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { FacebookService } from './facebook.service';
import type {
  FacebookPage,
  FacebookPost,
  FacebookComment,
} from './facebook.service';

@Controller('facebook')
@UseGuards(JwtAuthGuard)
export class FacebookController {
  constructor(private facebookService: FacebookService) {}

  private extractFacebookToken(authHeader: string): string {
    if (!authHeader || !authHeader.startsWith('Facebook ')) {
      throw new BadRequestException(
        'Facebook access token required in X-Facebook-Token header',
      );
    }
    return authHeader.substring(9); // Remove 'Facebook ' prefix
  }

  private extractFacebookPageToken(authHeader: string): string {
    if (!authHeader || !authHeader.startsWith('Facebook ')) {
      throw new BadRequestException(
        'Facebook page access token required in X-Facebook-Page-Token header',
      );
    }
    return authHeader.substring(9); // Remove 'Facebook ' prefix
  }

  @Get('pages')
  async getPages(
    @Headers('x-facebook-token') facebookToken: string,
  ): Promise<FacebookPage[]> {
    const accessToken = this.extractFacebookToken(facebookToken);
    return this.facebookService.getPages(accessToken);
  }

  @Get('pages/mock')
  getPagesMock() {
    return {
      data: [
        {
          id: '123456789',
          name: 'La Mia Pagina Demo',
          category: 'Business',
          access_token: 'mock_page_token_123',
          tasks: [
            'ANALYZE',
            'ADVERTISE',
            'MESSAGING',
            'MODERATE',
            'CREATE_CONTENT',
          ],
        },
        {
          id: '987654321',
          name: 'Ristorante Demo',
          category: 'Restaurant',
          access_token: 'mock_page_token_456',
          tasks: [
            'ANALYZE',
            'ADVERTISE',
            'MESSAGING',
            'MODERATE',
            'CREATE_CONTENT',
          ],
        },
      ],
      note: 'Questi sono dati MOCK per testing - non reali',
    };
  }

  @Get('pages/:pageId/posts')
  async getPagePosts(
    @Headers('x-facebook-page-token') facebookPageToken: string,
    @Param('pageId') pageId: string,
    @Query('limit') limit: string = '25',
  ): Promise<FacebookPost[]> {
    const pageAccessToken = this.extractFacebookPageToken(facebookPageToken);
    return this.facebookService.getPagePosts(
      pageId,
      pageAccessToken,
      parseInt(limit),
    );
  }

  @Get('pages/:pageId/posts/mock')
  getPagePostsMock(@Param('pageId') pageId: string) {
    return {
      data: [
        {
          id: `${pageId}_post_123`,
          message: 'Questo è un post di esempio della nostra pagina!',
          created_time: new Date().toISOString(),
          updated_time: new Date().toISOString(),
          likes: {
            data: [],
            summary: { total_count: 15 },
          },
          comments: {
            data: [],
            summary: { total_count: 3 },
          },
        },
        {
          id: `${pageId}_post_456`,
          message: 'Offerta speciale! Sconto del 20% su tutti i prodotti',
          created_time: new Date(
            Date.now() - 24 * 60 * 60 * 1000,
          ).toISOString(),
          updated_time: new Date(
            Date.now() - 24 * 60 * 60 * 1000,
          ).toISOString(),
          likes: {
            data: [],
            summary: { total_count: 42 },
          },
          comments: {
            data: [],
            summary: { total_count: 8 },
          },
        },
      ],
      note: 'Questi sono post MOCK per testing - non reali',
    };
  }

  @Post('pages/:pageId/posts')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return cb(new Error('Solo immagini sono permesse!'), false);
        }
        cb(null, true);
      },
    }),
  )
  async createPost(
    @Headers('x-facebook-page-token') facebookPageToken: string,
    @Param('pageId') pageId: string,
    @Body() postData: { message: string; link?: string },
    @UploadedFile() image?: Express.Multer.File,
  ) {
    const pageAccessToken = this.extractFacebookPageToken(facebookPageToken);
    return this.facebookService.createPost(
      pageId,
      pageAccessToken,
      postData.message,
      postData.link,
      image,
    );
  }

  @Put('posts/:postId')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return cb(new Error('Solo immagini sono permesse!'), false);
        }
        cb(null, true);
      },
    }),
  )
  async updatePost(
    @Headers('x-facebook-page-token') facebookPageToken: string,
    @Param('postId') postId: string,
    @Body() postData: { message: string; link?: string },
    @UploadedFile() image?: Express.Multer.File,
  ) {
    const pageAccessToken = this.extractFacebookPageToken(facebookPageToken);
    return this.facebookService.updatePost(
      postId,
      pageAccessToken,
      postData.message,
      postData.link,
      image,
    );
  }

  @Get('posts/:postId/comments')
  async getPostComments(
    @Headers('x-facebook-page-token') facebookPageToken: string,
    @Param('postId') postId: string,
    @Query('limit') limit: string = '25',
  ): Promise<FacebookComment[]> {
    const pageAccessToken = this.extractFacebookPageToken(facebookPageToken);
    return this.facebookService.getPostComments(
      postId,
      pageAccessToken,
      parseInt(limit),
    );
  }

  @Get('posts/:postId/comments/mock')
  getPostCommentsMock(@Param('postId') postId: string) {
    return {
      data: [
        {
          id: `${postId}_comment_123`,
          message: 'Ottimo post! Molto interessante.',
          created_time: new Date().toISOString(),
          from: {
            name: 'Mario Rossi',
            id: 'user_123',
          },
          like_count: 2,
          can_remove: true,
          can_hide: true,
          can_reply_privately: true,
        },
        {
          id: `${postId}_comment_456`,
          message: 'Quando sarà disponibile questa offerta?',
          created_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          from: {
            name: 'Giulia Bianchi',
            id: 'user_456',
          },
          like_count: 0,
          can_remove: true,
          can_hide: true,
          can_reply_privately: true,
        },
      ],
      note: 'Questi sono commenti MOCK per testing - non reali',
    };
  }

  @Post('comments/:commentId/reply')
  async replyToComment(
    @Headers('x-facebook-page-token') facebookPageToken: string,
    @Param('commentId') commentId: string,
    @Body() replyData: { message: string },
  ) {
    const pageAccessToken = this.extractFacebookPageToken(facebookPageToken);
    return this.facebookService.replyToComment(
      commentId,
      pageAccessToken,
      replyData.message,
    );
  }

  @Delete('comments/:commentId')
  async deleteComment(
    @Headers('x-facebook-page-token') facebookPageToken: string,
    @Param('commentId') commentId: string,
  ) {
    const pageAccessToken = this.extractFacebookPageToken(facebookPageToken);
    return this.facebookService.deleteComment(commentId, pageAccessToken);
  }

  @Post('comments/:commentId/hide')
  async hideComment(
    @Headers('x-facebook-page-token') facebookPageToken: string,
    @Param('commentId') commentId: string,
    @Body('hide') hide: boolean,
  ) {
    const pageAccessToken = this.extractFacebookPageToken(facebookPageToken);
    return this.facebookService.hideComment(commentId, pageAccessToken, hide);
  }

  @Post('comments/:commentId/likes')
  async likeComment(
    @Headers('x-facebook-page-token') facebookPageToken: string,
    @Param('commentId') commentId: string,
  ) {
    console.log(
      '🔍 DEBUG likeComment Controller - facebookPageToken header:',
      facebookPageToken,
    );
    const pageAccessToken = this.extractFacebookPageToken(facebookPageToken);
    console.log(
      '🔍 DEBUG likeComment Controller - extracted token (primi 10):',
      pageAccessToken ? pageAccessToken.substring(0, 10) + '...' : 'NULL',
    );
    return this.facebookService.likeComment(commentId, pageAccessToken);
  }

  @Delete('posts/:postId')
  async deletePost(
    @Headers('x-facebook-page-token') facebookPageToken: string,
    @Param('postId') postId: string,
  ) {
    const pageAccessToken = this.extractFacebookPageToken(facebookPageToken);
    return this.facebookService.deletePost(postId, pageAccessToken);
  }

  @Get('pages/:pageId/insights')
  async getPageInsights(
    @Headers('x-facebook-page-token') facebookPageToken: string,
    @Param('pageId') pageId: string,
    @Query('metrics') metrics?: string,
  ) {
    const pageAccessToken = this.extractFacebookPageToken(facebookPageToken);
    const metricsArray = metrics
      ? metrics.split(',')
      : ['page_fans', 'page_impressions'];
    return this.facebookService.getPageInsights(
      pageId,
      pageAccessToken,
      metricsArray,
    );
  }

  @Get('pages/:pageId/insights/mock')
  getPageInsightsMock(@Param('pageId') pageId: string) {
    return {
      data: [
        {
          name: 'page_fans',
          period: 'day',
          values: [
            {
              value: 1250,
              end_time: new Date().toISOString(),
            },
          ],
          title: 'Page Fans',
          description: 'Total number of people who have liked your Page',
        },
        {
          name: 'page_impressions',
          period: 'day',
          values: [
            {
              value: 8500,
              end_time: new Date().toISOString(),
            },
          ],
          title: 'Page Impressions',
          description: 'Total number of times your Page was viewed',
        },
        {
          name: 'page_post_engagements',
          period: 'day',
          values: [
            {
              value: 320,
              end_time: new Date().toISOString(),
            },
          ],
          title: 'Page Post Engagements',
          description: 'Total number of times people engaged with your posts',
        },
      ],
      note: 'Questi sono dati MOCK insights per testing - non reali',
    };
  }
}
