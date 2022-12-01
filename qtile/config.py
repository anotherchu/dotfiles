import os
import subprocess

from libqtile import bar, layout, widget, hook
from libqtile.config import Click, Drag, Group, Key, Match, Screen
from libqtile.lazy import lazy

from theme import catppuccin


@hook.subscribe.startup_once
def autostart():
    home = os.path.expanduser('~/.config/qtile/autostart.sh')
    subprocess.Popen([home])


mod = "mod1"
terminal = "kitty"

keys = [
    Key([mod], "j", lazy.layout.next(),
        desc="Move window focus to other window"),
    Key([mod], "k", lazy.layout.previous(),
        desc="Move window focus to other window"),
    Key([mod, "shift"], "j", lazy.layout.shuffle_down(), desc="Move window down"),
    Key([mod, "shift"], "k", lazy.layout.shuffle_up(), desc="Move window up"),
    Key([mod], "h", lazy.layout.decrease_ratio(),
        desc="Grow window to the left"),
    Key([mod], "l", lazy.layout.increase_ratio(),
        desc="Grow window to the right"),
    Key([mod], "n", lazy.layout.normalize(), desc="Reset all window sizes"),
    Key(
        [mod, "shift"],
        "Return",
        lazy.layout.toggle_split(),
        desc="Toggle between split and unsplit sides of stack",
    ),
    Key([mod, "control"], "t", lazy.spawn(terminal), desc="Launch terminal"),
    Key([mod], "space", lazy.next_layout(), desc="Toggle between layouts"),
    Key([mod, "shift"], "c", lazy.window.kill(), desc="Kill focused window"),
    Key([mod, "control"], "r", lazy.reload_config(), desc="Reload the config"),
    Key([mod, "control"], "q", lazy.shutdown(), desc="Shutdown Qtile"),
    Key([mod], "d", lazy.spawn("/home/tchu/.config/rofi/bin/runner"),
        desc="Oepn the Run Menu"),
    Key([mod], "r", lazy.spawn("/home/tchu/.config/rofi/bin/launcher"),
        desc="Oepn the Launcher Menu"),
    Key([mod], "p", lazy.spawn("/home/tchu/.config/rofi/bin/powermenu"),
        desc="Oepn the Power Menu"),
    Key(["mod4"], "l", lazy.spawn(
        "/home/tchu/.local/bin/lock.sh"), desc="Lock the screen"),
    Key(["mod4"], "space", lazy.widget["keyboardlayout"].next_keyboard(), desc="next keyboard layout")
]

groups = [Group(i) for i in "123456"]
for i in groups:
    keys.extend(
        [
            Key(
                [mod],
                i.name,
                lazy.group[i.name].toscreen(),
                desc="Switch to group {}".format(i.name),
            ),
            Key([mod, "shift"], i.name, lazy.window.togroup(i.name),
                desc="move focused window to group {}".format(i.name)),
        ]
    )

layouts = [
    layout.Tile(
        add_after_last=True,
        margin=8,
        ratio_increment=0.02,
        shift_windows=True,
        border_width=3,
        border_focus=catppuccin["sky"],
        border_normal=catppuccin["Overlay1"]
    ),
    layout.Max(
        border_width=3,
        border_focus=catppuccin["sky"],
        border_normal=catppuccin["Overlay1"],
        margin=4
    ),
]

widget_defaults = dict(
    font="SF Pro Display",
    fontsize=14
)
extension_defaults = widget_defaults.copy()

screens = [
    Screen(
        top=bar.Bar(
            [
                widget.TextBox(
                    " ",
                    background=catppuccin["Surface0"],
                ),
                widget.TextBox(
                    text="",
                    padding=0,
                    fontsize=22,
                    background=catppuccin["Surface2"],
                    foreground=catppuccin["Surface0"],
                ),
                widget.GroupBox(
                    highlight_method="text",
                    this_current_screen_border=catppuccin["Green"],
                    urgent_alert_method="text",
                    urgent_text=catppuccin["Red"],
                    background=catppuccin["Surface2"],
                    active=catppuccin["Text"],
                    inactive=catppuccin["Surface0"],
                    disable_drag=True,
                ),
                widget.TextBox(
                    text="",
                    padding=0,
                    fontsize=22,
                    background=catppuccin["Surface0"],
                    foreground=catppuccin["Surface2"],
                ),
                widget.WindowName(
                    background=catppuccin["Surface0"],
                    foreground=catppuccin["Text"]
                ),
                widget.TextBox(
                    text="",
                    padding=0,
                    fontsize=22,
                    background=catppuccin["Surface0"],
                    foreground=catppuccin["Lavender"],
                ),
                widget.Net(
                    format="{down}  ↓↑{up}",
                    background=catppuccin["Lavender"],
                    foreground=catppuccin["Mantle"],
                    width=160,
                    update_interval=2

                ),
                widget.TextBox(
                    text="",
                    padding=0,
                    fontsize=22,
                    background=catppuccin["Lavender"],
                    foreground=catppuccin["Surface2"],
                ),
                widget.Systray(
                    background=catppuccin["Surface2"],
                ),
                widget.TextBox(
                    text="",
                    padding=0,
                    fontsize=22,
                    background=catppuccin["Surface2"],
                    foreground=catppuccin["Base"],
                ),
                widget.DF(
                    format='HDD: ({uf}{m}|{r:.0f}%)',
                    visible_on_warn=False,
                    background=catppuccin["Base"],
                    foreground=catppuccin["Text"],
                    width=120,
                    update_interval=10
                ),
                widget.TextBox(
                    text="",
                    padding=0,
                    fontsize=22,
                    background=catppuccin["Base"],
                    foreground=catppuccin["Green"],
                ),
                widget.Memory(
                    format='MEM: {MemUsed:.2f}{mm}/{MemTotal:.2f}{mm}',
                    measure_mem='G',
                    background=catppuccin["Green"],
                    foreground=catppuccin["Mantle"],
                    width=140,
                    update_interval=5
                ),
                widget.TextBox(
                    text="",
                    padding=0,
                    fontsize=22,
                    background=catppuccin["Green"],
                    foreground=catppuccin["Mantle"],
                ),
                widget.CPU(
                    format='CPU: {load_percent}%',
                    background=catppuccin["Mantle"],
                    foreground=catppuccin["Text"],
                    update_interval=1,
                    width=90

                ),
                widget.TextBox(
                    text="",
                    padding=0,
                    fontsize=22,
                    background=catppuccin["Mantle"],
                    foreground=catppuccin["Blue"],
                ),
                widget.KeyboardLayout(
                    background=catppuccin["Blue"],
                    foreground=catppuccin["Mantle"],
                    configured_keyboards=["us", "br"],
                    display_map={
                        "us": "us",
                        "br": "br"
                    },
                ),
                widget.TextBox(
                    text="",
                    padding=0,
                    fontsize=22,
                    background=catppuccin["Blue"],
                    foreground=catppuccin["Mauve"],
                ),
                widget.Clock(
                    format="%Y-%m-%d %a %I:%M:%S %p",
                    background=catppuccin["Mauve"],
                    foreground=catppuccin["Mantle"],
                    width=220
                ),
                widget.TextBox(
                    text="",
                    padding=0,
                    fontsize=22,
                    background=catppuccin["Mauve"],
                    foreground=catppuccin["Lavender"],
                ),
                widget.CurrentLayout(
                    background=catppuccin["Lavender"],
                    foreground=catppuccin["Mantle"],
                ),
                widget.TextBox(
                    text="",
                    padding=0,
                    fontsize=22,
                    background=catppuccin["Lavender"],
                    foreground=catppuccin["Surface0"],
                ),
                widget.CheckUpdates(
                    distro='Fedora',
                    background=catppuccin["Surface0"],
                    foreground=catppuccin["Text"],
                    update_interval=60
                ),
            ],
            20,
        ),
        wallpaper="~/Pictures/Bridge.jpg",
        wallpaper_mode="stretch"
    ),
]

# Drag floating layouts.
mouse = [
    Drag([mod], "Button1", lazy.window.set_position_floating(),
         start=lazy.window.get_position()),
    Drag([mod], "Button3", lazy.window.set_size_floating(),
         start=lazy.window.get_size()),
    Click([mod], "Button2", lazy.window.bring_to_front()),
]

dgroups_key_binder = None
dgroups_app_rules = []  # type: list
follow_mouse_focus = True
bring_front_click = False
cursor_warp = False
floating_layout = layout.Floating(
    float_rules=[
        # Run the utility of `xprop` to see the wm class and name of an X client.
        *layout.Floating.default_float_rules,
        Match(wm_class="confirmreset"),  # gitk
        Match(wm_class="makebranch"),  # gitk
        Match(wm_class="maketag"),  # gitk
        Match(wm_class="ssh-askpass"),  # ssh-askpass
        Match(title="branchdialog"),  # gitk
        Match(title="pinentry"),  # GPG key password entry
    ]
)
auto_fullscreen = True
focus_on_window_activation = "smart"
reconfigure_screens = True
auto_minimize = True
wmname = "qtile"
