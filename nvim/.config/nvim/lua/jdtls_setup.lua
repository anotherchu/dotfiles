----- nvim-jdtls
local M = {}
local root_markers = {'mvnw', '.git'}
local root_dir = require('jdtls.setup').find_root(root_markers)
local home = os.getenv('HOME')
local workspace_folder = home .. "/workspace/" .. vim.fn.fnamemodify(root_dir, ":p:h:t")
local capabilities = vim.lsp.protocol.make_client_capabilities()
local jdt_capabilities = require("cmp_nvim_lsp").update_capabilities(capabilities)
jdt_capabilities.workspace.configuration = true
jdt_capabilities.textDocument.completion.completionItem.snippetSupport = true

local extendedClientCapabilities = require('jdtls').extendedClientCapabilities
extendedClientCapabilities.resolveAdditionalTextEditsSupport = true
-- cmd 'au FileType java lua require("jdtls").start_or_attach({cmd = {"launch_jdt.sh"}})'

-- map('i','<Leader>ca','<cmd>lua require("jdtls").code_action()<cr>',{silent = true})

function M.setup()

    require("jdtls").start_or_attach({
        cmd = {'launch_jdt.sh', workspace_folder},
        root_dir = root_dir,
        capabilities = jdt_capabilities,
        init_options = {
            extendedClientCapabilities = extendedClientCapabilities
        },
        filetypes = {'java'},
        on_attach = function(client, bufnr)
            vim.api.nvim_buf_set_keymap(bufnr, 'n', '<Leader>ca', '<cmd>lua require("jdtls").code_action()<cr>', {noremap=true})
            vim.api.nvim_buf_set_keymap(bufnr, 'v', '<Leader>ca', '<cmd>lua require("jdtls").code_action(true)<cr>',{noremap=true})
        end,
        settings = {
            java = {
                signatureHelp = { enabled = true},
            },
            sources = {
                organizeImports = {
                    starThreshold = 9999,
                    staticStarThreshold = 9999
                }
            },
            codeGeneration = {
                toString = {
                    template = "${object.className}{${member.name()}=${member.value}, ${otherMembers}}"
                }
            }
        },
    })

    local finders = require'telescope.finders'
    local sorters = require'telescope.sorters'
    local actions = require'telescope.actions'
    local pickers = require'telescope.pickers'
    require('jdtls.ui').pick_one_async = function(items, prompt, label_fn, cb)
        local opts = {}
        pickers.new(opts, {
            prompt_title = prompt,
            finder    = finders.new_table {
              results = items,
              entry_maker = function(entry)
                return {
                  value = entry,
                  display = label_fn(entry),
                  ordinal = label_fn(entry),
                }
              end,
            },
            sorter = sorters.get_generic_fuzzy_sorter(),
            attach_mappings = function(prompt_bufnr)
              actions.select_default:replace(function()
                local selection = actions.get_selected_entry(prompt_bufnr)
                actions.close(prompt_bufnr)

                cb(selection.value)
              end)

              return true
            end,
          }):find()
    end
end

return M
