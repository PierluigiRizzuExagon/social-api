#!/bin/bash

# Script per avviare Backend + Frontend insieme
# Google My Business Integration

echo "🚀 Avvio Google My Business Integration..."
echo ""

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Controlla se le dipendenze sono installate
echo -e "${BLUE}📦 Controllo dipendenze...${NC}"

if [ ! -d "backend/node_modules" ]; then
    echo -e "${YELLOW}⚠️  Installazione dipendenze backend...${NC}"
    cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}⚠️  Installazione dipendenze frontend...${NC}"
    cd frontend && npm install && cd ..
fi

# Controlla se il file .env esiste
if [ ! -f "backend/.env" ]; then
    echo -e "${RED}❌ File .env non trovato!${NC}"
    echo -e "${YELLOW}📝 Copia backend/.env.example in backend/.env e configura le variabili${NC}"
    echo -e "${BLUE}🔗 Segui le istruzioni nel README.md per ottenere le credenziali Google${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Dipendenze OK${NC}"
echo ""

# Avvia entrambi i servizi
echo -e "${BLUE}🚀 Avvio servizi...${NC}"
echo -e "${YELLOW}📍 Backend: http://localhost:3000${NC}"
echo -e "${YELLOW}📍 Frontend: http://localhost:3001${NC}"
echo ""
echo -e "${GREEN}Premi Ctrl+C per fermare entrambi i servizi${NC}"
echo ""

# Usa concurrently per avviare entrambi
npx concurrently \
  --prefix-colors "blue,green" \
  --prefix "[{name}]" \
  --names "BACKEND,FRONTEND" \
  "cd backend && npm run start:dev" \
  "cd frontend && npm run start"
