# Lines configured by zsh-newuser-install
HISTFILE=~/.histfile
HISTSIZE=1000
SAVEHIST=1000
setopt autocd extendedglob nomatch notify
unsetopt beep
bindkey -v
# End of lines configured by zsh-newuser-install
# The following lines were added by compinstall
zstyle :compinstall filename '/home/tchu/.zshrc'

autoload -Uz compinit
compinit
# End of lines added by compinstall
#
eval "$(zoxide init zsh)"
eval "$(starship init zsh)"
source <(fzf --zsh)
alias j="z"
alias ls="ls -lha --color=auto"
export GPG_TTY=$(tty)
