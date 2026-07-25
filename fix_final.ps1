
$old = Get-Content "C:\Users\Administrator\Documents\DATABASE PROJECT\Gaming Tournament Management System\old_block.txt" -Raw
$new = Get-Content "C:\Users\Administrator\Documents\DATABASE PROJECT\Gaming Tournament Management System\correct_block.txt" -Raw
$path = "C:\Users\Administrator\Documents\DATABASE PROJECT\Gaming Tournament Management System\src\app\App.tsx"
$content = Get-Content $path -Raw
$content = $content.Replace($old, $new)
Set-Content -Path $path -Value $content -Encoding utf8

