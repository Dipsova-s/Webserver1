*** Keywords ***
Screenshot "WC_Angle_results_page" page
    ${AngleId}    Set Variable    WEBHELP_WC_Angle_results_page

    Find Angle By ID Then Execute The First Angle    ${AngleId}
    
    Crop Angle Result Page

Crop Angle Result Page
    # Create 2 boxes
    Execute JavaScript
    ...    var box1Height = $('#AngleTableWrapper').offset().top;
    ...    var box2Height = $('#AngleGrid .k-grid-header').outerHeight() + ($('#AngleGrid .k-grid-content tr:eq(0)').outerHeight() * 15);
    ...    var boxHeight = box1Height + box2Height;
    ...    $('<div id="AngleResultBox" style="position:absolute;left:0;top:0;z-index:10000;width:100%;height:'+boxHeight+'px"><div class="box1" style="height:'+box1Height+'px"></div><div class="box2" style="height:'+box2Height+'px"></div></div>').appendTo('body');

    # hightlight 2 boxes and crop
    Highlight WebHelp Element  css=#AngleResultBox .box1  1
    Highlight WebHelp Element  css=#AngleResultBox .box2  2
    Set Crop Margin    0
    Crop WebHelp Image  WC_AngleOverview.png  css=#AngleResultBox
    Restore Crop Margin

    # crean up boxes
    Execute JavaScript    $('#AngleResultBox').remove();