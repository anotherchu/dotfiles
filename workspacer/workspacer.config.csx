#r "C:\Program Files\workspacer\workspacer.Shared.dll"
#r "C:\Program Files\workspacer\plugins\workspacer.Bar\workspacer.Bar.dll"
#r "C:\Program Files\workspacer\plugins\workspacer.ActionMenu\workspacer.ActionMenu.dll"
#r "C:\Program Files\workspacer\plugins\workspacer.FocusIndicator\workspacer.FocusIndicator.dll"
#r "C:\Program Files\workspacer\plugins\workspacer.Gap\workspacer.Gap.dll"

using System;
using System.Collections.Generic;
using workspacer;
using workspacer.Bar;
using workspacer.Bar.Widgets;
using workspacer.ActionMenu;
using workspacer.FocusIndicator;
using workspacer.Gap;

public class WorkspacerConfig{
    private readonly IConfigContext _context;
    private readonly int _fontSize;
    private readonly String _fontName;
    private readonly int _barHeight;
    private readonly Color _foreground;
    private readonly GapPlugin _gaps;

    public WorkspacerConfig(IConfigContext context){
        _context = context;
        _context.Branch = Branch.Unstable;
        _fontSize = 10;
        _fontName = "SF Pro Display";
        _barHeight = 20;
        _foreground = new Color(0xFF,0xA5,0x00);
        _gaps = InitGaps();
        InitBar();
        InitWorkspaces();
        InitRoutes();
        InitFilters();
    }

    private void InitBar(){

        WorkspaceWidget WsWidget = new WorkspaceWidget();
        WsWidget.WorkspaceHasFocusColor = _foreground;
        WsWidget.WorkspaceIndicatingBackColor = _foreground;

        TitleWidget titleWidget = new TitleWidget();
        titleWidget.WindowHasFocusColor = Color.White;

        FocusedMonitorWidget focusMonitorWidget = new FocusedMonitorWidget();

        focusMonitorWidget.FocusedText = "F";
        focusMonitorWidget.UnfocusedText = "U";

        _context.AddBar(
                new BarPluginConfig()
                {
                    FontSize = _fontSize,
                    FontName = _fontName,
                    BarHeight = _barHeight,
                    LeftWidgets = () => new IBarWidget[]
                    {
                        WsWidget,
                        focusMonitorWidget,
                        new TextWidget("> "),
                        titleWidget
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
        _context.AddFocusIndicator();
        _context.AddActionMenu();
    }

    private GapPlugin InitGaps()
    {
        var gap = _barHeight - 8;
        return _context.AddGap(
            new GapPluginConfig()
            {
                InnerGap = gap,
                OuterGap = 8,
                Delta = gap / 2,
            }
        );
    }

    private void InitWorkspaces(){
        Func<ILayoutEngine[]> defaultLayouts = () => new ILayoutEngine[]{
            new TallLayoutEngine(),
            new FullLayoutEngine(),
        };
        _context.DefaultLayouts = defaultLayouts;
        _context.WorkspaceContainer.CreateWorkspaces("一", "二", "三", "四", "五", "六");
    }

    private void InitFilters(){
     /* Filters (Ignore these programs) */
        List<string> filterList = new List<string>()
                                  {
                                    "Media viewer",
                                    "% complete",
                                    "Friends list",
                                    "Picture-in-Picture",
                                    "Magnifier",
                                  };
        foreach (string programName in filterList){
            _context.WindowRouter.AddFilter((window) => !window.Title.Contains(programName));
        }
    }

    private void InitRoutes(){
        _context.WindowRouter.RouteTitle("Telegram","四");
        _context.WindowRouter.RouteTitle("Discord","四");
        _context.WindowRouter.RouteProcessName("Spotify","五");
        _context.WindowRouter.RouteProcessName("mpv","五");
    }

}

return new Action<IConfigContext>((context) => new WorkspacerConfig(context));
