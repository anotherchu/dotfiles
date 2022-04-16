# my dotfiles

## Usage

Clone this repository under your home directory. Usually I clone into `~/.dotfiles`:

`$ git clone https://github.com/thiag0mei/dotfiles ~/.dotfiles`

Ensure conflicting files don't already exist by deleting them:

`$ rm ~/.config/fish/config.fish`

Using `stow`, symlink the files to the appropriate .config subdirectory. This is done by simply running:

`$ cd ~/.dotfiles && stow nvim/`

