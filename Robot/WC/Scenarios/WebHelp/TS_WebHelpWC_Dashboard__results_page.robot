*** Keywords ***
Screenshot "WC_Dashboard__results_page" page
    ${DashboardId}    Set Variable    WEBHELP_WC_Dashboard__results_page
    
    Find Dashboard By ID Then Execute The First Dashboard    ${DashboardId}

    Set Window Size    1100   700
    Sleep    3s
    Crop Dashboard Results

    Maximize Browser window
    Sleep    ${TIMEOUT_LARGEST}

Crop Dashboard Results
    Execute JavaScript
    ...   var height=$('#AngleTopBar').outerHeight()+$('#DashboardField').outerHeight();
    ...   var width=$(window).width();
    ...   var css={width:width,height:height,position:'absolute',left:0,top:0,'z-index':10000};
    ...   $('<div id="dashboardTopSection" />').css(css).appendTo('body');
    Highlight WebHelp Element  css=#dashboardTopSection  1
    Highlight WebHelp Element  css=#dashboardFilterWrapper  2
    Highlight WebHelp Element  css=#dashboardWrapper  3
    Crop WebHelp Image  WC_Dashboard_Results.png     css=body