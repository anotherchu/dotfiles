"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTaskKeyword = exports.playWithoutTaskKeywords = exports.playExclusiveKeywords = exports.taskKeywords = exports.blockKeywords = exports.roleKeywords = exports.playKeywords = void 0;
const vscode_languageserver_1 = require("vscode-languageserver");
exports.playKeywords = new Map();
exports.playKeywords.set('any_errors_fatal', 'Force any un-handled task errors on any host to propagate to all hosts and end the play.');
exports.playKeywords.set('become', 'Boolean that controls if privilege escalation is used or not on Task execution. Implemented by the become plugin.');
exports.playKeywords.set('become_exe', {
    kind: vscode_languageserver_1.MarkupKind.Markdown,
    value: 'Path to the executable used to elevate privileges. Implemented by the become plugin. See `Become Plugins`.',
});
exports.playKeywords.set('become_flags', 'A string of flag(s) to pass to the privilege escalation program when become is True.');
exports.playKeywords.set('become_method', 'Which method of privilege escalation to use (such as sudo or su).');
exports.playKeywords.set('become_user', 'User that you ‘become’ after using privilege escalation. The remote/login user must have permissions to become this user.');
exports.playKeywords.set('check_mode', {
    kind: vscode_languageserver_1.MarkupKind.Markdown,
    value: 'A boolean that controls if a task is executed in ‘check’ mode. See `Validating tasks: check mode and diff mode`.',
});
exports.playKeywords.set('collections', {
    kind: vscode_languageserver_1.MarkupKind.Markdown,
    value: `List of collection namespaces to search for modules, plugins, and roles. See \`Using collections in a Playbook\`.

NOTE:
Tasks within a role do not inherit the value of \`collections\` from the play. To have a role search a list of collections, use the \`collections\` keyword in \`meta/main.yml\` within a role.`,
});
exports.playKeywords.set('connection', {
    kind: vscode_languageserver_1.MarkupKind.Markdown,
    value: 'Allows you to change the connection plugin used for tasks to execute on the target. See `Using connection plugins`.',
});
exports.playKeywords.set('debugger', {
    kind: vscode_languageserver_1.MarkupKind.Markdown,
    value: 'Enable debugging tasks based on state of the task result. See `Debugging tasks`.',
});
exports.playKeywords.set('diff', 'Toggle to make tasks return ‘diff’ information or not.');
exports.playKeywords.set('environment', 'A dictionary that gets converted into environment vars to be provided for the task upon execution. This can ONLY be used with modules. This isn’t supported for any other type of plugins nor Ansible itself nor its configuration, it just sets the variables for the code responsible for executing the task. This is not a recommended way to pass in confidential data.');
exports.playKeywords.set('fact_path', 'Set the fact path option for the fact gathering plugin controlled by gather_facts.');
exports.playKeywords.set('force_handlers', 'Will force notified handler execution for hosts even if they failed during the play. Will not trigger if the play itself fails.');
exports.playKeywords.set('gather_facts', 'A boolean that controls if the play will automatically run the ‘setup’ task to gather facts for the hosts.');
exports.playKeywords.set('gather_subset', 'Allows you to pass subset options to the fact gathering plugin controlled by gather_facts.');
exports.playKeywords.set('gather_timeout', 'Allows you to set the timeout for the fact gathering plugin controlled by gather_facts.');
exports.playKeywords.set('handlers', 'A section with tasks that are treated as handlers, these won’t get executed normally, only when notified after each section of tasks is complete. A handler’s listen field is not templatable.');
exports.playKeywords.set('hosts', 'A list of groups, hosts or host pattern that translates into a list of hosts that are the play’s target.');
exports.playKeywords.set('ignore_errors', 'Boolean that allows you to ignore task failures and continue with play. It does not affect connection errors.');
exports.playKeywords.set('ignore_unreachable', 'Boolean that allows you to ignore task failures due to an unreachable host and continue with the play. This does not affect other task errors (see ignore_errors) but is useful for groups of volatile/ephemeral hosts.');
exports.playKeywords.set('max_fail_percentage', 'Can be used to abort the run after a given percentage of hosts in the current batch has failed. This only works on linear or linear derived strategies.');
exports.playKeywords.set('module_defaults', 'Specifies default parameter values for modules.');
exports.playKeywords.set('name', 'Identifier. Can be used for documentation, or in tasks/handlers.');
exports.playKeywords.set('no_log', 'Boolean that controls information disclosure.');
exports.playKeywords.set('order', 'Controls the sorting of hosts as they are used for executing the play. Possible values are inventory (default), sorted, reverse_sorted, reverse_inventory and shuffle.');
exports.playKeywords.set('port', 'Used to override the default port used in a connection.');
exports.playKeywords.set('post_tasks', 'A list of tasks to execute after the tasks section.');
exports.playKeywords.set('pre_tasks', 'A list of tasks to execute before roles.');
exports.playKeywords.set('remote_user', 'User used to log into the target via the connection plugin.');
exports.playKeywords.set('roles', 'List of roles to be imported into the play');
exports.playKeywords.set('run_once', 'Boolean that will bypass the host loop, forcing the task to attempt to execute on the first host available and afterwards apply any results and facts to all active hosts in the same batch.');
exports.playKeywords.set('serial', 'Explicitly define how Ansible batches the execution of the current play on the play’s target');
exports.playKeywords.set('strategy', 'Allows you to choose the connection plugin to use for the play.');
exports.playKeywords.set('tags', 'Tags applied to the task or included tasks, this allows selecting subsets of tasks from the command line.');
exports.playKeywords.set('tasks', 'Main list of tasks to execute in the play, they run after roles and before post_tasks.');
exports.playKeywords.set('throttle', 'Limit number of concurrent task runs on task, block and playbook level. This is independent of the forks and serial settings, but cannot be set higher than those limits. For example, if forks is set to 10 and the throttle is set to 15, at most 10 hosts will be operated on in parallel.');
exports.playKeywords.set('timeout', 'Time limit for task to execute in, if exceeded Ansible will interrupt and fail the task.');
exports.playKeywords.set('vars', 'Dictionary/map of variables');
exports.playKeywords.set('vars_files', 'List of files that contain vars to include in the play.');
exports.playKeywords.set('vars_prompt', 'List of variables to prompt for.');
exports.roleKeywords = new Map();
exports.roleKeywords.set('any_errors_fatal', 'Force any un-handled task errors on any host to propagate to all hosts and end the play.');
exports.roleKeywords.set('become', {
    kind: vscode_languageserver_1.MarkupKind.Markdown,
    value: 'Boolean that controls if privilege escalation is used or not on Task execution. Implemented by the become plugin. See `Become Plugins`.',
});
exports.roleKeywords.set('become_exe', {
    kind: vscode_languageserver_1.MarkupKind.Markdown,
    value: 'Path to the executable used to elevate privileges. Implemented by the become plugin. See `Become Plugins`.',
});
exports.roleKeywords.set('become_flags', 'A string of flag(s) to pass to the privilege escalation program when become is True.');
exports.roleKeywords.set('become_method', 'Which method of privilege escalation to use (such as sudo or su).');
exports.roleKeywords.set('become_user', 'User that you ‘become’ after using privilege escalation. The remote/login user must have permissions to become this user.');
exports.roleKeywords.set('check_mode', {
    kind: vscode_languageserver_1.MarkupKind.Markdown,
    value: 'A boolean that controls if a task is executed in ‘check’ mode. See `Validating tasks: check mode and diff mode`.',
});
exports.roleKeywords.set('collections', {
    kind: vscode_languageserver_1.MarkupKind.Markdown,
    value: `List of collection namespaces to search for modules, plugins, and roles. See \`Using collections in a Playbook\`.

NOTE:
Tasks within a role do not inherit the value of \`collections\` from the play. To have a role search a list of collections, use the \`collections\` keyword in \`meta/main.yml\` within a role.`,
});
exports.roleKeywords.set('connection', {
    kind: vscode_languageserver_1.MarkupKind.Markdown,
    value: 'Allows you to change the connection plugin used for tasks to execute on the target. See `Using connection plugins`.',
});
exports.roleKeywords.set('debugger', {
    kind: vscode_languageserver_1.MarkupKind.Markdown,
    value: 'Enable debugging tasks based on state of the task result. See `Debugging tasks`.',
});
exports.roleKeywords.set('delegate_facts', 'Boolean that allows you to apply facts to a delegated host instead of inventory_hostname.');
exports.roleKeywords.set('delegate_to', 'Host to execute task instead of the target (inventory_hostname). Connection vars from the delegated host will also be used for the task.');
exports.roleKeywords.set('diff', 'Toggle to make tasks return ‘diff’ information or not.');
exports.roleKeywords.set('environment', 'A dictionary that gets converted into environment vars to be provided for the task upon execution. This can ONLY be used with modules. This isn’t supported for any other type of plugins nor Ansible itself nor its configuration, it just sets the variables for the code responsible for executing the task. This is not a recommended way to pass in confidential data.');
exports.roleKeywords.set('ignore_errors', 'Boolean that allows you to ignore task failures and continue with play. It does not affect connection errors.');
exports.roleKeywords.set('ignore_unreachable', 'Boolean that allows you to ignore task failures due to an unreachable host and continue with the play. This does not affect other task errors (see ignore_errors) but is useful for groups of volatile/ephemeral hosts.');
exports.roleKeywords.set('module_defaults', 'Specifies default parameter values for modules.');
exports.roleKeywords.set('name', 'Identifier. Can be used for documentation, or in tasks/handlers.');
exports.roleKeywords.set('no_log', 'Boolean that controls information disclosure.');
exports.roleKeywords.set('port', 'Used to override the default port used in a connection.');
exports.roleKeywords.set('remote_user', 'User used to log into the target via the connection plugin.');
exports.roleKeywords.set('run_once', 'Boolean that will bypass the host loop, forcing the task to attempt to execute on the first host available and afterwards apply any results and facts to all active hosts in the same batch.');
exports.roleKeywords.set('tags', 'Tags applied to the task or included tasks, this allows selecting subsets of tasks from the command line.');
exports.roleKeywords.set('throttle', 'Limit number of concurrent task runs on task, block and playbook level. This is independent of the forks and serial settings, but cannot be set higher than those limits. For example, if forks is set to 10 and the throttle is set to 15, at most 10 hosts will be operated on in parallel.');
exports.roleKeywords.set('timeout', 'Time limit for task to execute in, if exceeded Ansible will interrupt and fail the task.');
exports.roleKeywords.set('vars', 'Dictionary/map of variables');
exports.roleKeywords.set('when', 'Conditional expression, determines if an iteration of a task is run or not.');
exports.blockKeywords = new Map();
exports.blockKeywords.set('always', 'List of tasks, in a block, that execute no matter if there is an error in the block or not.');
exports.blockKeywords.set('any_errors_fatal', 'Force any un-handled task errors on any host to propagate to all hosts and end the play.');
exports.blockKeywords.set('become', {
    kind: vscode_languageserver_1.MarkupKind.Markdown,
    value: 'Boolean that controls if privilege escalation is used or not on Task execution. Implemented by the become plugin. See `Become Plugins`.',
});
exports.blockKeywords.set('become_exe', {
    kind: vscode_languageserver_1.MarkupKind.Markdown,
    value: 'Path to the executable used to elevate privileges. Implemented by the become plugin. See `Become Plugins`.',
});
exports.blockKeywords.set('become_flags', 'A string of flag(s) to pass to the privilege escalation program when become is True.');
exports.blockKeywords.set('become_method', 'Which method of privilege escalation to use (such as sudo or su).');
exports.blockKeywords.set('become_user', 'User that you ‘become’ after using privilege escalation. The remote/login user must have permissions to become this user.');
exports.blockKeywords.set('block', 'List of tasks in a block.');
exports.blockKeywords.set('check_mode', {
    kind: vscode_languageserver_1.MarkupKind.Markdown,
    value: 'A boolean that controls if a task is executed in ‘check’ mode. See `Validating tasks: check mode and diff mode`.',
});
exports.blockKeywords.set('collections', {
    kind: vscode_languageserver_1.MarkupKind.Markdown,
    value: `List of collection namespaces to search for modules, plugins, and roles. See \`Using collections in a Playbook\`.

NOTE:
Tasks within a role do not inherit the value of \`collections\` from the play. To have a role search a list of collections, use the \`collections\` keyword in \`meta/main.yml\` within a role.`,
});
exports.blockKeywords.set('connection', {
    kind: vscode_languageserver_1.MarkupKind.Markdown,
    value: 'Allows you to change the connection plugin used for tasks to execute on the target. See `Using connection plugins`.',
});
exports.blockKeywords.set('debugger', {
    kind: vscode_languageserver_1.MarkupKind.Markdown,
    value: 'Enable debugging tasks based on state of the task result. See `Debugging tasks`.',
});
exports.blockKeywords.set('delegate_facts', 'Boolean that allows you to apply facts to a delegated host instead of inventory_hostname.');
exports.blockKeywords.set('delegate_to', 'Host to execute task instead of the target (inventory_hostname). Connection vars from the delegated host will also be used for the task.');
exports.blockKeywords.set('diff', 'Toggle to make tasks return ‘diff’ information or not.');
exports.blockKeywords.set('environment', 'A dictionary that gets converted into environment vars to be provided for the task upon execution. This can ONLY be used with modules. This isn’t supported for any other type of plugins nor Ansible itself nor its configuration, it just sets the variables for the code responsible for executing the task. This is not a recommended way to pass in confidential data.');
exports.blockKeywords.set('ignore_errors', 'Boolean that allows you to ignore task failures and continue with play. It does not affect connection errors.');
exports.blockKeywords.set('ignore_unreachable', 'Boolean that allows you to ignore task failures due to an unreachable host and continue with the play. This does not affect other task errors (see ignore_errors) but is useful for groups of volatile/ephemeral hosts.');
exports.blockKeywords.set('module_defaults', 'Specifies default parameter values for modules.');
exports.blockKeywords.set('name', 'Identifier. Can be used for documentation, or in tasks/handlers.');
exports.blockKeywords.set('no_log', 'Boolean that controls information disclosure.');
exports.blockKeywords.set('notify', 'List of handlers to notify when the task returns a ‘changed=True’ status.');
exports.blockKeywords.set('port', 'Used to override the default port used in a connection.');
exports.blockKeywords.set('remote_user', 'User used to log into the target via the connection plugin.');
exports.blockKeywords.set('rescue', 'List of tasks in a block that run if there is a task error in the main block list.');
exports.blockKeywords.set('run_once', 'Boolean that will bypass the host loop, forcing the task to attempt to execute on the first host available and afterwards apply any results and facts to all active hosts in the same batch.');
exports.blockKeywords.set('tags', 'Tags applied to the task or included tasks, this allows selecting subsets of tasks from the command line.');
exports.blockKeywords.set('throttle', 'Limit number of concurrent task runs on task, block and playbook level. This is independent of the forks and serial settings, but cannot be set higher than those limits. For example, if forks is set to 10 and the throttle is set to 15, at most 10 hosts will be operated on in parallel.');
exports.blockKeywords.set('timeout', 'Time limit for task to execute in, if exceeded Ansible will interrupt and fail the task.');
exports.blockKeywords.set('vars', 'Dictionary/map of variables');
exports.blockKeywords.set('when', 'Conditional expression, determines if an iteration of a task is run or not.');
exports.taskKeywords = new Map();
exports.taskKeywords.set('action', 'The ‘action’ to execute for a task, it normally translates into a C(module) or action plugin.');
exports.taskKeywords.set('any_errors_fatal', 'Force any un-handled task errors on any host to propagate to all hosts and end the play.');
exports.taskKeywords.set('args', 'A secondary way to add arguments into a task. Takes a dictionary in which keys map to options and values.');
exports.taskKeywords.set('async', 'Run a task asynchronously if the C(action) supports this; value is maximum runtime in seconds.');
exports.taskKeywords.set('become', {
    kind: vscode_languageserver_1.MarkupKind.Markdown,
    value: 'Boolean that controls if privilege escalation is used or not on Task execution. Implemented by the become plugin. See `Become Plugins`.',
});
exports.taskKeywords.set('become_exe', {
    kind: vscode_languageserver_1.MarkupKind.Markdown,
    value: 'Path to the executable used to elevate privileges. Implemented by the become plugin. See `Become Plugins`.',
});
exports.taskKeywords.set('become_flags', 'A string of flag(s) to pass to the privilege escalation program when become is True.');
exports.taskKeywords.set('become_method', 'Which method of privilege escalation to use (such as sudo or su).');
exports.taskKeywords.set('become_user', 'User that you ‘become’ after using privilege escalation. The remote/login user must have permissions to become this user.');
exports.taskKeywords.set('changed_when', 'Conditional expression that overrides the task’s normal ‘changed’ status.');
exports.taskKeywords.set('check_mode', {
    kind: vscode_languageserver_1.MarkupKind.Markdown,
    value: 'A boolean that controls if a task is executed in ‘check’ mode. See `Validating tasks: check mode and diff mode`.',
});
exports.taskKeywords.set('collections', {
    kind: vscode_languageserver_1.MarkupKind.Markdown,
    value: `List of collection namespaces to search for modules, plugins, and roles. See \`Using collections in a Playbook\`.

NOTE:
Tasks within a role do not inherit the value of \`collections\` from the play. To have a role search a list of collections, use the \`collections\` keyword in \`meta/main.yml\` within a role.`,
});
exports.taskKeywords.set('connection', {
    kind: vscode_languageserver_1.MarkupKind.Markdown,
    value: 'Allows you to change the connection plugin used for tasks to execute on the target. See `Using connection plugins`.',
});
exports.taskKeywords.set('debugger', {
    kind: vscode_languageserver_1.MarkupKind.Markdown,
    value: 'Enable debugging tasks based on state of the task result. See `Debugging tasks`.',
});
exports.taskKeywords.set('delay', 'Number of seconds to delay between retries. This setting is only used in combination with until.');
exports.taskKeywords.set('delegate_facts', 'Boolean that allows you to apply facts to a delegated host instead of inventory_hostname.');
exports.taskKeywords.set('delegate_to', 'Host to execute task instead of the target (inventory_hostname). Connection vars from the delegated host will also be used for the task.');
exports.taskKeywords.set('diff', 'Toggle to make tasks return ‘diff’ information or not.');
exports.taskKeywords.set('environment', 'A dictionary that gets converted into environment vars to be provided for the task upon execution. This can ONLY be used with modules. This isn’t supported for any other type of plugins nor Ansible itself nor its configuration, it just sets the variables for the code responsible for executing the task. This is not a recommended way to pass in confidential data.');
exports.taskKeywords.set('failed_when', 'Conditional expression that overrides the task’s normal ‘failed’ status.');
exports.taskKeywords.set('ignore_errors', 'Boolean that allows you to ignore task failures and continue with play. It does not affect connection errors.');
exports.taskKeywords.set('ignore_unreachable', 'Boolean that allows you to ignore task failures due to an unreachable host and continue with the play. This does not affect other task errors (see ignore_errors) but is useful for groups of volatile/ephemeral hosts.');
exports.taskKeywords.set('local_action', 'Same as action but also implies delegate_to: localhost');
exports.taskKeywords.set('loop', 'Takes a list for the task to iterate over, saving each list element into the item variable (configurable via loop_control)');
exports.taskKeywords.set('loop_control', 'Several keys here allow you to modify/set loop behaviour in a task.');
exports.taskKeywords.set('module_defaults', 'Specifies default parameter values for modules.');
exports.taskKeywords.set('name', 'Identifier. Can be used for documentation, or in tasks/handlers.');
exports.taskKeywords.set('no_log', 'Boolean that controls information disclosure.');
exports.taskKeywords.set('notify', 'List of handlers to notify when the task returns a ‘changed=True’ status.');
exports.taskKeywords.set('poll', 'Sets the polling interval in seconds for async tasks (default 10s).');
exports.taskKeywords.set('port', 'Used to override the default port used in a connection.');
exports.taskKeywords.set('register', 'Name of variable that will contain task status and module return data.');
exports.taskKeywords.set('remote_user', 'User used to log into the target via the connection plugin.');
exports.taskKeywords.set('retries', 'Number of retries before giving up in a until loop. This setting is only used in combination with until.');
exports.taskKeywords.set('run_once', 'Boolean that will bypass the host loop, forcing the task to attempt to execute on the first host available and afterwards apply any results and facts to all active hosts in the same batch.');
exports.taskKeywords.set('tags', 'Tags applied to the task or included tasks, this allows selecting subsets of tasks from the command line.');
exports.taskKeywords.set('throttle', 'Limit number of concurrent task runs on task, block and playbook level. This is independent of the forks and serial settings, but cannot be set higher than those limits. For example, if forks is set to 10 and the throttle is set to 15, at most 10 hosts will be operated on in parallel.');
exports.taskKeywords.set('timeout', 'Time limit for task to execute in, if exceeded Ansible will interrupt and fail the task.');
exports.taskKeywords.set('until', 'This keyword implies a ‘retries loop’ that will go on until the condition supplied here is met or we hit the retries limit.');
exports.taskKeywords.set('vars', 'Dictionary/map of variables');
exports.taskKeywords.set('when', 'Conditional expression, determines if an iteration of a task is run or not.');
exports.playExclusiveKeywords = new Map([...exports.playKeywords].filter(([k]) => !exports.taskKeywords.has(k) && !exports.roleKeywords.has(k) && !exports.blockKeywords.has(k)));
exports.playWithoutTaskKeywords = new Map([...exports.playKeywords].filter(([k]) => !exports.taskKeywords.has(k)));
function isTaskKeyword(value) {
    return exports.taskKeywords.has(value) || value.startsWith('with_');
}
exports.isTaskKeyword = isTaskKeyword;
//# sourceMappingURL=ansible.js.map