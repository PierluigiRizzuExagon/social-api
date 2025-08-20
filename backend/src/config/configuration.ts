export default () => ({
  port: parseInt(process.env.PORT || '3000', 10) || 3000,
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri:
      process.env.GOOGLE_REDIRECT_URI ||
      'http://localhost:3000/auth/google/callback',
  },
  facebook: {
    clientId: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    redirectUri:
      process.env.FACEBOOK_REDIRECT_URI ||
      'http://localhost:3000/auth/facebook/callback',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default-jwt-secret',
    expiresIn: '24h',
  },
  session: {
    secret: process.env.SESSION_SECRET || 'default-session-secret',
  },
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3001',
  },
});
