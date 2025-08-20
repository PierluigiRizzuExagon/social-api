@echo off
REM Script per avviare Backend + Frontend insieme su Windows
REM Google My Business Integration

echo 🚀 Avvio Google My Business Integration...
echo.

REM Controlla se le dipendenze sono installate
echo 📦 Controllo dipendenze...

if not exist "backend\node_modules" (
    echo ⚠️  Installazione dipendenze backend...
    cd backend && npm install && cd ..
)

if not exist "frontend\node_modules" (
    echo ⚠️  Installazione dipendenze frontend...
    cd frontend && npm install && cd ..
)

REM Controlla se il file .env esiste
if not exist "backend\.env" (
    echo ❌ File .env non trovato!
    echo 📝 Copia backend\.env.example in backend\.env e configura le variabili
    echo 🔗 Segui le istruzioni nel README.md per ottenere le credenziali Google
    pause
    exit /b 1
)

echo ✅ Dipendenze OK
echo.

REM Avvia entrambi i servizi
echo 🚀 Avvio servizi...
echo 📍 Backend: http://localhost:3000
echo 📍 Frontend: http://localhost:3001
echo.
echo Premi Ctrl+C per fermare entrambi i servizi
echo.

REM Usa concurrently per avviare entrambi
npx concurrently ^
  --prefix-colors "blue,green" ^
  --prefix "[{name}]" ^
  --names "BACKEND,FRONTEND" ^
  "cd backend && npm run start:dev" ^
  "cd frontend && npm run start"
