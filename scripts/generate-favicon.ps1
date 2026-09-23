# scripts/generate-favicon.ps1
# Genera el favicon de ELEGANCE en la raiz del repo: favicon.svg, favicon.png,
# favicon.ico y apple-touch-icon.png (marca: fondo oscuro + "E" dorada serif).
# Uso: powershell -ExecutionPolicy Bypass -File scripts/generate-favicon.ps1

Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$dark = [System.Drawing.Color]::FromArgb(28, 25, 23)   # --ink
$gold = [System.Drawing.Color]::FromArgb(201, 162, 75) # --gold

function New-Favicon($size, $outFile, $round) {
  $bmp = New-Object System.Drawing.Bitmap($size, $size)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  $g.Clear([System.Drawing.Color]::Transparent)

  # fondo oscuro (cuadrado o redondeado)
  if ($round -gt 0) {
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $r = [int]($size * 0.2)
    $path.AddArc(0, 0, $r*2, $r*2, 180, 90)
    $path.AddArc($size-$r*2, 0, $r*2, $r*2, 270, 90)
    $path.AddArc($size-$r*2, $size-$r*2, $r*2, $r*2, 0, 90)
    $path.AddArc(0, $size-$r*2, $r*2, $r*2, 90, 90)
    $path.CloseFigure()
    $brush = New-Object System.Drawing.SolidBrush($dark)
    $g.FillPath($brush, $path)
    $brush.Dispose(); $path.Dispose()
  } else {
    $g.Clear($dark)
  }

  # letra "E" dorada
  $fontSize = [float]($size * 0.6)
  $font = New-Object System.Drawing.Font("Georgia", $fontSize, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
  $sf = New-Object System.Drawing.StringFormat
  $sf.Alignment = [System.Drawing.StringAlignment]::Center
  $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
  $rect = New-Object System.Drawing.RectangleF(0, [float]($size*0.02), $size, $size)
  $goldBrush = New-Object System.Drawing.SolidBrush($gold)
  $g.DrawString("E", $font, $goldBrush, $rect, $sf)

  $goldBrush.Dispose(); $font.Dispose(); $sf.Dispose(); $g.Dispose()
  $bmp.Save($outFile, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  Write-Host "OK: $outFile"
}

# --- PNG ---
New-Favicon 32  (Join-Path $root "favicon.png")            $true
New-Favicon 180 (Join-Path $root "apple-touch-icon.png")   $true

# --- ICO con PNG embebido (compatible) ---
$png32 = [System.IO.File]::ReadAllBytes((Join-Path $root "favicon.png"))
$stream = New-Object System.IO.MemoryStream
$writer = New-Object System.IO.BinaryWriter($stream)
$writer.Write([UInt16]0)            # reservado
$writer.Write([UInt16]1)            # tipo: icono
$writer.Write([UInt16]1)            # cantidad
$writer.Write([byte]32)             # ancho
$writer.Write([byte]32)             # alto
$writer.Write([byte]0)              # paleta
$writer.Write([byte]0)              # reservado
$writer.Write([UInt16]1)            # planos
$writer.Write([UInt16]32)           # profundidad de bits
$writer.Write([UInt32]$png32.Length) # tamaño de datos
$writer.Write([UInt32]22)           # offset de datos (6 + 16)
$writer.Write($png32)
$writer.Flush()
[System.IO.File]::WriteAllBytes((Join-Path $root "favicon.ico"), $stream.ToArray())
$writer.Dispose(); $stream.Dispose()
Write-Host "OK: favicon.ico"

# --- SVG ---
$svg = @'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="13" fill="#1c1917"/>
  <text x="32" y="45" font-family="Georgia, 'Times New Roman', serif" font-size="40" font-weight="700" text-anchor="middle" fill="#c9a24b">E</text>
</svg>
'@
[System.IO.File]::WriteAllText((Join-Path $root "favicon.svg"), $svg, (New-Object System.Text.UTF8Encoding($false)))
Write-Host "OK: favicon.svg"
Write-Host "Listo."