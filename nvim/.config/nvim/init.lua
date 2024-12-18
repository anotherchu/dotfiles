local fn = vim.fn
local command = vim.api.nvim_command
local g = vim.g
local opt = vim.opt
local home_dir = os.getenv("HOME")

g.mapleader = " "

local function MasonUpdate()
	local mason_path = fn.stdpath("data") .. "/lazy/mason.nvim"
	if not (fn.empty(fn.glob(mason_path)) > 0) then
		command("silent! MasonUpdate")
	end
end

local function VisualMultiInit()
	g.VM_show_warnings = 0
	g.VM_maps = vim.empty_dict()
	g.VM_maps = { ["Find Under"] = "<C-s>", ["Find Subword Under"] = "<C-s>" }
end

local function map(mode, lhs, rhs, opts)
	local options = { noremap = true }
	if opts then
		options = vim.tbl_extend("force", options, opts)
	end
	vim.keymap.set(mode, lhs, rhs, options)
end

-- Install plugins
local PKGS = {
	"nvim-lua/plenary.nvim",
	"nvim-telescope/telescope.nvim",
	{ "nvim-telescope/telescope-fzf-native.nvim", build = "make" },
	"tpope/vim-surround",
	"hoob3rt/lualine.nvim",
	"windwp/nvim-autopairs",
	"numToStr/Comment.nvim",
	"junegunn/fzf",
	"junegunn/fzf.vim",
	{ "nvim-treesitter/nvim-treesitter", build = ":TSUpdate" },
	{ "mg979/vim-visual-multi", branch = "master", init = VisualMultiInit() },
	"khaveesh/vim-fish-syntax",
	"folke/which-key.nvim",
	"xiyaowong/nvim-transparent",
	"lambdalisue/suda.vim",
	"akinsho/toggleterm.nvim",
	{ "rrethy/vim-hexokinase", build = "make hexokinase" },
	{ "williamboman/mason.nvim", build = MasonUpdate() },
	"williamboman/mason-lspconfig.nvim",
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
	"uga-rosa/cmp-dictionary",
	{ "glepnir/lspsaga.nvim", branch = "main" },
	"kyazdani42/nvim-web-devicons",
	{ "lukas-reineke/indent-blankline.nvim", main = "ibl", opts = {} },
	{ "catppuccin/nvim", name = "catppuccin" },
	"andweeb/presence.nvim",
	"robbles/logstash.vim",
	"folke/zen-mode.nvim",
	"junegunn/vim-easy-align",
	"lervag/vimtex",
	"stevearc/oil.nvim",
	"NeogitOrg/neogit",
}

local lazypath = vim.fn.stdpath("data") .. "/lazy/lazy.nvim"
if not vim.loop.fs_stat(lazypath) then
	fn.system({
		"git",
		"clone",
		"--filter=blob:none",
		"https://github.com/folke/lazy.nvim.git",
		"--branch=stable", -- latest stable release
		lazypath,
	})
end
opt.rtp:prepend(lazypath)

local opts = {}
require("lazy").setup(PKGS, opts)

-- Enable mouse
opt.mouse = "a"

-- colorscheme settings
require("catppuccin").setup({
	flavor = "macchiato",
	transparent_background = true,
	custom_highlights = function()
		return {
			Comment = { fg = "#d8c5e5" },
			["@comment"] = { fg = "#d8c5e5" },
		}
	end,
})
command("colorscheme catppuccin")

-- Cursor
command("set guicursor=")
opt.cursorline = true
opt.cursorlineopt = "number"

-- Line numbers
opt.number = true
opt.relativenumber = false

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

-- Suda.vim
g.suda_smart_edit = 1

vim.api.nvim_create_autocmd({ "User" }, {
	pattern = "visual_multi_start",
	callback = function()
		---@diagnostic disable-next-line: undefined-field
		require("lualine").hide()
	end,
})

vim.api.nvim_create_autocmd({ "User" }, {
	pattern = "visual_multi_exit",
	callback = function()
		---@diagnostic disable-next-line: undefined-field
		require("lualine").hide({ unhide = true })
	end,
})

-- Hexakinase
g.Hexokinase_optInPatterns = "full_hex,rgb,rgba, hsl, hsla"

-- Scrolls when 8 columns away from edge
opt.scrolloff = 10

opt.wrap = false

opt.signcolumn = "yes"

-- Statusline
opt.cmdheight = 1
opt.laststatus = 3

-- Spell checking
require("cmp_dictionary").setup({
	dic = {
		["markdown"] = { "/usr/share/dict/british-english" },
	},
})
opt.spelllang = { "en", "cjk", "pt_br" }
opt.spellsuggest = { "best", "9" }
map("n", "<Leader>spell", ":set spell!<CR>", { silent = true })

opt.showmode = false

-- Manage windows
map("", "<Leader>wmax", "<C-w>_")
map("", "<Leader>wequal", "<C-w>=")
map("", "<Leader>wmore", "10<C-w>+")
map("", "<Leader>wless", "10<C-w>-")
map("", "<A-Down>", "<C-w>j")
map("n", "<A-Up>", "<C-w>k")
map("n", "<C-h>", "<C-w>h")
map("n", "<C-l>", "<C-w>l")
map("n", "<C-c>", "<C-w>c")

-- Move lines up or down
map("n", "<C-j>", ":m .+1<CR>==", { silent = true })
map("n", "<C-k>", ":m .-2<CR>==", { silent = true })
map("i", "<C-j>", "<Esc>:m .+1<CR>==gi", { silent = true })
map("i", "<C-k>", "<Esc>:m .-2<CR>==gi", { silent = true })
map("v", "<C-j>", ":m '>+1<CR>gv=gv", { silent = true })
map("v", "<C-k>", ":m '<-2<CR>gv=gv", { silent = true })

--- Keep indenting selected on visual mode
map("v", "<", "<gv")
map("v", ">", ">gv")

-- Manage buffers
map("", "<Leader>h", ":bprevious<CR>")
map("", "<Leader>l", ":bnext<CR>")
map("", "<Leader>bd", ":bd<CR>gT")

-- Misc bindings
-- map('','0','^') -- Make 0 go to first non whitespace character
map("", "<Leader>m", "mmHmt:%s/<C-V><CR>//ge<CR>'tzt'm") -- Remove Windows' ^M from buffer
map("", "<Leader><CR>", ":noh<CR>", { silent = true }) -- Remove hightlights
map("", "<Leader>cd", ":cd %:p:h<CR>:pwd<CR>") -- Change pwd to current buffer path
map("v", "<C-C>", '"+y')
map("", "<C-V>", '"+p')

-- lualine.nvim
---@diagnostic disable-next-line: undefined-field
require("lualine").setup({
	options = {
		theme = "catppuccin",
	},
})

require("zen-mode").setup({
	window = {
		backdrop = 0.95,
		options = {
			signcolumn = "no",
			relativenumber = false,
			list = false,
		},
	},
})
-- telescope.nvim
map("n", "<C-f>", ":Telescope find_files find_command=rg,--ignore,--hidden,--files<CR>", { silent = true })
map("n", "<C-b>", ":Telescope buffers<CR>", { silent = true })
map("n", "<Leader>tr", "<cmd>Telescope resume<CR>", { silent = true })
map("n", "<Leader>r", "<cmd>Telescope live_grep<CR>", { silent = true })
map("n", "<Leader>d", "<cmd>Telescope diagnostics<CR>", { silent = true })
map("n", "gd", "<cmd>Telescope lsp_definitions<CR>", { silent = true })

-- vim-easy-align
map("x", "ga", "<Plug>(EasyAlign)")
map("n", "ga", "<Plug>(EasyAlign)")

require("telescope").setup({
	extensions = {
		fzf = {
			fuzzy = true,
			override_generic_sorter = true,
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

require("nvim-treesitter.configs").setup(
	---@diagnostic disable: missing-fields
	{
		hightlight = {
			enable = true,
			disable = {},
		},
		indent = {
			enable = false,
			disable = {},
		},
		ensure_installed = { "c", "lua", "vim", "vimdoc", "query", "markdown", "markdown_inline" },
		ignore_install = {},
		sync_install = false,

		auto_install = true,
	}
	---@diagnostic enable: missing-fields
)
-- LSP
local capabilities = require("cmp_nvim_lsp").default_capabilities(vim.lsp.protocol.make_client_capabilities())
require("lspfuzzy").setup({})

require("mason").setup({})
require("mason-lspconfig").setup({
	automatic_installation = true,
})

local lsp_util = require("lspconfig.util")

lsp_util.default_config = vim.tbl_extend("force", lsp_util.default_config, {
	capabilities = capabilities,
})

local lspconfig = require("lspconfig")

lspconfig.lua_ls.setup({
	settings = {
		Lua = {
			diagnostics = { globals = { "vim", "awesome" }, disable = { "lowercase-global" } },
			runtime = { version = "LuaJIT", path = vim.split(package.path, ";") },
			workspace = { library = vim.api.nvim_get_runtime_file("", true), checkThirdParty = false },
			telemetry = {
				enable = false,
			},
			format = {
				enable = false,
			},
		},
	},
})

lspconfig.pylsp.setup({
	settings = {
		pylsp = {
			plugins = {
				pycodestyle = {
					enabled = false,
				},
				mccabe = {
					enabled = false,
				},
				pyflakes = {
					enabled = false,
				},
				flake8 = {
					enabled = true,
					ignore = { "E501", "W503", "F841" },
				},
			},
		},
	},
})

lspconfig.pyright.setup({
	settings = {
		python = {
			analysis = {
				typeCheckingMode = "off",
			},
		},
	},
})

lspconfig.ts_ls.setup({})
lspconfig.rust_analyzer.setup({})
lspconfig.gopls.setup({})

require("lspsaga").setup({
	-- Error, Warn, Info, Hint
	diagnostic_header = { "E", "--", "H", "I" },
	ui = {
		border = "rounded",
	},
	finder = {
		keys = {
			quit = { "q", "<ESC>" },
		},
	},
	rename = {
		quit = "<ESC>",
	},
	lightbulb = {
		virtual_text = false,
	},
	hover = {
		open_browser = "!microsoft-edge-stable",
	},
	definition = {
		quit = "<ESC>",
	},
})

map("n", "ca", "<cmd>Lspsaga code_action<CR>", { silent = true })
map("n", "K", "<cmd>Lspsaga hover_doc<CR>", { silent = true })
map("n", "<Leader>sf", "<cmd>Lspsaga finder<CR>", { silent = true })
map("n", "<Leader>sp", "<cmd>Lspsaga peek_definition<CR>", { silent = true })
map("n", "<Leader>sr", "<cmd>Lspsaga rename<CR>")
map("n", "<Leader>so", "<cmd>Lspsaga outline<CR>")
map("n", "<Leader>sdd", "<cmd>Lspsaga show_workspace_diagnostics<CR>")
map("n", "<Leader>sdj", "<cmd>Lspsaga diagnostic_jump_next<CR>")
map("n", "<Leader>sdk", "<cmd>Lspsaga diagnostic_jump_prev<CR>")

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
			fn["vsnip#anonymous"](args.body)
		end,
	},
	mapping = cmp.mapping.preset.insert({
		["<C-b>"] = cmp.mapping.scroll_docs(-4),
		["<C-f>"] = cmp.mapping.scroll_docs(4),
		["<C-Space>"] = cmp.mapping.complete(),
		["<C-e>"] = cmp.mapping.abort(),
		["<CR>"] = cmp.mapping.confirm({ select = false }),
		["<Tab>"] = cmp.mapping(function(fallback)
			if cmp.visible() then
				cmp.select_next_item()
			elseif fn["vsnip#available"](1) == 1 then
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
			elseif fn["vsnip#jumpable"](-1) == 1 then
				feedkey("<Plug>(vsnip-jump-prev)", "")
			end
		end, { "i", "s" }),
	}),
	sources = cmp.config.sources({
		{ name = "nvim_lsp" },
		{ name = "vsnip" },
		{ name = "path" },
		{ name = "buffer" },
		{ name = "calc" },
		{ name = "treesitter" },
		{ name = "dictionary", keyword_length = 2 },
	}),
	window = {
		documentation = {
			border = { "╭", "─", "╮", "│", "╯", "─", "╰", "│" },
			winhighlight = "NormalFloat:NormalFloat,FloatBorder:NormalFloat",
			max_width = 120,
			min_width = 60,
			max_height = math.floor(vim.o.lines * 0.3),
			min_height = 1,
		},
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

cmp.setup.cmdline("/", { mapping = cmp.mapping.preset.cmdline(), sources = { { name = "buffer" } } })
cmp.setup.cmdline(":", {
	mapping = cmp.mapping.preset.cmdline(),
	sources = cmp.config.sources({ { name = "path" } }, { { name = "cmdline" } }),
})

cmp.event:on("confirm_done", require("nvim-autopairs.completion.cmp").on_confirm_done({ map_char = { tex = "" } }))

-- Autopairs
require("nvim-autopairs").setup({})

-- Comment.nvim
require("Comment").setup({})

-- Floaterm.nvim
local shell = vim.loop.os_uname().sysname == "Windows_NT" and "pwsh" or "zsh"
require("toggleterm").setup({
	shell = shell,
})
map("n", "<Leader>ft", ":ToggleTerm<CR>")
map("t", "<Esc>", "<C-\\><C-n>")

-- formatter
local null_ls = require("null-ls")
null_ls.setup({
	sources = {
		null_ls.builtins.formatting.stylua,
		null_ls.builtins.formatting.prettierd.with({
			filetypes = {
				"javascript",
				"javascriptreact",
				"typescript",
				"typescriptreact",
				"vue",
				"css",
				"scss",
				"less",
				"html",
				"json",
				"jsonc",
				"yaml",
				"graphql",
				"handlebars",
			},
		}),
		null_ls.builtins.formatting.google_java_format,
		null_ls.builtins.formatting.black,
	},
	on_attach = function(client)
		if client.server_capabilities.documentFormattingProvider then
			vim.api.nvim_create_autocmd("BufWritePre", {
				pattern = "<buffer>",
				callback = function()
					vim.lsp.buf.format()
				end,
				group = vim.api.nvim_create_augroup("format_on_save", { clear = true }),
			})
		end
	end,
})

-- vimtex
g.vimtex_view_general_options = "--unique file:@pdf\\#src:@line@tex"

map("n", "<Leader>format", ":lua vim.lsp.buf.format()<CR>", { silent = true })

require("which-key").setup({})

-- require("bufferline").setup({
--     options = {
--         show_buffer_close_icons = false,
--         show_close_icon = false,
--     },
-- })

require("ibl").setup({
	scope = {
		show_start = false,
		show_end = false,
	},
})

require("presence").setup({
	neovim_image_text = "can your vim do this?",
	main_image = "file",
	enable_line_number = true,
})

require("zen-mode").setup({
	window = {
		width = 0.8,
		options = {
			number = false,
			relativenumber = false,
		},
	},
	plugins = {
		kitty = {
			enabled = true,
			font = "+4",
		},
	},
	on_open = function()
		vim.cmd("set wrap")
	end,
	on_close = function()
		vim.cmd("set nowrap")
	end,
})

map("", "<leader>z", ":ZenMode<CR>", { silent = true })

require("oil").setup({
	columns = {
		"permissions",
		"size",
		"mtime",
	},
	keymaps = {
		["q"] = "actions.close",
	},
	view_options = {
		show_hidden = true,
	},
	float = {
		win_options = {
			winblend = 0,
		},
	},
})
map("n", "-", require("oil").open_float, { desc = "Open parent directory" })

require("neogit").setup({})
map("", "<Leader>g", ":Neogit<CR>")

-- Fast edit and reload of this config file
map("", "<leader>e", ":e! " .. home_dir .. "/.dotfiles/nvim/.config/nvim/init.lua<CR>", { silent = true })

vim.api.nvim_create_autocmd("BufWritePre", {
	pattern = "*",
	command = ":%s/\\s\\+$//e",
	group = vim.api.nvim_create_augroup("remove_trail_whitespaces", { clear = true }),
})

map("", "<f9>", ":make<CR>:copen<CR>")

-- Return to last edit position

vim.api.nvim_create_autocmd("BufReadPost", {
	pattern = "*",
	command = 'if line("\'\\"") > 1 && line("\'\\"") <= line("$") | exe "normal! g\'\\"" | endif',
	group = vim.api.nvim_create_augroup("cursor_save_position", { clear = true }),
})

local filetype_augroup = vim.api.nvim_create_augroup("ftaugroup", { clear = true })

-- Per filetype indent size
vim.api.nvim_create_autocmd("FileType", {
	pattern = "java, html, typescript, typescriptreact",
	command = "setlocal sw=2 ts=2 sts=2",
	group = filetype_augroup,
})

vim.api.nvim_create_autocmd("FileType", {
	pattern = "python",
	command = "compiler pyunit | setlocal makeprg=python\\ %",
	group = filetype_augroup,
})
