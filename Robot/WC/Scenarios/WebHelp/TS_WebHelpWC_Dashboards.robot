*** Keywords ***
Screenshot "WC_Dashboards" page
    ${DashboardId}    Set Variable    WEBHELP_WC_Dashboards

    Find Dashboard By ID Then Execute The First Dashboard    ${DashboardId}
    Click Dashboard Tab

    Crop Dashboard Page

Crop Dashboard Page
    ${detailsWidth}  ${detailsHeight}   Get Element Size   css=#DashboardField
    ${widgetsWidth}  ${widgetsHeight}   Get Element Size   css=#dashboardWrapper
    Crop WebHelp Image With Dimensions  WC_Dashboard.png  css=#ContentWrapper  0  0  1000  500