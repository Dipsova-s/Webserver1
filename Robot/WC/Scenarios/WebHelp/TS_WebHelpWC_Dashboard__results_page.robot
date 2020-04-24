*** Keywords ***
Screenshot "WC_Dashboard__results_page" page
    ${DashboardId}    Set Variable    WEBHELP_WC_Dashboard__results_page
    
    Find Dashboard By ID Then Execute The First Dashboard    ${DashboardId}
    Click Dashboard Tab

    Set Window Size    1100   700
    Sleep    3s
    Crop Dashboard Results

    Maximize Browser window
    Sleep    ${TIMEOUT_LARGEST}

Crop Dashboard Results
    # Create 2 boxes
    Execute JavaScript
    ...    var boxCss = {
    ...         left: $('#ContentWrapper .side-content').outerWidth() - 3,
    ...         top: $('#ContentWrapper .side-content').offset().top - 3,
    ...         width: WC.Window.Width - $('#ContentWrapper .side-content').outerWidth() + 3,
    ...         height: $('#ContentWrapper .side-content').outerHeight() + 3
    ...    };
    ...    var box1Height = $('#DashboardField').outerHeight();
    ...    var box2Height = boxCss.height - box1Height + 3;
    ...    $('<div id="ResultBox" style="position:absolute;z-index:10000;"><div class="box1" style="height:'+box1Height+'px"></div><div class="box2" style="margin-top:-3px;height:'+box2Height+'px"></div></div>').appendTo('body');
    ...    $('#ResultBox').css(boxCss);

    Highlight WebHelp Element  css=#DashboardTopBar  1
    Highlight WebHelp Element  css=#ResultBox .box1  2
    Highlight WebHelp Element  css=#ContentWrapper .side-content  3
    Update Heightlight Box  top  -3
    Update Heightlight Box  height  3
    Highlight WebHelp Element  css=#ResultBox .box2  4
    Set Crop Margin    0
    Crop WebHelp Image  WC_Dashboard_Results.png  css=body
    Restore Crop Margin

    # crean up boxes
    Execute JavaScript    $('#ResultBox').remove();