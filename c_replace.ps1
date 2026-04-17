$cssPath = "c:\tic_tech_toe\hack2skill\volunteersync\style.css"
$content = Get-Content $cssPath -Raw

# Replace var(--violet) with var(--primary)
$content = $content -replace "var\(--violet\)", "var(--primary)"
$content = $content -replace "var\(--violet2\)", "var(--highlight)"

# Replace rgba hex equivalents
$content = $content -replace "rgba\(157, 124, 255", "rgba(16, 185, 129"
$content = $content -replace "rgba\(157,124,255", "rgba(16,185,129"

# Replace magic buttons gradients 
$content = $content -replace "#7c3aed, #4f46e5", "#059669, #0d9488"
$content = $content -replace "#9333ea, #3b82f6", "#10b981, #14b8a6"
$content = $content -replace "rgba\(124,58,237", "rgba(16, 185, 129"
$content = $content -replace "rgba\(124, 58, 237", "rgba(16, 185, 129"

# Replace top-orb
$content = $content -replace "#7c3aed, #3b82f6", "#059669, #0d9488"

# Replace User Avatar
$content = $content -replace "#f59e0b, #ef4444", "#059669, #f59e0b"

# Write back
$content | Set-Content $cssPath
