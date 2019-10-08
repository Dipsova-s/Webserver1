*** Keywords ***
Screenshot "WC_Dashboard_widgets" page
    ${DashboardId}    Set Variable    WEBHELP_WC_Dashboard__results_page

    Go to Search Page
    Find Dashboard By ID Then Execute The First Dashboard    ${DashboardId}

    Show Dashboard Widget Menu    0
    Crop Dashboard Widget Menu Buttons

Crop Dashboard Widget Menu Buttons
    Execute JavaScript  $('.widgetToolbar:visible .widgetButtonMinimize').show();
    Crop WebHelp Image  WC_Maximize_Icon.png        jquery=.widgetToolbar:visible .widgetButtonMaximize    ${False}
    Crop WebHelp Image  WC_Minimize_Icon.png        jquery=.widgetToolbar:visible .widgetButtonMinimize    ${False}
    Crop WebHelp Image  WC_GoToAngle_Icon.png       jquery=.widgetToolbar:visible .widgetButtonOpenNewWindow    ${False}
    Crop WebHelp Image  WC_Delete_Widget_Icon.png   jquery=.widgetToolbar:visible .widgetButtonDelete    ${False}
