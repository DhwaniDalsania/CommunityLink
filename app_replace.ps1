$jsPath = "c:\tic_tech_toe\hack2skill\volunteersync\app.js"
$content = Get-Content $jsPath -Raw

# Replace nebula and purple map colors
$content = $content -replace "157, 124, 255", "16, 185, 129"
$content = $content -replace "#9d7cff", "#10b981"
$content = $content -replace "rgba\(220, 210, 255", "rgba(167, 243, 208"

$content | Set-Content $jsPath
