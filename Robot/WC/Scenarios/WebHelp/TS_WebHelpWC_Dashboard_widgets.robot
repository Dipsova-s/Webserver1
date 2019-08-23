*** Keywords ***
Screenshot "WC_Dashboard_widgets" page
    ${DashboardId}    Set Variable    WEBHELP_WC_Dashboard__results_page

    Go to Search Page
    Find Dashboard By ID Then Execute The First Dashboard    ${DashboardId}

    Show Dashboard Widget Menu    0
    Crop Dashboard Widget Menu Button
    Crop Dashboard Widget Menu Popup

Crop Dashboard Widget Menu Button
    Crop WebHelp Image  WC_Dashboard_expand.png  jquery=.widgetToolbar:visible    ${False}

Crop Dashboard Widget Menu Popup
    ${widgetWidth}  ${widgetHeight}   Get Element Size   jquery=#dashboardWrapper .widget-display-column:eq(0)
    Crop WebHelp Image With Dimensions  WC_Dashboard_dropdown.png  jquery=#dashboardWrapper .widget-display-column:eq(0)   ${widgetWidth - 165}  0  165  155