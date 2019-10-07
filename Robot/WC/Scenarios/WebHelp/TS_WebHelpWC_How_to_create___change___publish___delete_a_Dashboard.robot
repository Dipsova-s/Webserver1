*** Settings ***
Resource            ${EXECDIR}/WC/Scenarios/Angle/TS_DashboardState.robot

*** Keywords ***
Screenshot "WC_How_to_create___change___publish___delete_a_Dashboard" page
    ${DashboardId}    Set Variable    WEBHELP_WC_Dashboard__results_page

    Go to Search Page
    Find Dashboard By ID Then Execute The First Dashboard    ${DashboardId}

    Open Dashboard Detail Popup
    Update Popup Position    css=.popupDashboardDetails

    Click Dashboard Detail Definition Tab
    Open Dashboard Definition Widget Panel   1
    Crop Dashboard Details "Definition" Tab

    Close Dashboard Detail Popup
    Open Dashboard Publishing Popup
    Update Popup Position    css=.popupPublishSettings

    Crop Go To Angle Icon

Crop Dashboard Details "Definition" Tab
    Crop WebHelp Image    WC_Dashboard_definition.png  css=.popupDashboardDetails

Crop Go To Angle Icon
    Execute JavaScript
    ...   var widgets = dashboardHandler.HandlerState.Widgets();
    ...   widgets[0].is_public = false;
    ...   dashboardHandler.HandlerState.Widgets([]);
    ...   dashboardHandler.HandlerState.Widgets(widgets);
    Crop WebHelp Image  WC_Go_to_Angle.png  css=#popupPublishSettings .widget-link  ${False}