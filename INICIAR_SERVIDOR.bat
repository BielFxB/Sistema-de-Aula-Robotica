@echo off
title Servidor de Aulas de Robotica - Rede Local
cd /d "%~dp0"
cls
echo ===================================================
echo   Iniciando Servidor de Robotica para a Rede Local
echo ===================================================
echo.
py servidor_local.py
if %ERRORLEVEL% NEQ 0 (
    python servidor_local.py
)
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERRO] Python nao foi encontrado! 
    echo Tentando iniciar via Node.js...
    npx -y serve . -p 8000
)
pause

