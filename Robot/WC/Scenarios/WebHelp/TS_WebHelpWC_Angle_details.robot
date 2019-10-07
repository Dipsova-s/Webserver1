*** Keywords ***
Screenshot "WC_Angle_details" page
    ${AngleId}    Set Variable    WEBHELP_WC_Angle_details

    Find Angle By ID Then Execute The First Angle    ${AngleId}
    Open Angle Detail Popup
    Update Popup Position    css=.popupAngleDetail

    Click Angle Detail General Tab
    Crop Angle Details Popup
    Crop Angle Details "General" Tab

    Click Angle Detail Description Tab
    Crop Angle Details "Description" Tab

    Click Angle Detail Definition Tab
    Crop Angle Details "Definition" Tab

    Click Add Filter In Definition Tab
    Update Popup Position    jquery=.k-overlay + .k-window:visible
    Crop Field Chooser Popup
    Close Field Chooser Popup

    Click Add Jump In Definition Tab
    Click Select Jump by Id    Material
    Click Add Jump Button
    Crop Add Filter Before Jump Button
    Close Angle Detail Popup

    Open Angle Publishing Popup
    Update Popup Position    css=.popupPublishSettings
    Crop Angle Details "Publishing" Tab

Crop Angle Details Popup
    Crop WebHelp Image    WC_Angle_Details.png  css=.popupAngleDetail

Crop Angle Details "General" Tab
    ${width}    Set Variable    285
    ${height}   Set Variable    288
    Click Element    css=#popupAngleDetail_wnd_title
    Execute JavaScript    $('<div id="PopupAngleDetailShadow" />').css({position:'absolute',left:0,top:0,width:${width},height:${height},'z-index':100000,'box-shadow':'inset -20px -20px 20px #fff'}).appendTo('.popupAngleDetail');
    Crop WebHelp Image    WC_ADGeneral.png  css=#PopupAngleDetailShadow
    Execute JavaScript    $('#PopupAngleDetailShadow').remove();

Crop Angle Details "Description" Tab
    Click Element    css=#popupAngleDetail_wnd_title
    Crop WebHelp Image  WC_ADDescription.png  css=.popupAngleDetail

Crop Angle Details "Definition" Tab
    Click Element    css=#popupAngleDetail_wnd_title
    Crop WebHelp Image  WC_Angle_Definition_Tab.png  css=.popupAngleDetail

Crop Angle Details "Publishing" Tab
    Crop WebHelp Image  WC_ADPublishing.png  css=.popupPublishSettings

Crop Field Chooser Popup
    Click Element    css=#popupFieldChooser_wnd_title
    Crop WebHelp Image  WC_add_filter_list.png  jquery=.k-overlay + .k-window:visible

Crop Add Filter Before Jump Button
    Crop WebHelp Image  WC_Add_Filter_Before_Jump_Icon.png  css=.btnAddFilterFromJump    ${False}