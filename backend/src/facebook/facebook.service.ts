import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';

export interface FacebookPage {
  id: string;
  name: string;
  category: string;
  access_token: string;
  tasks: string[];
}

export interface FacebookPost {
  id: string;
  message?: string;
  story?: string;
  created_time: string;
  updated_time: string;
  likes: {
    data: any[];
    summary: { total_count: number };
  };
  comments: {
    data: any[];
    summary: { total_count: number };
  };
}

export interface FacebookComment {
  id: string;
  message: string;
  created_time: string;
  from: {
    name: string;
    id: string;
  };
  like_count: number;
  can_remove: boolean;
  can_hide: boolean;
  can_reply_privately: boolean;
}

@Injectable()
export class FacebookService {
  private readonly FACEBOOK_API_URL = 'https://graph.facebook.com/v18.0';

  async getPages(accessToken: string): Promise<FacebookPage[]> {
    try {
      const response = await axios.get(`${this.FACEBOOK_API_URL}/me/accounts`, {
        params: {
          access_token: accessToken,
          fields: 'id,name,category,access_token,tasks',
        },
      });

      return response.data.data;
    } catch (error: any) {
      console.log('Errore Facebook getPages:', error.response?.data || error);
      throw new BadRequestException(
        JSON.stringify(
          {
            originalError: error.message,
            code: error.response?.status,
            details: error.response?.data || 'No additional details',
          },
          null,
          2,
        ),
      );
    }
  }

  async getPagePosts(
    pageId: string,
    pageAccessToken: string,
    limit: number = 25,
  ): Promise<FacebookPost[]> {
    try {
      const response = await axios.get(
        `${this.FACEBOOK_API_URL}/${pageId}/posts`,
        {
          params: {
            access_token: pageAccessToken,
            fields:
              'id,message,story,created_time,updated_time,likes.summary(true),comments.summary(true)',
            limit,
          },
        },
      );

      return response.data.data;
    } catch (error: any) {
      console.log(
        'Errore Facebook getPagePosts:',
        error.response?.data || error,
      );
      throw new BadRequestException(
        JSON.stringify(
          {
            originalError: error.message,
            code: error.response?.status,
            details: error.response?.data || 'No additional details',
          },
          null,
          2,
        ),
      );
    }
  }

  async createPost(
    pageId: string,
    pageAccessToken: string,
    message: string,
    link?: string,
    image?: Express.Multer.File,
  ): Promise<any> {
    try {
      // Se c'è un'immagine, usiamo l'endpoint photos per creare un post con immagine
      if (image) {
        console.log('📸 Creating post with image...');
        return this.createPostWithImage(
          pageId,
          pageAccessToken,
          message,
          link,
          image,
        );
      }

      // Altrimenti creiamo un post normale
      const postData: any = {
        access_token: pageAccessToken,
        message,
      };

      if (link) {
        postData.link = link;
      }

      const response = await axios.post(
        `${this.FACEBOOK_API_URL}/${pageId}/feed`,
        postData,
      );

      return response.data;
    } catch (error: any) {
      console.log('Errore Facebook createPost:', error.response?.data || error);
      throw new BadRequestException(
        JSON.stringify(
          {
            originalError: error.message,
            code: error.response?.status,
            details: error.response?.data || 'No additional details',
          },
          null,
          2,
        ),
      );
    }
  }

  async updatePost(
    postId: string,
    pageAccessToken: string,
    message: string,
    link?: string,
    image?: Express.Multer.File,
  ): Promise<any> {
    try {
      // Facebook non permette di modificare post con immagini
      // Possiamo solo aggiornare il messaggio e il link
      const postData: any = {
        access_token: pageAccessToken,
        message,
      };

      if (link) {
        postData.link = link;
      }

      console.log(
        '⚠️ Note: Facebook non permette di modificare immagini nei post esistenti',
      );
      console.log('📝 Updating post message and link only...');

      const response = await axios.post(
        `${this.FACEBOOK_API_URL}/${postId}`,
        postData,
      );

      return response.data;
    } catch (error: any) {
      console.log('Errore Facebook updatePost:', error.response?.data || error);
      throw new BadRequestException(
        JSON.stringify(
          {
            originalError: error.message,
            code: error.response?.status,
            details: error.response?.data || 'No additional details',
          },
          null,
          2,
        ),
      );
    }
  }

  async createPostWithImage(
    pageId: string,
    pageAccessToken: string,
    message: string,
    link?: string,
    image?: Express.Multer.File,
  ): Promise<any> {
    try {
      const FormData = require('form-data');
      const fs = require('fs');

      const form = new FormData();
      form.append('access_token', pageAccessToken);
      form.append('message', message);

      if (link) {
        form.append('link', link);
      }

      if (image) {
        form.append('source', fs.createReadStream(image.path));
      }

      console.log('📸 Creating post with image using photos endpoint...');

      const response = await axios.post(
        `${this.FACEBOOK_API_URL}/${pageId}/photos`,
        form,
        {
          headers: {
            ...form.getHeaders(),
          },
        },
      );

      // Pulisci il file temporaneo
      if (image) {
        fs.unlinkSync(image.path);
      }

      return response.data;
    } catch (error: any) {
      console.log(
        'Errore Facebook createPostWithImage:',
        error.response?.data || error,
      );
      throw new BadRequestException(
        JSON.stringify(
          {
            originalError: error.message,
            code: error.response?.status,
            details: error.response?.data || 'No additional details',
          },
          null,
          2,
        ),
      );
    }
  }

  async uploadImageToFacebook(
    pageId: string,
    pageAccessToken: string,
    image: Express.Multer.File,
  ): Promise<any> {
    try {
      const FormData = require('form-data');
      const fs = require('fs');

      // Verifica che l'immagine sia definita
      if (!image || !image.path) {
        throw new BadRequestException(
          'Image file is required for uploadImageToFacebook',
        );
      }

      const form = new FormData();
      form.append('access_token', pageAccessToken);
      form.append('source', fs.createReadStream(image.path));

      const response = await axios.post(
        `${this.FACEBOOK_API_URL}/${pageId}/photos`,
        form,
        {
          headers: {
            ...form.getHeaders(),
          },
        },
      );

      // Pulisci il file temporaneo
      fs.unlinkSync(image.path);

      return response.data;
    } catch (error: any) {
      console.log(
        'Errore Facebook uploadImage:',
        error.response?.data || error,
      );
      throw new BadRequestException(
        JSON.stringify(
          {
            originalError: error.message,
            code: error.response?.status,
            details: error.response?.data || 'No additional details',
          },
          null,
          2,
        ),
      );
    }
  }

  async getPostComments(
    postId: string,
    pageAccessToken: string,
    limit: number = 25,
  ): Promise<FacebookComment[]> {
    try {
      const response = await axios.get(
        `${this.FACEBOOK_API_URL}/${postId}/comments`,
        {
          params: {
            access_token: pageAccessToken,
            fields:
              'id,message,created_time,from,like_count,can_remove,can_hide,can_reply_privately',
            limit,
          },
        },
      );

      return response.data.data;
    } catch (error: any) {
      console.log(
        'Errore Facebook getPostComments:',
        error.response?.data || error,
      );
      throw new BadRequestException(
        JSON.stringify(
          {
            originalError: error.message,
            code: error.response?.status,
            details: error.response?.data || 'No additional details',
          },
          null,
          2,
        ),
      );
    }
  }

  async replyToComment(
    commentId: string,
    pageAccessToken: string,
    message: string,
  ): Promise<any> {
    try {
      const response = await axios.post(
        `${this.FACEBOOK_API_URL}/${commentId}/comments`,
        {
          access_token: pageAccessToken,
          message,
        },
      );

      return response.data;
    } catch (error: any) {
      console.log(
        'Errore Facebook replyToComment:',
        error.response?.data || error,
      );
      throw new BadRequestException(
        JSON.stringify(
          {
            originalError: error.message,
            code: error.response?.status,
            details: error.response?.data || 'No additional details',
          },
          null,
          2,
        ),
      );
    }
  }

  async deleteComment(
    commentId: string,
    pageAccessToken: string,
  ): Promise<any> {
    try {
      const response = await axios.delete(
        `${this.FACEBOOK_API_URL}/${commentId}`,
        {
          params: {
            access_token: pageAccessToken,
          },
        },
      );

      return response.data;
    } catch (error: any) {
      console.log(
        'Errore Facebook deleteComment:',
        error.response?.data || error,
      );
      throw new BadRequestException(
        JSON.stringify(
          {
            originalError: error.message,
            code: error.response?.status,
            details: error.response?.data || 'No additional details',
          },
          null,
          2,
        ),
      );
    }
  }

  async hideComment(
    commentId: string,
    pageAccessToken: string,
    hide: boolean = true,
  ): Promise<any> {
    try {
      const response = await axios.post(
        `${this.FACEBOOK_API_URL}/${commentId}`,
        {
          access_token: pageAccessToken,
          is_hidden: hide,
        },
      );

      return response.data;
    } catch (error: any) {
      console.log(
        'Errore Facebook hideComment:',
        error.response?.data || error,
      );
      throw new BadRequestException(
        JSON.stringify(
          {
            originalError: error.message,
            code: error.response?.status,
            details: error.response?.data || 'No additional details',
          },
          null,
          2,
        ),
      );
    }
  }

  async likeComment(commentId: string, pageAccessToken: string): Promise<any> {
    try {
      console.log('🔍 DEBUG likeComment - commentId:', commentId);
      console.log(
        '🔍 DEBUG likeComment - pageAccessToken (primi 10):',
        pageAccessToken ? pageAccessToken.substring(0, 10) + '...' : 'NULL',
      );
      console.log(
        '🔍 DEBUG likeComment - URL:',
        `${this.FACEBOOK_API_URL}/${commentId}/likes`,
      );

      const response = await axios.post(
        `${this.FACEBOOK_API_URL}/${commentId}/likes`,
        {
          access_token: pageAccessToken,
        },
      );

      console.log('✅ DEBUG likeComment - Risposta:', response.data);
      return response.data;
    } catch (error: any) {
      console.log(
        '❌ Errore Facebook likeComment:',
        error.response?.data || error,
      );
      console.log('❌ DEBUG likeComment - Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data,
      });
      throw new BadRequestException(
        JSON.stringify(
          {
            originalError: error.message,
            code: error.response?.status,
            details: error.response?.data || 'No additional details',
          },
          null,
          2,
        ),
      );
    }
  }

  async deletePost(postId: string, pageAccessToken: string): Promise<any> {
    try {
      const response = await axios.delete(
        `${this.FACEBOOK_API_URL}/${postId}`,
        {
          params: {
            access_token: pageAccessToken,
          },
        },
      );

      return response.data;
    } catch (error: any) {
      console.log('Errore Facebook deletePost:', error.response?.data || error);
      throw new BadRequestException(
        JSON.stringify(
          {
            originalError: error.message,
            code: error.response?.status,
            details: error.response?.data || 'No additional details',
          },
          null,
          2,
        ),
      );
    }
  }

  async getPageInsights(
    pageId: string,
    pageAccessToken: string,
    metrics: string[] = ['page_fans', 'page_impressions'],
  ): Promise<any> {
    try {
      const response = await axios.get(
        `${this.FACEBOOK_API_URL}/${pageId}/insights`,
        {
          params: {
            access_token: pageAccessToken,
            metric: metrics.join(','),
            period: 'day',
            since: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0], // 7 giorni fa
            until: new Date().toISOString().split('T')[0],
          },
        },
      );

      return response.data.data;
    } catch (error: any) {
      console.log(
        'Errore Facebook getPageInsights:',
        error.response?.data || error,
      );
      throw new BadRequestException(
        JSON.stringify(
          {
            originalError: error.message,
            code: error.response?.status,
            details: error.response?.data || 'No additional details',
          },
          null,
          2,
        ),
      );
    }
  }
}
