# 招聘平台 - 一键启动脚本 (PowerShell)
# 使用方法: 右键 -> 使用 PowerShell 运行，或在终端执行 .\start.ps1

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$ServerDir = Join-Path $ProjectRoot "server"
$ClientDir = Join-Path $ProjectRoot "client"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  招聘平台 - 一键启动脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查 Node.js
Write-Host "[1/4] 检查 Node.js 环境..." -ForegroundColor Yellow
try {
    $nodeVersion = node -v
    Write-Host "Node.js 版本: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[错误] 未检测到 Node.js，请先安装 Node.js 18+" -ForegroundColor Red
    Write-Host "下载地址: https://nodejs.org/" -ForegroundColor Red
    Read-Host "按回车键退出"
    exit 1
}
Write-Host ""

# 检查并安装后端依赖
Write-Host "[2/4] 准备后端服务..." -ForegroundColor Yellow
$serverModules = Join-Path $ServerDir "node_modules"
if (-not (Test-Path $serverModules)) {
    Write-Host "首次启动，正在安装后端依赖..." -ForegroundColor Magenta
    Set-Location $ServerDir
    npm install
}

# 检查并安装前端依赖
Write-Host "[3/4] 准备前端服务..." -ForegroundColor Yellow
$clientModules = Join-Path $ClientDir "node_modules"
if (-not (Test-Path $clientModules)) {
    Write-Host "首次启动，正在安装前端依赖..." -ForegroundColor Magenta
    Set-Location $ClientDir
    npm install
}
Write-Host ""

# 启动后端
Write-Host "[4/4] 启动服务..." -ForegroundColor Yellow
Write-Host "启动后端服务 (http://localhost:3000)..." -ForegroundColor Green
$backendJob = Start-Job -ScriptBlock {
    param($dir)
    Set-Location $dir
    node app.js
} -ArgumentList $ServerDir

# 等后端启动
Start-Sleep -Seconds 3

# 启动前端
Write-Host "启动前端服务 (http://localhost:5173)..." -ForegroundColor Green
$frontendJob = Start-Job -ScriptBlock {
    param($dir)
    Set-Location $dir
    & node "node_modules/vite/bin/vite.js" --host 0.0.0.0
} -ArgumentList $ClientDir

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  启动完成！" -ForegroundColor Green
Write-Host "  后端地址: http://localhost:3000" -ForegroundColor White
Write-Host "  前端地址: http://localhost:5173" -ForegroundColor White
Write-Host "  健康检查: http://localhost:3000/api/health" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "提示：按 Ctrl+C 停止所有服务" -ForegroundColor Yellow
Write-Host ""

try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    Write-Host "`n正在停止服务..." -ForegroundColor Yellow
    Stop-Job $backendJob -ErrorAction SilentlyContinue
    Stop-Job $frontendJob -ErrorAction SilentlyContinue
    Remove-Job $backendJob -Force -ErrorAction SilentlyContinue
    Remove-Job $frontendJob -Force -ErrorAction SilentlyContinue
    Write-Host "服务已停止" -ForegroundColor Green
}
