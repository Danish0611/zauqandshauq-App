@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0backend"

:: Auto-detect PostgreSQL host (localhost or WSL IP)
set "DB_HOST=localhost"
powershell -NoProfile -Command "try { $c = New-Object System.Net.Sockets.TcpClient; $c.Connect('127.0.0.1', 5432); $c.Close(); exit 0 } catch { exit 1 }" >nul 2>nul
if %errorlevel% neq 0 (
    for /f "tokens=*" %%i in ('wsl -d podman-machine-default ip -4 addr show eth0 2^>nul ^| powershell -NoProfile -Command "$input | Select-String -Pattern 'inet\s+([0-9.]+)' | ForEach-Object { $_.Matches.Groups[1].Value }"') do (
        set "DB_HOST=%%i"
    )
)
if not "%DB_HOST%"=="localhost" (
    echo [Zauq ^& Shauq] Connecting to PostgreSQL on Podman/WSL at %DB_HOST%:5432
)

where mvn >nul 2>nul
if %errorlevel% equ 0 (
    call mvn spring-boot:run
    goto :end
)

if exist "C:\Program Files\JetBrains\IntelliJ IDEA 2026.2.3\plugins\maven-plugin\lib\maven3\bin\mvn.cmd" (
    call "C:\Program Files\JetBrains\IntelliJ IDEA 2026.2.3\plugins\maven-plugin\lib\maven3\bin\mvn.cmd" spring-boot:run
    goto :end
)

echo Maven is not installed or not available in PATH. Install Apache Maven 3.9+ and retry.
pause
exit /b 1

:end
pause
