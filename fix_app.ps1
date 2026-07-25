\ = Get-Content "C:\Users\Administrator\Documents\DATABASE PROJECT\Gaming Tournament Management System\src\app\App.tsx" -Raw
\ = \ -replace '\\"', '"'
Set-Content -Path "C:\Users\Administrator\Documents\DATABASE PROJECT\Gaming Tournament Management System\src\app\App.tsx" -Value \ -Encoding utf8
