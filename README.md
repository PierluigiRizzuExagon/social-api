# Social Media Management Backend

Un backend NestJS completo per la gestione di social media, integrato con Google My Business e Facebook Graph API.

## 🚀 Funzionalità

### Google My Business

- **Autenticazione OAuth2** con Google
- **Gestione Business Information** (modifica card aziendale)
- **Gestione Recensioni** (risposta, modifica, eliminazione)
- **Gestione Post** (creazione, modifica, eliminazione)
- **Gestione Account** (informazioni account, permessi)

### Facebook

- **Autenticazione OAuth2** con Facebook
- **Gestione Pagine** (lista pagine, token di accesso)
- **Gestione Post** (creazione, modifica, eliminazione)
- **Gestione Commenti** (risposta, eliminazione, nascondere/mostrare, like)
- **Upload Immagini** (post con foto + testo)
- **Insights** (metriche pagina)

### Frontend di Test

- **Interfaccia HTML/JavaScript** per testare tutte le API
- **Gestione token** automatica
- **Upload file** per immagini
- **Debug logs** dettagliati

## 🏗️ Architettura

```
social/
├── backend/                 # NestJS Backend
│   ├── src/
│   │   ├── auth/           # Autenticazione OAuth2
│   │   ├── google-business/ # Google My Business API
│   │   ├── facebook/       # Facebook Graph API
│   │   └── config/         # Configurazione
│   └── package.json
├── frontend/               # Frontend di test
│   └── index.html
└── package.json           # Scripts per avviare tutto
```

## 🛠️ Tecnologie

### Backend

- **NestJS** - Framework Node.js
- **Passport.js** - Autenticazione OAuth2
- **JWT** - Token di sessione
- **Axios** - HTTP client
- **Multer** - Upload file
- **Form-data** - Gestione multipart

### Frontend

- **HTML5** - Interfaccia utente
- **JavaScript ES6** - Logica client
- **CSS3** - Styling

## 📋 Prerequisiti

- Node.js 16+
- npm o yarn
- Account Google My Business
- App Facebook Developer

## ⚙️ Configurazione

### 1. Clona il repository

```bash
git clone https://github.com/PierluigiRizzuExagon/social-api.git
cd social-api
```

### 2. Installa le dipendenze

```bash
npm install
cd backend && npm install
```

### 3. Configura le variabili d'ambiente

Copia `backend/.env.example` in `backend/.env` e configura:

```env
# Google OAuth2
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

# Facebook OAuth2
FACEBOOK_CLIENT_ID=your_facebook_client_id
FACEBOOK_CLIENT_SECRET=your_facebook_client_secret
FACEBOOK_REDIRECT_URI=http://localhost:3000/auth/facebook/callback

# JWT e Session
JWT_SECRET=your_jwt_secret_key
SESSION_SECRET=your_session_secret

# Frontend
FRONTEND_URL=http://localhost:8080
```

### 4. Configura Google My Business

1. Vai su [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuovo progetto
3. Abilita Google My Business API
4. Crea credenziali OAuth2
5. Configura URI di redirect

### 5. Configura Facebook App

1. Vai su [Facebook Developers](https://developers.facebook.com/)
2. Crea una nuova app
3. Aggiungi prodotto "Facebook Login"
4. Configura OAuth redirect URI
5. Richiedi permessi:
   - `email`
   - `public_profile`
   - `pages_show_list`
   - `pages_read_engagement`
   - `pages_manage_posts`
   - `pages_manage_engagement`
   - `pages_read_user_content`
   - `pages_manage_metadata`

## 🚀 Avvio

### Sviluppo

```bash
# Avvia backend e frontend contemporaneamente
npm start

# Oppure separatamente:
npm run backend  # Backend su porta 3000
npm run frontend # Frontend su porta 8080
```

### Produzione

```bash
cd backend
npm run build
npm run start:prod
```

## 📚 API Endpoints

### Autenticazione

- `GET /auth/google` - Login Google
- `GET /auth/google/callback` - Callback Google
- `GET /auth/facebook` - Login Facebook
- `GET /auth/facebook/callback` - Callback Facebook

### Google My Business

- `GET /google/accounts` - Lista account
- `GET /google/accounts/:accountId/locations` - Lista location
- `PUT /google/locations/:locationId` - Modifica location
- `GET /google/locations/:locationId/reviews` - Lista recensioni
- `PUT /google/reviews/:reviewId` - Modifica recensione
- `DELETE /google/reviews/:reviewId` - Elimina recensione
- `GET /google/locations/:locationId/posts` - Lista post
- `POST /google/locations/:locationId/posts` - Crea post
- `PUT /google/posts/:postId` - Modifica post
- `DELETE /google/posts/:postId` - Elimina post

### Facebook

- `GET /facebook/pages` - Lista pagine
- `GET /facebook/pages/:pageId/posts` - Lista post
- `POST /facebook/pages/:pageId/posts` - Crea post (con immagine)
- `PUT /facebook/posts/:postId` - Modifica post
- `DELETE /facebook/posts/:postId` - Elimina post
- `GET /facebook/posts/:postId/comments` - Lista commenti
- `POST /facebook/comments/:commentId/reply` - Rispondi a commento
- `DELETE /facebook/comments/:commentId` - Elimina commento
- `POST /facebook/comments/:commentId/hide` - Nascondi commento
- `POST /facebook/comments/:commentId/likes` - Like commento
- `GET /facebook/pages/:pageId/insights` - Insights pagina

## 🔧 Headers Richiesti

### Google

- `X-Google-Token`: Token di accesso Google

### Facebook

- `X-Facebook-Token`: Token di accesso utente Facebook
- `X-Facebook-Page-Token`: Token di accesso pagina Facebook (per operazioni su pagine)

## 📝 Note Importanti

### Google My Business

- Richiede autenticazione OAuth2
- Token scadono dopo 1 ora
- Alcune operazioni richiedono permessi specifici

### Facebook

- **User Access Token** vs **Page Access Token**:
  - User Token: per ottenere lista pagine
  - Page Token: per operazioni su pagine specifiche
- **Upload Immagini**: Usa endpoint `/photos` per post con immagine + testo
- **Modifica Post**: Facebook non permette di modificare immagini su post esistenti
- **Permessi**: Richiede permessi specifici per ogni operazione

### Sicurezza

- Token vengono gestiti lato client (localStorage)
- Session management con express-session
- CORS configurato per frontend
- Rate limiting e caching rimossi per debug

## 🐛 Debug

### Logs Backend

- Console logs dettagliati per ogni operazione
- Errori originali API esposti come JSON
- Debug per token e parametri

### Logs Frontend

- Console logs per ogni chiamata API
- Debug per token e dati
- Preview immagini prima dell'upload

### Errori Comuni

- `EADDRINUSE`: Porta già in uso → `pkill -f "nest\|node"`
- `Invalid OAuth 2.0 Access Token`: Token scaduto → Riloggare
- `Cannot parse access token`: Token malformato → Verificare formato
- `È necessario un token d'accesso della Pagina`: Usare Page Token invece di User Token

## 📄 Licenza

MIT License

## 🤝 Contributi

1. Fork il progetto
2. Crea un branch per la feature (`git checkout -b feature/AmazingFeature`)
3. Commit le modifiche (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## 📞 Supporto

Per problemi o domande:

1. Controlla i logs del backend e frontend
2. Verifica la configurazione delle variabili d'ambiente
3. Controlla i permessi delle app Google/Facebook
4. Apri una issue su GitHub
