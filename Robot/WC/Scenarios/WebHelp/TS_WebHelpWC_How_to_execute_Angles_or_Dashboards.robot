*** Keywords ***
Screenshot "WC_How_to_execute_Angles_or_Dashboards" page
    ${AngleId}        Set Variable    WEBHELP_WC_How_to_execute_Angles_or_Dashboards
    ${DashboardId}    Set Variable    WEBHELP_WC_Dashboard__results_page

    Go to Search Page
    Search Filter By Query String    ids=${AngleId}
    Click Link   ${lnkSearchResult}:eq(0)
    Wait Until Angle Execute Parameters Popup Loaded
    
    Update Popup Position    css=.popupExecuteParameters
    Crop Execution Parameters Popup

    Go to Search Page
    Find Dashboard By ID Then Execute The First Dashboard    ${DashboardId}
    Crop Open Dashboard Filters Button

Crop Execution Parameters Popup
    Crop WebHelp Image  WC_Execution_Parameters.png  css=.popupExecuteParameters

Crop Open Dashboard Filters Button
    Crop WebHelp Image  WC_Dashboard_Open_Filter_Definition.png  css=#dashboardFilterWrapper .btnOpenFilters  ${False}