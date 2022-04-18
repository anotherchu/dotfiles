# my dotfiles

## Usage

Clone this repository under your home directory. Usually I clone into `~/.dotfiles`:

```console
git clone https://github.com/thiag0mei/dotfiles ~/.dotfiles
```

Ensure any conflicting files don't already exist by deleting them, for example:

```console
rm ~/.config/fish/config.fish
```

Using `stow`, symlink the files to the appropriate .config subdirectory. This is done by simply running:

```console
cd ~/.dotfiles && stow nvim
```
