Import-Module PSReadLine

oh-my-posh --init --shell pwsh --config ~\AppData\Local\Programs\oh-my-posh\themes\chu.omp.json | Invoke-Expression

Set-Alias -Name n -Value nvim
Set-Alias -Name j -Value z

function .. {
    cd ..
}

Set-PSReadLineOption -PredictionSource History
Set-PsFzfOption -PSReadlineChordProvider 'Ctrl+f' -PSReadlineChordReverseHistory 'Ctrl+r'

echo "Great, the digital pimp at work."
