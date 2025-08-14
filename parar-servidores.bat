@echo off
chcp 65001 >nul
title Parar Servidores - Rota de Ataque Questões

echo.
echo ========================================
echo   PARANDO SERVIDORES
echo ========================================
echo.

echo 🔍 Procurando processos Node.js...
echo.

:: Parar processos na porta 3000 (Frontend Vite)
echo 📱 Parando servidor Frontend (porta 3000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do (
    taskkill /f /pid %%a 2>nul
    if !errorlevel! equ 0 (
        echo ✅ Processo na porta 3000 parado
    ) else (
        echo ⚠️  Nenhum processo encontrado na porta 3000
    )
)

:: Parar processos na porta 3002 (Backend Express)
echo 🔧 Parando servidor Backend (porta 3002)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3002') do (
    taskkill /f /pid %%a 2>nul
    if !errorlevel! equ 0 (
        echo ✅ Processo na porta 3002 parado
    ) else (
        echo ⚠️  Nenhum processo encontrado na porta 3002
    )
)

:: Parar todos os processos node.exe (alternativa)
echo 🔍 Parando todos os processos Node.js...
taskkill /f /im node.exe 2>nul
if !errorlevel! equ 0 (
    echo ✅ Todos os processos Node.js parados
) else (
    echo ⚠️  Nenhum processo Node.js encontrado
)

echo.
echo ✅ Operação concluída!
echo.
echo 💡 Se algum servidor ainda estiver rodando, feche manualmente as janelas
echo.
pause
