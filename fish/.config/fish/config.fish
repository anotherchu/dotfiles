fish_vi_key_bindings

source $HOME/.config/fish/tokyonight.fish

abbr p "sudo pacman"
abbr y "yay"

source $HOME/work/.config/fish/abbr.fish
alias cat="bat"
alias ls="exa -l"
alias vim="nvim"

set fzf_preview_dir_cmd exa --all --color=always
set fzf_fd_opts -uu -i -L --exclude=.git
fzf_configure_bindings --directory=\cf --variables

set -U Z_CMD "j"
set -U ZO_METHOD "ranger"

set -U EDITOR nvim
set -U VISUAL nvim
