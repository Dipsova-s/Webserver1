*** Keywords ***
Screenshot "WC_Dashboard__details" page
    ${DashboardId}    Set Variable    WEBHELP_WC_Dashboard__results_page

    Find Dashboard By ID Then Execute The First Dashboard    ${DashboardId}

    Open Dashboard Detail Popup
    Update Popup Position    css=.popupDashboardDetails
    Click Dashboard Detail General Tab
    Crop Dashboard Details "General" Tab

Crop Dashboard Details "General" Tab
    ${width}    Set Variable    285
    ${height}   Set Variable    340
    Click Element    css=#popupDashboardDetails_wnd_title
    Execute JavaScript    $('<div id="PopupDashboardDetailShadow" />').css({position:'absolute',left:0,top:0,width:${width},height:${height},'z-index':100000,'box-shadow':'inset -20px -20px 20px #fff'}).appendTo('.popupDashboardDetails');
    Crop WebHelp Image    WC_Dashboard_Details.png  css=#PopupDashboardDetailShadow
    Execute JavaScript    $('#PopupDashboardDetailShadow').remove();