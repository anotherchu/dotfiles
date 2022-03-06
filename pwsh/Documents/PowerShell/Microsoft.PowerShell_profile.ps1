Import-Module Terminal-Icons
Import-Module PSReadLine

oh-my-posh --init --shell pwsh --config ~\AppData\Local\Programs\oh-my-posh\themes\huvix.omp.json | Invoke-Expression

$ChocolateyProfile = "$env:ChocolateyInstall\helpers\chocolateyProfile.psm1"
if (Test-Path($ChocolateyProfile)) {
    Import-Module "$ChocolateyProfile"
}

Set-Alias -Name n -Value nvim
Set-Alias -Name z -Value j

Set-PSReadLineOption -PredictionSource History
Set-PsFzfOption -PSReadlineChordProvider 'Ctrl+f' -PSReadlineChordReverseHistory 'Ctrl+r'

