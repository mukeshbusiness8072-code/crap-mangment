# Start MV Mukesh Vanitha shop locally (PC + phone on same Wi-Fi)
$root = $PSScriptRoot
Set-Location $root

$port = 5173
$localUrl = "http://localhost:$port/catalog.html"

function Get-LanIp {
  $ip = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
    Where-Object { $_.IPAddress -notlike '127.*' -and $_.PrefixOrigin -ne 'WellKnown' } |
    Select-Object -First 1 -ExpandProperty IPAddress
  if (-not $ip) {
    $ip = (Get-NetIPConfiguration | Where-Object { $_.IPv4DefaultGateway } |
      Select-Object -First 1).IPv4Address.IPAddress
  }
  return $ip
}

function Start-PythonServer {
  $py = Get-Command python -ErrorAction SilentlyContinue
  if (-not $py) { return $false }
  Write-Host "Starting server on port $port (phone + PC)..."
  Start-Process $py.Source -ArgumentList "-m", "http.server", $port, "--bind", "0.0.0.0", "-d", $root
  return $true
}

$lanIp = Get-LanIp
if ($lanIp) {
  Write-Host ""
  Write-Host "On your PHONE (same Wi-Fi), open:"
  Write-Host "  http://${lanIp}:${port}/catalog.html" -ForegroundColor Green
  Write-Host ""
}

$npm = "C:\Program Files\nodejs\npm.cmd"
if (Test-Path $npm) {
  if (-not (Test-Path "$root\node_modules")) {
    Write-Host "Installing dependencies..."
    & $npm install
  }
  Write-Host "Starting Vite..."
  Start-Process $npm -ArgumentList "run", "dev", "--", "--host", "0.0.0.0" -WorkingDirectory $root
  Start-Sleep -Seconds 4
  Start-Process $localUrl
  Write-Host "PC browser: $localUrl"
  exit 0
}

if (Start-PythonServer) {
  Start-Sleep -Seconds 2
  Start-Process $localUrl
  Write-Host "PC browser: $localUrl"
  exit 0
}

Write-Host "Install Python or Node.js, then run START-SITE.bat again."
Read-Host "Press Enter"
