$htmlPath = "c:\tic_tech_toe\hack2skill\volunteersync\index.html"
$cssPath = "c:\tic_tech_toe\hack2skill\volunteersync\style.css"
$jsPath = "c:\tic_tech_toe\hack2skill\volunteersync\app.js"

$lines = Get-Content $htmlPath

# CSS: 10 .. 594 (0-indexed: 9..593)
$lines[9..593] | Set-Content $cssPath

# JS: 935 .. 1230 (0-indexed: 934..1229)
$lines[934..1229] | Set-Content $jsPath

# Reconstruct HTML
$newHtml = @()
$newHtml += $lines[0..7]
$newHtml += '<link rel="stylesheet" href="style.css" />'
$newHtml += $lines[596..932]
$newHtml += '<script src="app.js"></script>'
$newHtml += $lines[1231..1233]

$newHtml | Set-Content $htmlPath
