*** Settings ***
Resource            ${EXECDIR}/WC/Scenarios/Dashboard/TS_DashboardState.robot

*** Keywords ***
Screenshot "WC_How_to_create___change___publish___delete_a_Dashboard" page
    ${DashboardId}    Set Variable    WEBHELP_WC_Dashboard__results_page

    Go to Search Page
    Find Dashboard By ID Then Execute The First Dashboard    ${DashboardId}

    Open Dashboard Publishing Popup
    Update Popup Position    css=.popupPublishSettings

    Crop Go To Angle Icon

Crop Go To Angle Icon
    Execute JavaScript
    ...   var widgets = dashboardPageHandler.HandlerState.Widgets();
    ...   widgets[0].is_public = false;
    ...   dashboardPageHandler.HandlerState.Widgets([]);
    ...   dashboardPageHandler.HandlerState.Widgets(widgets);
    Crop WebHelp Image  WC_Go_to_Angle.png  css=#popupPublishSettings .widget-link  ${False}