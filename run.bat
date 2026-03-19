@echo off
chcp 65001 >nul
echo.
echo  PaintCo Vietnam - Quick Start
echo ==================================
echo.

:: Check Docker
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker chua chay! Hay mo Docker Desktop truoc.
    pause
    exit /b 1
)

echo [OK] Docker san sang
echo.
echo [BUILD] Dang build va khoi dong tat ca services...
echo         (Lan dau se mat 5-10 phut)
echo.

docker-compose up -d --build

echo.
echo [WAIT] Doi backend san sang (30 giay)...
timeout /t 30 /nobreak >nul

echo.
echo [SEED] Dang tao du lieu mau...
docker-compose exec backend node dist/database/seed.js
if errorlevel 1 (
    echo [WARN] Seed se chay sau. Lenh: docker-compose exec backend npm run seed
)

echo.
echo ============================================
echo   Website:   http://localhost
echo   API:       http://localhost/api/v1
echo   Swagger:   http://localhost:3000/api/docs
echo   Admin:     admin@paintco.vn / admin123
echo ============================================
echo.
echo De xem logs: docker-compose logs -f
echo De tat:      docker-compose down
echo.
pause
