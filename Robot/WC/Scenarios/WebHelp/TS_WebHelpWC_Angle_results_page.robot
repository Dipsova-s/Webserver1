*** Keywords ***
Screenshot "WC_Angle_results_page" page
    ${AngleId}    Set Variable    WEBHELP_WC_Angle_results_page

    Find Angle By ID Then Execute The First Angle    ${AngleId}
    Click Angle Tab  ${False}

    Set Window Size    1300   700
    Sleep    ${TIMEOUT_LARGEST}
    
    Crop Angle Result Page
    Crop Toggle Panel Button

    Maximize Browser window
    Sleep    ${TIMEOUT_LARGEST}

Crop Angle Result Page
    # Create 2 boxes
    Execute JavaScript
    ...    var boxCss = {
    ...         left: $('#ContentWrapper .side-content').outerWidth() - 3,
    ...         top: $('#ContentWrapper .side-content').offset().top - 3,
    ...         width: WC.Window.Width - $('#ContentWrapper .side-content').outerWidth() + 3,
    ...         height: $('#ContentWrapper .side-content').outerHeight() + 3
    ...    };
    ...    var box1Height = $('#AngleField .toolbar').outerHeight();
    ...    var box2Height = boxCss.height - box1Height + 3;
    ...    $('<div id="ResultBox" style="position:absolute;z-index:10000;"><div class="box1" style="height:'+box1Height+'px"></div><div class="box2" style="margin-top:-3px;height:'+box2Height+'px"></div></div>').appendTo('body');
    ...    $('#ResultBox').css(boxCss);

    # hightlight 2 boxes and crop
    Highlight WebHelp Element  css=#AngleTopBar  1
    Highlight WebHelp Element  css=#ResultBox .box1  2
    Highlight WebHelp Element  css=#ContentWrapper .side-content  3
    Update Heightlight Box  top  -3
    Update Heightlight Box  height  3
    Highlight WebHelp Element  css=#ResultBox .box2  4
    Set Crop Margin    0
    Crop WebHelp Image  WC_AngleOverview.png  css=body
    Restore Crop Margin

    # crean up boxes
    Execute JavaScript    $('#ResultBox').remove();

Crop Toggle Panel Button
    Crop WebHelp Image  WC_Hamburger_Icon.png  css=#ButtonToggleSidePanel  ${False}