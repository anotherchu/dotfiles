fish_vi_key_bindings

abbr n "nvim"
abbr p "sudo pacman"
abbr y "yay"
abbr dcu "docker compose up"
abbr dcd "docker compose down"
abbr ga "git add"
abbr gc "git commit -m"
abbr gp "git push"
abbr ssh "ssh -Y"


#source $HOME/work/.config/fish/abbr.fish
alias cat="bat"
alias ls="exa"

set fzf_preview_dir_cmd exa --all --color=always
set fzf_fd_opts -uu -i -L --exclude=.git/
fzf_configure_bindings --directory=\cf --variables

set -U Z_CMD "j"
set -U ZO_METHOD "ranger"

set -U EDITOR nvim
set -U VISUAL nvim

# pyenv configuration
status is-login; and pyenv init --path | source
status is-interactive; and pyenv init - | source
status is-interactive; and pyenv virtualenv-init - | source
# end pyenv configuration
