local cmd = vim.cmd
local nexec = vim.api.nvim_exec
local g = vim.g
local opt = vim.opt
local home_dir = os.getenv("HOME")

nexec(
	[[
if &shell =~# 'fish$'
    set shell=bash
endif
]],
	true
)

g.mapleader = "," -- test

local function map(mode, lhs, rhs, opts)
	local options = { noremap = true }
	if opts then
		options = vim.tbl_extend("force", options, opts)
	end
	vim.api.nvim_set_keymap(mode, lhs, rhs, options)
end

local paq = require("paq")
paq({
	{ "catppuccin/nvim", name = "catppuccin" },
	"savq/paq-nvim",
	"ervandew/supertab",
	"nvim-lua/popup.nvim",
	"nvim-lua/plenary.nvim",
	"nvim-telescope/telescope.nvim",
	{ "nvim-telescope/telescope-fzf-native.nvim", run = "make" },
	"tpope/vim-surround",
	"hoob3rt/lualine.nvim",
	"windwp/nvim-autopairs",
	"numToStr/Comment.nvim",
	"junegunn/fzf",
	"junegunn/fzf.vim",
	{ "nvim-treesitter/nvim-treesitter", run = ":TSUpdate" },
	"iamcco/markdown-preview.nvim",
	{ "mg979/vim-visual-multi", branch = "master" },
	"khaveesh/vim-fish-syntax",
	"folke/which-key.nvim",
	"xiyaowong/nvim-transparent",
	"lambdalisue/suda.vim",
	"voldikss/vim-floaterm",
	"norcalli/nvim-colorizer.lua",

	-- LSP Plugins and Autocompletion
	"williamboman/nvim-lsp-installer",
	"jose-elias-alvarez/null-ls.nvim",
	"neovim/nvim-lspconfig",
	"ojroques/nvim-lspfuzzy",
	"rafamadriz/friendly-snippets",
	"hrsh7th/nvim-cmp",
	"hrsh7th/cmp-nvim-lsp",
	"hrsh7th/cmp-buffer",
	"hrsh7th/cmp-path",
	"hrsh7th/cmp-cmdline",
	"hrsh7th/cmp-vsnip",
	"hrsh7th/vim-vsnip",
	"tami5/lspsaga.nvim",
	"kyazdani42/nvim-web-devicons",
	"akinsho/bufferline.nvim",
})

-- Enable mouse
opt.mouse = "a"

-- colorscheme settings
opt.termguicolors = true
require("catppuccin").setup({
	transparent_background = true,
	styles = {
		comments = "italic",
	},
})
cmd("colorscheme catppuccin")

-- Cursor
cmd("set guicursor=")
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
opt.undodir = home_dir .. "/.vim/undodir"
opt.undofile = true

-- Ignore case but smartcase when there's a capital letter on search term
opt.ignorecase = true
opt.smartcase = true

-- Tabs
opt.expandtab = true
opt.smarttab = true
opt.softtabstop = 4
opt.shiftwidth = 4
opt.tabstop = 4

-- Supertab
g.SuperTabDefaultCompletionType = "<C-n>"

-- Suda.vim
g.suda_smart_edit = 1

-- Scrolls when 8 columns away from edge
opt.scrolloff = 10

opt.wrap = false

opt.signcolumn = "yes"

-- Statusline
opt.cmdheight = 1

-- Spell checking
nexec(
	[[
        set spelllang=en,cjk,pt_br
        set spellsuggest=best,9
    ]],
	true
)
map("n", "<Leader>spell", ":set spell!<CR>", { silent = true })

require("lualine").setup({
	options = {
		icons_enabled = true,
	},
	sections = {
		lualine_a = { "mode" },
		lualine_b = { "branch" },
		lualine_c = { "filename" },
		lualine_x = { "encoding", "fileformat", "filetype" },
		lualine_y = { "progress" },
		lualine_z = { "location" },
	},
	inactive_sections = {
		lualine_a = {},
		lualine_b = {},
		lualine_c = { "filename" },
		lualine_x = { "location" },
		lualine_y = {},
		lualine_z = {},
	},
	tabline = {},
	extensions = {},
})
opt.showmode = false

-- Move lines up or down
map("n", "<C-j>", ":m .+1<cr>==", { silent = true })
map("n", "<C-k>", ":m .-2<cr>==", { silent = true })
map("i", "<C-j>", "<Esc>:m .+1<cr>==gi", { silent = true })
map("i", "<C-k>", "<Esc>:m .-2<cr>==gi", { silent = true })

--- Keep indenting selected on visual mode
map("v", "<", "<gv")
map("v", ">", ">gv")

-- Manage buffers
map("", "<Leader>h", ":bprevious<cr>")
map("", "<Leader>l", ":bnext<cr>")
map("", "<Leader>bd", ":bd<cr>gT")

-- Misc bindings
-- map('','0','^') -- Make 0 go to first non whitespace character
map("", "<Leader>m", "mmHmt:%s/<C-V><cr>//ge<cr>'tzt'm") -- Remove Windows' ^M from buffer
map("", "<Leader><cr>", ":noh<cr>", { silent = true }) -- Remove hightlights
map("", "<Leader>cd", ":cd %:p:h<cr>:pwd<cr>") -- Change pwd to current buffer path

-- telescope.nvim

map("n", "<C-f>", ":Telescope find_files find_command=rg,--ignore,--hidden,--files<cr>")
map("n", "<Leader>o", "<cmd>Telescope buffers<cr>")
map("n", "<Leader>r", "<cmd>Telescope live_grep<cr>")

require("telescope").setup({
	extensions = {
		fzf = {
			fuzzy = true,
			override_generic_sorter = false,
			override_file_server = true,
			case_mode = "smart_case",
		},
	},
	defaults = {
		file_ignore_patterns = { "node/no.*", ".git/" },
	},
})
require("telescope").load_extension("fzf")

-- Treesitter
require("nvim-treesitter.configs").setup({
	hightlight = {
		enable = true,
		disable = {},
	},
	indent = {
		enable = false,
		disable = {},
	},
	ensure_installed = "all",
})

-- LSP

local capabilities = require("cmp_nvim_lsp").update_capabilities(vim.lsp.protocol.make_client_capabilities())
require("lspfuzzy").setup({})

require("nvim-lsp-installer").on_server_ready(function(server)
	local opts = { capabilities = capabilities }
	if server.name == "sumneko_lua" then
		opts = {
			settings = {
				Lua = {
					diagnostics = { globals = { "vim" } },
					runtime = { version = "Lua 5.1" },
				},
			},
		}
	end
	server:setup(opts)
end)

map("n", "gD", "<cmd>lua vim.lsp.buf.declaration()<cr>", { silent = true })
map("n", "gd", "<cmd>lua vim.lsp.buf.definition()<cr>", { silent = true })

require("lspsaga").init_lsp_saga({
	border_style = "round",
	use_saga_diagnostic_sign = true,
	error_sign = "E",
	warn_sign = "--",
	hint_sign = "H",
	infor_sign = "I",
	diagnostic_header_icon = "> ",
	finder_action_keys = {
		quit = "<Esc>",
	},
	code_action_keys = {
		quit = "<Esc>",
	},
})

map("n", "<Leader>sc", '<cmd>lua require("lspsaga.codeaction").code_action()<cr>', { silent = true })
map("n", "<Leader>sh", ":Lspsaga hover_doc<cr>", { silent = true })
map("n", "<Leader>sf", ":Lspsaga lsp_finder<cr>", { silent = true })
map("i", "<leader>ss", "<cmd>Lspsaga signature_help<cr>", { silent = true })
map("n", "<Leader>sr", "<cmd>Lspsaga rename<cr>")
map("n", "<Leader>sdj", "<cmd>Lspsaga diagnostic_jump_next<cr>")
map("n", "<Leader>sdk", "<cmd>Lspsaga diagnostic_jump_prev<cr>")
map("n", "<Leader>sld", '<cmd>lua require"lspsaga.diagnostic".show_line_diagnostics()<cr>')

-- Autocompletion
opt.completeopt = "menu,menuone,noselect"
local cmp = require("cmp")
local has_words_before = function()
	local line, col = unpack(vim.api.nvim_win_get_cursor(0))
	return col ~= 0 and vim.api.nvim_buf_get_lines(0, line - 1, line, true)[1]:sub(col, col):match("%s") == nil
end

local feedkey = function(key, mode)
	vim.api.nvim_feedkeys(vim.api.nvim_replace_termcodes(key, true, true, true), mode, true)
end

cmp.setup({
	snippet = {
		expand = function(args)
			vim.fn["vsnip#anonymous"](args.body)
		end,
	},
	mapping = {
		["<C-b>"] = cmp.mapping(cmp.mapping.scroll_docs(-4), { "i", "c" }),
		["<C-f>"] = cmp.mapping(cmp.mapping.scroll_docs(4), { "i", "c" }),
		["<C-Space>"] = cmp.mapping(cmp.mapping.complete(), { "i", "c" }),
		["<C-e>"] = cmp.mapping({ i = cmp.mapping.abort(), c = cmp.mapping.close() }),
		["<CR>"] = cmp.mapping.confirm({ select = false }),
		["<Tab>"] = cmp.mapping(function(fallback)
			if cmp.visible() then
				cmp.select_next_item()
			elseif vim.fn["vsnip#available"](1) == 1 then
				feedkey("<Plug>(vsnip-expand-or-jump)", "")
			elseif has_words_before() then
				cmp.complete()
			else
				fallback()
			end
		end, { "i", "s" }),
		["<S-Tab>"] = cmp.mapping(function()
			if cmp.visible() then
				cmp.select_prev_item()
			elseif vim.fn["vsnip#jumpable"](-1) == 1 then
				feedkey("<Plug>(vsnip-jump-prev)", "")
			end
		end, { "i", "s" }),
	},
	sources = cmp.config.sources({
		{ name = "nvim_lsp" },
		{ name = "vsnip" },
		{ name = "path" },
		{ name = "buffer" },
		{ name = "calc" },
		{ name = "treesitter" },
	}),
	autocomplete = true,
	documentation = {
		border = { "╭", "─", "╮", "│", "╯", "─", "╰", "│" },
		winhighlight = "NormalFloat:NormalFloat,FloatBorder:NormalFloat",
		max_width = 120,
		min_width = 60,
		max_height = math.floor(vim.o.lines * 0.3),
		min_height = 1,
	},
	formatting = {
		format = function(entry, vim_item)
			vim_item.menu = ({
				nvim_lsp = "[LSP]",
				buffer = "[BUF]",
				vsnip = "[SNIP]",
			})[entry.source.name]
			return vim_item
		end,
	},
})

cmp.setup.cmdline("/", { sources = { { name = "buffer" } } })
cmp.setup.cmdline(":", { sources = cmp.config.sources({ { name = "path" } }, { { name = "cmdline" } }) })

cmp.event:on("confirm_done", require("nvim-autopairs.completion.cmp").on_confirm_done({ map_char = { tex = "" } }))

-- Autopairs
require("nvim-autopairs").setup({})

-- Comment.nvim
require("Comment").setup({})

-- Floaterm.nvim
g.floaterm_keymap_toggle = "<Leader>ft"
if vim.loop.os_uname().sysname == "Windows_NT" then
	g.floaterm_shell = "powershell"
else
	g.floaterm_shell = "fish"
end

map("t", "<Esc>", "<C-\\><C-n>")

-- formatter
local null_ls = require("null-ls")
null_ls.setup({
	sources = {
		null_ls.builtins.formatting.stylua,
		null_ls.builtins.formatting.prettierd,
		null_ls.builtins.formatting.google_java_format,
		null_ls.builtins.formatting.black,
	},
	on_attach = function(client)
		if client.resolved_capabilities.document_formatting then
			cmd("au BufWritePre <buffer> lua vim.lsp.buf.formatting_sync()")
		end
	end,
})

map("n", "<Leader>f", ":lua vim.lsp.buf.formatting()<CR>", { silent = true })
require("which-key").setup({})

require("bufferline").setup({})

require("transparent").setup({
	enable = true,
	extra_groups = {
		"BufferLineTabClose",
		"BufferlineBufferSelected",
		"BufferLineFill",
		"BufferLineBackground",
		"BufferLineSeparator",
		"BufferLineIndicatorSelected",
	},
})

require("aiksaurus")
map("n", "<Leader>thes", "ea<C-x><C-t>", { silent = true })

require("colorizer").setup()

-- vim-visual-multi
cmd("let g:VM_show_warnings = 0")
cmd("let g:VM_maps = {}")
cmd('let g:VM_maps["Find Under"] = "<C-s>"')
cmd('let g:VM_maps["Find Subword Under"] = "<C-s>"')
-- Fast edit and reload of this config file
map("", "<leader>e", ":e! " .. home_dir .. "/.dotfiles/nvim/.config/nvim/init.lua<cr>")
cmd("au! BufWritePost $HOME/.dotfiles/nvim/.config/nvim/init.lua source %")

cmd("au BufWritePre * :%s/\\s\\+$//e") -- Autoremove trailing whitespaces

-- Return to last edit position
cmd('au BufReadPost * if line("\'\\"") > 1 && line("\'\\"") <= line("$") | exe "normal! g\'\\"" | endif')

-- Per filetype indent size
cmd("au FileType html setlocal sw=2 ts=2 sts=2")
cmd("au FileType java setlocal sw=2 ts=2 sts=2")
cmd("au FileType typescript setlocal sw=2 ts=2 sts=2")
