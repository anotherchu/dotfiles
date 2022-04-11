Import-Module PSReadLine

oh-my-posh --init --shell pwsh --config ~\AppData\Local\Programs\oh-my-posh\themes\chu.omp.json | Invoke-Expression

$ChocolateyProfile = "$env:ChocolateyInstall\helpers\chocolateyProfile.psm1"
if (Test-Path($ChocolateyProfile)) {
    Import-Module "$ChocolateyProfile"
}

Set-Alias -Name n -Value nvim
Set-Alias -Name j -Value z

if ($host.Name -eq 'ConsoleHost'){
    function ls_git { & 'C:\Program Files\Git\usr\bin\ls' --color=auto -hF $args}
    Set-Alias -Name ls -Value ls_git -Option Private
}

function .. {
    cd ..
}

Set-PSReadLineOption -PredictionSource History
Set-PsFzfOption -PSReadlineChordProvider 'Ctrl+f' -PSReadlineChordReverseHistory 'Ctrl+r'

echo "Great, the digital pimp at work."
