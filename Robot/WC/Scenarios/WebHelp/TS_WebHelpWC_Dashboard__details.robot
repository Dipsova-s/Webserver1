*** Keywords ***
Screenshot "WC_Dashboard__details" page
    ${DashboardId}    Set Variable    WEBHELP_WC_Dashboard__results_page

    Find Dashboard By ID Then Execute The First Dashboard    ${DashboardId}

    Crop Dashboard Details
    Crop Dashboard Displays

Crop Dashboard Details
    Click Dashboard Tab
    Collapse All Dashboard Section Panels
    Execute JavaScript
    ...   dashboardPageHandler.DashboardUserSpecificHandler.DashboardModel.Data().authorizations.update_user_specific=true;
    ...   dashboardPageHandler.DashboardUserSpecificHandler.DashboardModel.Data.notifySubscribers();
    ${width}  ${height}  Get Element Size  css=#TabContentDashboard
    ${tabWidth}  ${tabHeight}  Get Element Size  css=#TabDetails .tab-menu-wrapper
    Crop WebHelp Image With Dimensions  WC_Dashboard_Details.png  css=#TabDetails  0  0  ${width}  ${height}+${tabHeight}

Crop Dashboard Displays
    Click Displays Tab
    ${width}  ${height}  Get Element Size  css=#TabContentWidgets
    ${tabWidth}  ${tabHeight}  Get Element Size  css=#TabDetails .tab-menu-wrapper
    Crop WebHelp Image With Dimensions  WC_Display_Details_Dashboard.png  css=#TabDetails  0  0  ${width}  ${height}+${tabHeight}