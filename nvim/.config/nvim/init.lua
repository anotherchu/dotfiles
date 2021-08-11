vim.api.nvim_exec([[
if &shell =~# 'fish$'
    set shell=sh
endif
]],true)

vim.g.mapleader = ","
local cmd = vim.cmd
local nexec = vim.api.nvim_exec
local fn = vim.fn
local g = vim.g
local opt = vim.opt
local home_dir = os.getenv('HOME')

local function map(mode,lhs,rhs,opts)
  local options = {noremap = true}
  if opts then options = vim.tbl_extend('force',options,opts) end
  vim.api.nvim_set_keymap(mode, lhs, rhs, options)
end

cmd 'packadd paq-nvim'
local paq = require('paq-nvim')
paq{
    'savq/paq-nvim';
    'ervandew/supertab';
    'nvim-lua/popup.nvim';
    'nvim-lua/plenary.nvim';
    'nvim-telescope/telescope.nvim';
    {'nvim-telescope/telescope-fzf-native.nvim', run = 'make'};
    'hrsh7th/vim-vsnip';
    'hrsh7th/vim-vsnip-integ';
    'rafamadriz/friendly-snippets';
    'tpope/vim-surround';
    'hoob3rt/lualine.nvim';
    'windwp/nvim-autopairs';
    'junegunn/fzf';
    'junegunn/fzf.vim';
    {'nvim-treesitter/nvim-treesitter', run = ':TSUpdate'};
    'iamcco/markdown-preview.nvim';
    {'mg979/vim-visual-multi', branch = 'master'};
    'terrortylor/nvim-comment';
    'mhartington/formatter.nvim';
    'khaveesh/vim-fish-syntax';
    'folke/tokyonight.nvim';
    'folke/which-key.nvim';

    -- LSP Plugins and Autocompletion
    'neovim/nvim-lspconfig';
    'ojroques/nvim-lspfuzzy';
    'hrsh7th/nvim-compe';
    'glepnir/lspsaga.nvim';
    'kyazdani42/nvim-web-devicons';
    'mfussenegger/nvim-jdtls';
}

-- colorscheme settings
opt.termguicolors = true
vim.g.tokyonight_style = "night"
cmd 'colorscheme tokyonight'

-- Cursor
cmd 'set guicursor='
opt.cursorline = true

-- Line numbers
opt.number = true
opt.relativenumber = true

-- Keep changes on file when changing buffers and ask for confirmation when
-- closing modified files
opt.hidden = true
opt.confirm = true

opt.swapfile = false
opt.backup = false
opt.undodir = home_dir .. '/.vim/undodir'
opt.undofile = true


-- Ignore case but smartcase when there's a capital letter on search term
opt.ignorecase = true
opt.smartcase = true

-- Tabs
opt.expandtab = true
opt.smarttab = true
opt.softtabstop=4
opt.shiftwidth=4
opt.tabstop=4

-- Supertab
vim.g.SuperTabDefaultCompletionType = '<C-n>'

-- Scrolls when 8 columns away from edge
opt.scrolloff = 10

opt.wrap = false

opt.signcolumn = 'yes'

-- Statusline
opt.cmdheight = 2

require('lualine').setup{
    options = {
        icons_enabled = true,
        theme = 'tokyonight'
    },
    sections = {
        lualine_a = {'mode'},
        lualine_b = {'branch'},
        lualine_c = {'filename'},
        lualine_x = {'encoding', 'fileformat', 'filetype'},
        lualine_y = {'progress'},
        lualine_z = {'location'}
    },
    inactive_sections = {
        lualine_a = {},
        lualine_b = {},
        lualine_c = {'filename'},
        lualine_x = {'location'},
        lualine_y = {},
        lualine_z = {}
    },
    tabline = {},
    extensions = {}
}
opt.showmode = false




-- Manage buffers
map('','<Leader>h',':bprevious<cr>')
map('','<Leader>l',':bnext<cr>')
map('','<Leader>bd',':bd<cr>gT')


-- Misc bindings
-- map('','0','^') -- Make 0 go to first non whitespace character
map('','<Leader>m','mmHmt:%s/<C-V><cr>//ge<cr>\'tzt\'m') -- Remove Windows' ^M from buffer
map('','<Leader><cr>',':noh<cr>',{silent=true}) -- Remove hightlights
map('','<Leader>cd',':cd %:p:h<cr>:pwd<cr>') -- Change pwd to current buffer path

-- Move lines up or down
map('n','<C-j>',':m .+1<cr>==')
map('n','<C-k>',':m .-2<cr>==')
map('i','<C-j>','<Esc>:m .+1<cr>==gi')
map('i','<C-k>','<Esc>:m .-2<cr>==gi')


-- telescope.nvim

map('n','<C-f>',':Telescope find_files find_command=rg,--ignore,--hidden,--files<cr>')
map('n','<Leader>o','<cmd>Telescope buffers<cr>')
map('n','<Leader>r','<cmd>Telescope live_grep<cr>')
map('n','<Leader>t','<cmd>Telescope help_tags<cr>')

require('telescope').setup{
    extensions = {
        fzf = {
            fuzzy = true,
            override_generic_sorter = false,
            override_file_server = true,
            case_mode = 'smart_case'
        }
    },
    defaults = {
        file_ignore_patterns = {"node/no.*", ".git/"}
    }
}
require('telescope').load_extension('fzf')

-- Treesitter
require 'nvim-treesitter.configs'.setup{
    hightlight = {
        enable = true,
        disable = {},
    },
    indent = {
        enable = false,
        disable = {},
    },
    ensure_installed = "all",

}

-- LSP
local lsp_ = require('lspconfig')

local ansiblels_path = '/home/thiago/.lsp/ansible-language-server/out/server/src/'
require('lspfuzzy').setup {}
lsp_.pyright.setup{}
lsp_.tsserver.setup{}
lsp_.ansiblels.setup{
    cmd = {'node',ansiblels_path..'server.js', '--stdio'}
}

nexec([[
    augroup jdtls_lsp
        au!
        au FileType java lua require('jdtls_setup').setup()
    augroup END
]],true)
require('luals_setup').setup()

map('n', 'gD', '<cmd>lua vim.lsp.buf.declaration()<cr>',{silent = true})
map('n', 'gd', '<cmd>lua vim.lsp.buf.definition()<cr>', {silent = true})

vim.lsp.handlers["textDocument/publishDiagnositcs"] =
    vim.lsp.with( vim.lsp.diagnostic.on_publish_diagnostics,{
        virtual_text = false,
        signs = true,
        update_in_insert = false
    }
    )
vim.fn.sign_define('LspDiagnosticsSignError', {texthl = "LspDiagnosticsDefaultError"})
vim.fn.sign_define('LspDiagnosticsSignWarning', {texthl = "LspDiagnosticsDefaultWarning"})
vim.fn.sign_define('LspDiagnosticsSignInformation', {texthl = "LspDiagnosticsDefaultInformation"})
vim.fn.sign_define('LspDiagnosticsSignHint', {texthl = "LspDiagnosticsDefaultHint"})

require('lspsaga').init_lsp_saga{
    border_style = "round",
    use_saga_diagnostic_sign = true,
    error_sign = 'E',
    warn_sign = '--',
    hint_sign = 'H',
    infor_sign = 'I',
    dianostic_header_icon = '> ',
    finder_action_keys = {
        quit = '<Esc>',
    },
    code_action_keys = {
        quit = '<Esc>',
    }

}

map('n','\\ca', '<cmd>lua require("lspsaga.codeaction").code_action()<cr>',{silent = true})
map('n','K',':Lspsaga hover_doc<cr>',{silent = true})
map('n','gh',':Lspsaga lsp_finder<cr>',{silent = true})
map('i','<C-a>', '<cmd>Lspsaga signature_help<cr>',{silent = true})
map('n', '\\r' ,'<cmd>Lspsaga rename<cr>')
map('n', '\\j' ,'<cmd>Lspsaga diagnostic_jump_next<cr>')
map('n', '\\k' ,'<cmd>Lspsaga diagnostic_jump_prev<cr>')
map('n', '\\sd','<cmd>lua require"lspsaga.diagnostic".show_line_diagnostics()<cr>')

-- Autocompletion
opt.completeopt = "menuone,noselect"
require('compe').setup {
    enabled = true;
    autocomplete = true;
    debug = false;
    min_length = 1;
    preselect = 'enable';
    throttle_time = 80;
    source_timeout = 200;
    resolve_timeout = 800;
    incomplete_delay = 400;
    max_abbr_width = 100;
    max_kind_width = 100;
    max_menu_width = 100;
    documentation = {
        border = { "╭", "─", "╮", "│", "╯", "─", "╰", "│" },
        winhighlight = "NormalFloat:CompeDocumentation,FloatBorder:CompeDocumentationBorder",
        max_width = 120,
        min_width = 60,
        max_height = math.floor(vim.o.lines * 0.3),
        min_height = 1,
    };

    source = {
        path = true;
        buffer = true;
        calc = true;
        nvim_lsp = true;
        nvim_lua = true;
        vsnip = true;
        ultisnips = true;
        luasnip = true;
        treesitter = true;
    };
}

map('i','<C-Space>','compe#complete()',{silent=true,expr=true})
map('i','<cr>','compe#confirm(luaeval("require \'nvim-autopairs\'.autopairs_cr()"))',{silent=true,expr=true})
map('i','<C-e','compe#close("<C-e")',{silenttrue,expr=true})

-- Autopairs
require('nvim-autopairs').setup{}

-- nvim-comment
require('nvim_comment').setup{}

-- formatter
require('formatter').setup{
    filetype = {
        html = {
            function()
                return{
                    exe = "prettier",
                    args = {"--stdin-filepath", vim.api.nvim_buf_get_name(0)},
                    stdin = true
                }
            end
        },
        java = {
            function()
                local args = {}
                return{
                    exe = "java",
                    args = {'--add-exports', 'jdk.compiler/com.sun.tools.javac.api=ALL-UNNAMED', '--add-exports', 'jdk.compiler/com.sun.tools.javac.file=ALL-UNNAMED', '--add-exports', 'jdk.compiler/com.sun.tools.javac.parser=ALL-UNNAMED', '--add-exports', 'jdk.compiler/com.sun.tools.javac.tree=ALL-UNNAMED', '--add-exports', 'jdk.compiler/com.sun.tools.javac.util=ALL-UNNAMED', '-jar', home_dir .. '/.local/jars/google-java-format-1.10.0-all-deps.jar', vim.api.nvim_buf_get_name(0)},
                    stdin = true

                }
            end
        }
    }
}

require('which-key').setup{}

map('n','<Leader>f',':Format<CR>',{silent = true})
nexec([[
    augroup FormatAutogroup
        au!
        au BufWritePost *.html FormatWrite
        au BufWritePost *.java FormatWrite
    augroup END
]],true)

-- vim-visual-multi
cmd 'let g:VM_show_warnings = 0'
cmd 'let g:VM_maps = {}'
cmd 'let g:VM_maps["Find Under"] = "<C-s>"'
cmd 'let g:VM_maps["Find Subword Under"] = "<C-s>"'
-- Fast edit and reload of this config file
map('','<leader>e',':e! ' .. home_dir .. '/.dotfiles/nvim/.config/nvim/init.lua<cr>')
cmd 'au! BufWritePost $HOME/.dotfiles/nvim/.config/nvim/init.lua source %'

cmd 'au BufWritePre * :%s/\\s\\+$//e' -- Autoremove trailing whitespaces

-- Return to last edit position
cmd 'au BufReadPost * if line("\'\\"") > 1 && line("\'\\"") <= line("$") | exe "normal! g\'\\"" | endif'

-- Per filetype indent size
cmd 'au FileType html setlocal sw=2 ts=2 sts=2'
cmd 'au FileType java setlocal sw=2 ts=2 sts=2'
cmd 'au FileType typescript setlocal sw=2 ts=2 sts=2'
