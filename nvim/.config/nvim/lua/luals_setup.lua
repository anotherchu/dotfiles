local home_dir = os.getenv('HOME')
local sumneko_root = home_dir .. '/.lsp/lua-language-server/'
local sumneko_binary = home_dir .. sumneko_root ..'/bin/Linux/lua-language-server'
local lua_runtime_path = vim.split(package.path, ';')
table.insert(lua_runtime_path, "lua/?.lua")
table.insert(lua_runtime_path, 'lua/?/init.lua')

local M = {}
function M.setup()

    require'lspconfig'.sumneko_lua.setup {
        cmd = { sumneko_binary, 'E', sumneko_root .. '/main.lua'},
        settings = {
            Lua = {
                runtime = {
                    version = 'LuaJIT',
                    path = lua_runtime_path

                },
                telemetry = {
                    enable = false
                }
            }
        },
        filetypes = {'lua'}
    }
end

return M
