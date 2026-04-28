# Lines configured by zsh-newuser-install
HISTFILE=~/.histfile
HISTSIZE=1000
SAVEHIST=1000
setopt autocd extendedglob nomatch notify
unsetopt beep

bindkey '^[[1;5D' backward-word      # Ctrl+Left
bindkey '^[[1;5C' forward-word       # Ctrl+Right

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
alias n="nvim"
export GPG_TTY=$(tty)
export PATH="/Users/thiago/.bun/bin:$PATH"
export PATH="/Users/thiago/.cargo/bin:$PATH"
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"

if command -v tmux &> /dev/null && [ -z "$TMUX" ]; then
    tmux attach -t 0 || tmux new
fi

export PATH="$HOME/.local/bin:$PATH"
