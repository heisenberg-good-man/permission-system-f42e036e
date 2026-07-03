@echo off
chcp 65001 >nul
echo ========================================
echo   招聘平台 - 一键启动脚本
echo ========================================
echo.

echo [1/3] 检查 Node.js 环境...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Node.js，请先安装 Node.js 18+
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js 版本: 
node -v
echo.

echo [2/3] 启动后端服务 (http://localhost:3000)...
cd /d "%~dp0server"
if not exist "node_modules" (
    echo 首次启动，正在安装后端依赖...
    call npm install
)
start "招聘平台-后端" cmd /k "cd /d %~dp0server && node app.js"

echo 等待后端启动...
timeout /t 3 /nobreak >nul

echo [3/3] 启动前端服务 (http://localhost:5173)...
cd /d "%~dp0client"
if not exist "node_modules" (
    echo 首次启动，正在安装前端依赖...
    call npm install
)
start "招聘平台-前端" cmd /k "cd /d %~dp0client && node node_modules/vite/bin/vite.js --host 0.0.0.0"

echo.
echo ========================================
echo   启动完成！
echo   后端地址: http://localhost:3000
echo   前端地址: http://localhost:5173
echo   健康检查: http://localhost:3000/api/health
echo ========================================
echo.
echo 提示：关闭两个 cmd 窗口即可停止服务
pause
