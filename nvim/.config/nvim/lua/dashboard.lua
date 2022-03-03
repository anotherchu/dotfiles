local g = vim.g

local function map(mode, lhs, rhs, opts)
	local options = { noremap = true }
	if opts then
		options = vim.tbl_extend("force", options, opts)
	end
	vim.api.nvim_set_keymap(mode, lhs, rhs, options)
end

g.dashboard_default_executive = "telescope"
map("n", "<Leader>ss", ":<C-u>SessionSave<CR>")
map("n", "<Leader>sl", ":<C-u>SessionLoad<CR>")
map("n", "<Leader>fh", ":DashboardFindHistory<CR>", { silent = true })
map("n", "<Leader>tc", ":DashboardChangeColorscheme<CR>", { silent = true })
map("n", "<Leader>fb", ":DashboardJumpMark<CR>", { silent = true })
map("n", "<Leader>cn", ":DashboardNewFile<CR>", { silent = true })
g.dashboard_custom_shortcut = {
	last_session = ", s l",
	find_history = ", f h",
	find_file = "<C> f",
	new_file = ", c n",
	change_colorscheme = ", t c",
	find_word = ", r  ",
	book_marks = ", f b",
}
g.dashboard_custom_header = {
	" ███╗   ██╗ ███████╗ ██████╗  ██╗   ██╗ ██╗ ███╗   ███╗",
	" ████╗  ██║ ██╔════╝██╔═══██╗ ██║   ██║ ██║ ████╗ ████║",
	" ██╔██╗ ██║ █████╗  ██║   ██║ ██║   ██║ ██║ ██╔████╔██║",
	" ██║╚██╗██║ ██╔══╝  ██║   ██║ ╚██╗ ██╔╝ ██║ ██║╚██╔╝██║",
	" ██║ ╚████║ ███████╗╚██████╔╝  ╚████╔╝  ██║ ██║ ╚═╝ ██║",
	" ╚═╝  ╚═══╝ ╚══════╝ ╚═════╝    ╚═══╝   ╚═╝ ╚═╝     ╚═╝",
}
g.indentLine_fileTypeExclude = { "dashboard" }
