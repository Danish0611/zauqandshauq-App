@echo off
cd /d "%~dp0frontend"
if not exist node_modules (
  echo Installing frontend packages...
  call npm install || goto :error
)
call npm start
exit /b %errorlevel%
:error
echo Frontend setup failed. Confirm Node.js 22 LTS and npm are installed.
pause
