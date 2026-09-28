# Genera imágenes para Elegance:
#  - Placeholders (botella genérica) para los 4 SKU nuevos.
#  - Collages "Combo Pack 5" y "Combo Pack 10" (título + botellas + precio).
# Uso:  powershell -ExecutionPolicy Bypass -File scripts\generar-images.ps1

Add-Type -AssemblyName System.Drawing

$GOLD = [System.Drawing.Color]::FromArgb(255, 214, 187, 96)
$GOLD_DARK = [System.Drawing.Color]::FromArgb(255, 178, 138, 44)
$GOLD_LIGHT = [System.Drawing.Color]::FromArgb(255, 232, 201, 130)
$INK = [System.Drawing.Color]::FromArgb(255, 28, 25, 23)
$INK_DARK = [System.Drawing.Color]::FromArgb(255, 18, 16, 14)
$CREAM = [System.Drawing.Color]::FromArgb(255, 250, 245, 234)
$CREAM_TEXT = [System.Drawing.Color]::FromArgb(255, 245, 236, 214)
$WHITE = [System.Drawing.Color]::White

$GeoS = [System.Drawing.Font]::new("Georgia", 12, [System.Drawing.FontStyle]::Regular)

function New-Rounded([System.Drawing.Rectangle]$r, [float]$rad) {
  $p = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $d = 2 * $rad
  $p.AddArc($r.X, $r.Y, $d, $d, 180, 90)
  $p.AddArc($r.Right - $d, $r.Y, $d, $d, 270, 90)
  $p.AddArc($r.Right - $d, $r.Bottom - $d, $d, $d, 0, 90)
  $p.AddArc($r.X, $r.Bottom - $d, $d, $d, 90, 90)
  $p.CloseFigure()
  return $p
}

# Dibuja una botella generica (placeholder) dentro de un rectangulo
function Draw-Bottle([System.Drawing.Graphics]$g, [System.Drawing.Rectangle]$box, [string]$label) {
  $cx = $box.X + [int]($box.Width / 2)
  $capTop = $box.Y + 6
  $capR = [System.Drawing.Rectangle]::new($cx - 12, $capTop, 24, 16)
  $neckR = [System.Drawing.Rectangle]::new($cx - 7, $capTop + 16, 14, 12)
  $bodyTop = $box.Y + 32
  $bodyH = $box.Bottom - $bodyTop - 4
  $bodyR = [System.Drawing.Rectangle]::new($cx - 23, $bodyTop, 46, $bodyH)

  $capGrad = [System.Drawing.Drawing2D.LinearGradientBrush]::new($capR, $GOLD_LIGHT, $GOLD_DARK, 90)
  $g.FillPath($capGrad, (New-Rounded $capR 5))

  $neckBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 60, 53, 44))
  $g.FillRectangle($neckBrush, $neckR)

  $bodyGrad = [System.Drawing.Drawing2D.LinearGradientBrush]::new($bodyR, $INK_DARK, [System.Drawing.Color]::FromArgb(255, 66, 58, 48), 90)
  $g.FillPath($bodyGrad, (New-Rounded $bodyR 10))

  $bandR = [System.Drawing.Rectangle]::new($cx - 23, $bodyTop + 10, 46, 9)
  $bandBrush = [System.Drawing.Drawing2D.LinearGradientBrush]::new($bandR, $GOLD, $GOLD_DARK, 0)
  $g.FillRectangle($bandBrush, $bandR)

  $fmt = [System.Drawing.StringFormat]::new()
  $fmt.Alignment = [System.Drawing.StringAlignment]::Center
  $fmt.LineAlignment = [System.Drawing.StringAlignment]::Center
  $textBrush = [System.Drawing.SolidBrush]::new($GOLD_LIGHT)
  $textRect = [System.Drawing.RectangleF]::new($cx - 20, $bodyTop + 26, 40, [Math]::Max(20, $bodyH - 40))
  $g.DrawString($label, $GeoS, $textBrush, $textRect, $fmt)

  $flash = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(45, 255, 255, 255))
  $fh = [Math]::Max(20, $bodyH - 56)
  $g.FillRectangle($flash, [System.Drawing.Rectangle]::new($cx - 16, $bodyTop + 22, 4, $fh))

  $flash.Dispose(); $textBrush.Dispose(); $bandBrush.Dispose(); $bodyGrad.Dispose()
  $neckBrush.Dispose(); $capGrad.Dispose(); $fmt.Dispose()
}

# Genera placeholder por SKU
function New-Placeholder([string]$outFile, [string]$label) {
  $w = 360; $h = 470
  $bmp = [System.Drawing.Bitmap]::new($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  Draw-Bottle $g ([System.Drawing.Rectangle]::new(60, 20, 240, 420)) $label
  $g.Dispose()
  $bmp.Save($outFile, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  Write-Host ("OK " + $outFile)
}

# Completa un tile crema con la botella real
function New-Tile([System.Drawing.Graphics]$g, [System.Drawing.Rectangle]$tile, [string]$src, [string]$phLabel) {
  $bg = [System.Drawing.SolidBrush]::new($CREAM)
  $g.FillPath($bg, (New-Rounded $tile 12))
  $border = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(60, $GOLD_DARK), 1)
  $g.DrawPath($border, (New-Rounded $tile 12))
  $inner = [System.Drawing.Rectangle]::new($tile.X + 6, $tile.Y + 6, $tile.Width - 12, $tile.Height - 12)
  if ($src -and (Test-Path -LiteralPath $src)) {
    $img = [System.Drawing.Image]::FromFile($src)
    $scale = [Math]::Min($inner.Width / $img.Width, $inner.Height / $img.Height)
    $dw = [int]($img.Width * $scale); $dh = [int]($img.Height * $scale)
    $dx = $tile.X + [int](($tile.Width - $dw) / 2); $dy = $tile.Y + [int](($tile.Height - $dh) / 2)
    $g.DrawImage($img, $dx, $dy, $dw, $dh)
    $img.Dispose()
  } else {
    Draw-Bottle $g $inner $phLabel
  }
  $bg.Dispose(); $border.Dispose()
}

# Collage de un pack
function New-ComboPack([string]$outFile, [int[]]$members, [string]$comboLabel, [string]$priceText) {
  $cols = 5
  $rows = [Math]::Ceiling($members.Count / $cols)
  $tileW = 118; $tileH = 140; $gap = 16
  $gridW = $cols * $tileW + ($cols - 1) * $gap
  $W = 800
  $gridX = [int](($W - $gridW) / 2)
  $head = 172
  $gridTop = $head + 4
  $H = $gridTop + $rows * ($tileH + $gap) + 110

  $bmp = [System.Drawing.Bitmap]::new($W, $H, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

  $clip = New-Rounded ([System.Drawing.Rectangle]::new(0, 0, $W, $H)) 26
  $g.SetClip($clip)

  $bgR = [System.Drawing.Rectangle]::new(0, 0, $W, $H)
  $bgGrad = [System.Drawing.Drawing2D.LinearGradientBrush]::new($bgR, $INK, [System.Drawing.Color]::FromArgb(255, 47, 40, 30), 90)
  $g.FillRectangle($bgGrad, $bgR)

  $fmtC = [System.Drawing.StringFormat]::new()
  $fmtC.Alignment = [System.Drawing.StringAlignment]::Center
  $fmtC.LineAlignment = [System.Drawing.StringAlignment]::Center
  $goldBrush = [System.Drawing.SolidBrush]::new($GOLD_LIGHT)
  $creamBrush = [System.Drawing.SolidBrush]::new($CREAM_TEXT)
  $smallF = [System.Drawing.Font]::new("Arial", 13, [System.Drawing.FontStyle]::Bold)
  $subF = [System.Drawing.Font]::new("Arial", 12, [System.Drawing.FontStyle]::Regular)
  $titleF = [System.Drawing.Font]::new("Georgia", 34, [System.Drawing.FontStyle]::Bold)
  $priceF = [System.Drawing.Font]::new("Georgia", 30, [System.Drawing.FontStyle]::Bold)

  $g.DrawString("ELEGANCE", $smallF, $goldBrush, ([System.Drawing.RectangleF]::new(0, 24, $W, 20)), $fmtC)
  $g.DrawString($comboLabel, $titleF, $creamBrush, ([System.Drawing.RectangleF]::new(0, 52, $W, 52)), $fmtC)
  $g.DrawString("PACK MAYORISTA - PRECIO CERRADO", $subF, $goldBrush, ([System.Drawing.RectangleF]::new(0, 102, $W, 20)), $fmtC)
  $div = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(140, $GOLD), 1.5)
  $g.DrawLine($div, [int](($W - 240) / 2), 140, [int](($W + 240) / 2), 140)

  for ($r = 0; $r -lt $rows; $r++) {
    for ($c = 0; $c -lt $cols; $c++) {
      $idx = $r * $cols + $c
      if ($idx -ge $members.Count) { break }
      $tx = $gridX + $c * ($tileW + $gap)
      $ty = $gridTop + $r * ($tileH + $gap)
      $src = Join-Path $PSScriptRoot ("..\img\products\" + $members[$idx] + ".png")
      New-Tile $g ([System.Drawing.Rectangle]::new($tx, $ty, $tileW, $tileH)) $src "AB"
    }
  }

  $bottomY = $gridTop + $rows * ($tileH + $gap) - $gap + 26
  $g.DrawLine($div, [int](($W - 240) / 2), $bottomY, [int](($W + 240) / 2), $bottomY)
  $g.DrawString($priceText, $priceF, $creamBrush, ([System.Drawing.RectangleF]::new(0, $bottomY + 16, $W, 44)), $fmtC)
  $g.DrawString(($members.Count.ToString() + " perfumes"), $subF, $goldBrush, ([System.Drawing.RectangleF]::new(0, $bottomY + 64, $W, 20)), $fmtC)

  $g.Dispose()
  $bmp.Save($outFile, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  Write-Host ("OK " + $outFile)
}

$productsDir = Join-Path $PSScriptRoot "..\img\products"

New-Placeholder (Join-Path $productsDir "760111.png") "AB"
New-Placeholder (Join-Path $productsDir "760112.png") "AS"
New-Placeholder (Join-Path $productsDir "760113.png") "AA"
New-Placeholder (Join-Path $productsDir "760114.png") "YE"

New-ComboPack (Join-Path $productsDir "combo5.png") (887875, 26243, 26300, 21394, 68339) "COMBO PACK 5" '$ 165.000'
New-ComboPack (Join-Path $productsDir "combo10.png") (887875, 21394, 26300, 760111, 760112, 103239, 760113, 2057, 26243, 760114) "COMBO PACK 10" '$ 300.000'

Write-Host "Listo."