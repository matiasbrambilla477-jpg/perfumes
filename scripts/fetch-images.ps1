# fetch-images.ps1
# 1) Download catalog images from the provider into img/products/
# 2) Rewrite js/products.js to use local paths (no hotlink)
# Usage: powershell -ExecutionPolicy Bypass -File scripts/fetch-images.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$out  = Join-Path $root "img\products"
$js   = Join-Path $root "js\products.js"

if (!(Test-Path $out)) { New-Item -ItemType Directory -Path $out -Force | Out-Null }

$content = Get-Content $js -Raw
$ids = [regex]::Matches($content, 'img: "https://api\.eleganciacompany\.com/storage/products/(\d+)_1\.png"') |
       ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique

Write-Host "Productos con imagen remota: $($ids.Count)"
$ok = 0; $fail = 0; $bytesTotal = 0

foreach ($id in $ids) {
  $url = "https://api.eleganciacompany.com/storage/products/${id}_1.png"
  $data = $null
  try {
    $data = Invoke-WebRequest -Uri $url -TimeoutSec 30 -UseBasicParsing
  } catch {
    Write-Host "FALLO $id : $($_.Exception.Message)"
    $fail++
    continue
  }
  $bytes = $data.Content
  $b0 = [int]$bytes[0]; $b1 = [int]$bytes[1]
  $head = [System.Text.Encoding]::ASCII.GetString($bytes[0..3])
  $tail = if ($bytes.Length -ge 12) { [System.Text.Encoding]::ASCII.GetString($bytes[8..11]) } else { "" }
  if ($b0 -eq 0x89 -and [System.Text.Encoding]::ASCII.GetString($bytes[1..3]) -eq "PNG") { $ext = "png" }
  elseif ($b0 -eq 0xFF -and $b1 -eq 0xD8) { $ext = "jpg" }
  elseif ($head -eq "RIFF" -and $tail -eq "WEBP") { $ext = "webp" }
  else { $ext = "png" }
  $target = Join-Path $out "${id}.$ext"
  [System.IO.File]::WriteAllBytes($target, $bytes)
  $bytesTotal += $bytes.Length
  $ok++
}

Write-Host "Bajadas: $ok ok / $fail fallaron - $([math]::Round($bytesTotal/1MB,2)) MB"

# Rewrite only the URLs that were downloaded (leave the rest intact)
$g = 0
$content = [regex]::Replace($content, 'img: "https://api\.eleganciacompany\.com/storage/products/(\d+)_1\.png"', {
  param($m)
  $id = $m.Groups[1].Value
  $f = Get-ChildItem -Path $out -Filter "${id}.*" -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($f) { $script:g++; return ('img: "img/products/{0}.{1}"' -f $id, $f.Extension.TrimStart('.')) }
  return $m.Value
})
$utf8 = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($js, $content, $utf8)
Write-Host "URLs reescritas en products.js: $g de $($ids.Count)"
Write-Host "Listo."