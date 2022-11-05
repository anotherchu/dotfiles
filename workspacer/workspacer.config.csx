#r "C:\Program Files\workspacer\workspacer.Shared.dll"
#r "C:\Program Files\workspacer\plugins\workspacer.Bar\workspacer.Bar.dll"
#r "C:\Program Files\workspacer\plugins\workspacer.ActionMenu\workspacer.ActionMenu.dll"
// #r "C:\Program Files\workspacer\plugins\workspacer.FocusIndicator\workspacer.FocusIndicator.dll"
#r "C:\Program Files\workspacer\plugins\workspacer.FocusBorder\workspacer.FocusBorder.dll"
#r "C:\Program Files\workspacer\plugins\workspacer.Gap\workspacer.Gap.dll"

using System;
using System.Collections.Generic;
using workspacer;
using workspacer.Bar;
using workspacer.Bar.Widgets;
using workspacer.ActionMenu;
// using workspacer.FocusIndicator;
using workspacer.FocusBorder;
using workspacer.Gap;


return new Action<IConfigContext>((IConfigContext context) =>
{
    var fontSize = 10;
    var fontName = "SF Pro Display";
    var barHeight = 20;
    var foregroundColor = new Color(0xA6,0xD1,0x89);
    var nordicColor = new Color(0x69, 0x7D, 0x97);

    var gap = barHeight - 8;
    var gapPlugin = context.AddGap(new GapPluginConfig(){
        InnerGap = gap,
        OuterGap = 8,
        Delta = gap / 2,
    });


    context.AddBar(
            new BarPluginConfig()
            {
                FontSize = fontSize,
                // FontName = fontName,
                BarHeight = barHeight,
                LeftWidgets = () => new IBarWidget[]
                {
                    new WorkspaceWidget(){
                        WorkspaceHasFocusColor = foregroundColor,
                        WorkspaceIndicatingBackColor = foregroundColor
                    },
                    new FocusedMonitorWidget(){
                        FocusedText = "F",
                        UnfocusedText = "U",
                    },
                    new TextWidget("> "),
                    new TitleWidget(){
                        WindowHasFocusColor = Color.White
                    }
                },
                RightWidgets = () => new IBarWidget[]
                {
                    new CpuPerformanceWidget(),
                    new MemoryPerformanceWidget(),
                    new NetworkPerformanceWidget(),
                    new TimeWidget(200,"HH:mm:ss dd/MM/yy"),
                    new ActiveLayoutWidget()
                },
            }
    );

    // context.AddFocusIndicator();

    context.AddFocusBorder(new FocusBorderPluginConfig()
    {
        BorderColor = nordicColor,
        BorderSize = 8
    });

    Func<ILayoutEngine[]> defaultLayouts = () => new ILayoutEngine[]{
        new TallLayoutEngine(),
        new FullLayoutEngine(),
    };

    context.DefaultLayouts = defaultLayouts;

    (string, ILayoutEngine[])[] workspaces = {
      ("一", defaultLayouts()),
      ("二", defaultLayouts()),
      ("三", defaultLayouts()),
      ("四", defaultLayouts()),
      ("五", defaultLayouts()),
      ("六", defaultLayouts()),
    };

    foreach ((string name, ILayoutEngine[] layouts) in workspaces)
    {
        context.WorkspaceContainer.CreateWorkspace(name, layouts);
    }

    List<string> filterList = new List<string>()
                              {
                                "Media viewer",
                                "% complete",
                                "Friends list",
                                "Picture-in-Picture",
                                "Sharing Indicator",
                                "League of Legends",
                                "Ace Combat",
                                "Modern Warfare",
                                "Overwatch",
                                "Forza Horizon 5",
                                "Path of Exile",
                                "Tibia",
                                "Magnifier",
                              };

    foreach (string programName in filterList){
        context.WindowRouter.AddFilter((window) => !window.Title.Contains(programName));
    }

    context.WindowRouter.RouteTitle("Teams","三");
    context.WindowRouter.RouteTitle("Telegram","四");
    context.WindowRouter.RouteTitle("Discord","四");
    context.WindowRouter.RouteProcessName("Spotify","五");
    context.WindowRouter.RouteProcessName("mpv","五");

    IKeybindManager manager = context.Keybinds;
    var _workspaces = context.Workspaces;

    manager.Subscribe(KeyModifiers.Win, Keys.Right, () => _workspaces.SwitchFocusToNextMonitor(), "switch focus to next monitor");
    manager.Subscribe(KeyModifiers.Win, Keys.Left, () => _workspaces.SwitchFocusToPreviousMonitor(), "switch focus to previous monitor");

});

