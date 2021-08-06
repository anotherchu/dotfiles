vim.g.mapleader = ","
local cmd = vim.cmd
local fn = vim.fn
local g = vim.g
local opt = vim.opt

local function map(mode,lhs,rhs,opts)
  local options = {noremap = true}
  if opts then options = vim.tbl_extend('force',options,opts) end
  vim.api.nvim_set_keymap(mode, lhs, rhs, options)
end

cmd 'packadd paq-nvim'
local paq = require('paq-nvim').paq

paq{'ntk148v/vim-horizon'}
paq{'ervandew/supertab'}
paq{'nvim-lua/popup.nvim'}
paq{'nvim-lua/plenary.nvim'}
paq{'nvim-telescope/telescope.nvim'}
paq{'hrsh7th/vim-vsnip'}
paq{'hrsh7th/vim-vsnip-integ'}
paq{'rafamadriz/friendly-snippets'}
paq{'tpope/vim-surround'}
paq{'hoob3rt/lualine.nvim'}
paq{'windwp/nvim-autopairs'}
paq{'junegunn/fzf'}
paq{'junegunn/fzf.vim'}
paq{'nvim-treesitter/nvim-treesitter', run = ':TSUpdate'}

--LSP Plugins and Autocompletion
paq{'neovim/nvim-lspconfig'}
paq{'ojroques/nvim-lspfuzzy'}
paq{'hrsh7th/nvim-compe'}
paq{'glepnir/lspsaga.nvim'}
paq{'kyazdani42/nvim-web-devicons'}
--  Java
-- !!! For Java LSP, nvim-jdtls requires eclipse.jdt.ls !!!
paq{'mfussenegger/nvim-jdtls'}

opt.termguicolors = true
opt.relativenumber = true

-- Keep changes on file when changing buffers and ask for confirmation when
-- closing modified files
opt.hidden = true
opt.confirm = true

-- Ignore case but smartcase when there's a capital letter on search term
opt.ignorecase = true
opt.smartcase = true

-- Tabs
opt.expandtab = true
opt.smarttab = true
opt.shiftwidth=4
opt.tabstop=4

--Statusline
require('lualine').setup{
    options = {
        icons_enabled = true,
        theme = 'horizon'
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
cmd 'set noshowmode'

-- colorscheme settings
cmd 'set termguicolors'
cmd 'colorscheme horizon'

-- Manage buffers
map('','<Leader>h',':bprevious<cr>')
map('','<Leader>l',':bnext<cr>')
map('','<Leader>bd',':bd<cr>gT')
map('','<Leader><cr>',':noh<cr>',{silent=true})
map('','<Leader>cd',':cd $:p:h<cr>:pwd<cr>')

-- Make 0 go to first non whitespace character
map('','0','^')

-- Remove Windows ^M
map('','<Leader>m','mmHmt:%s/<C-V><cr>//ge<cr>\'tzt\'m')


-- Return to last edit position
cmd 'au BufReadPost * if line("\'\\"") > 1 && line("\'\\"") <= line("$") | exe "normal! g\'\\"" | endif'

-- telescope.nvim
map('n','<C-f>','<cmd>Telescope find_files<cr>')
map('n','<Leader>o','<cmd>Telescope buffers<cr>')
map('n','<Leader>r','<cmd>Telescope live_grep<cr>')
map('n','<Leader>t','<cmd>Telescope help_tags<cr>')

--Treesitter
require 'nvim-treesitter.configs'.setup{
    hightlight = {
        enable = true,
        disable = {},
    },
    indent = {
        enable = false,
        disable = {},
    }
}


-- LSP
local lsp = require('lspconfig')
require('lspfuzzy').setup {}
--    Load servers
lsp.pyright.setup{}
lsp.tsserver.setup{}
cmd 'au FileType java lua require(\'jdtls\').start_or_attach({cmd = {\'launch_jdt.sh\'}})' 

require('lspsaga').init_lsp_saga{
    border_style = "round",
}
map('n','K',':Lspsaga hover_doc<cr>',{silent = true})
map('n','gh',':Lspsaga lsp_finder<cr>',{silent = true})
map('i','<C-k>', '<cmd>Lspsaga signature_help<cr>',{silent = true})

--Autocompletion
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
    border = { '', '' ,'', ' ', '', '', '', ' ' }, -- the border option is the same as `|help nvim_open_win|`
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
  };
}

map('i','<C-Space>','compe#complete()',{silent=true,expr=true})
map('i','<cr>','compe#confirm("<cr>")',{silent=true,expr=true})

--Autopairs
require('nvim-autopairs').setup{}


