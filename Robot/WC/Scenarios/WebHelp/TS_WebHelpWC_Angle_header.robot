*** Keywords ***
Screenshot "WC_Angle_header" page
    ${AngleId}    Set Variable    WEBHELP_WC_Angle_header

    Find Angle By ID Then Execute The First Angle    ${AngleId}

    Set Window Size    1600   700
    Sleep    ${TIMEOUT_LARGEST}

    Crop Angle Toggle Button

    Click Toggle Angle
    Crop Angle Details Panel
    Crop Display Action Buttons

    Open Display Dropdown
    Crop Displays Dropdown
    Crop Delete Display Button

    Maximize Browser window
    Sleep    ${TIMEOUT_LARGEST}

Crop Angle Toggle Button
    Crop WebHelp Image  WC_Expand_button.png  css=#ToggleAngle  ${False}

Crop Angle Details Panel
    Sleep    ${TIMEOUT_GENERAL}
    ${height}    Execute JavaScript    return $('#AngleTopBar').outerHeight()+$('#AngleField').outerHeight();
    Crop WebHelp Image With Dimensions  WC_Angle_Header_AD_Header_Vendor.png  css=#MainContainer  0  0  ${WINDOW_WIDTH}  ${height}

Crop Display Action Buttons
    Execute JavaScript  $('#ActionDropdownListPopup .actionDropdownItem').removeClass('disabled alwaysHide');
    Crop WebHelp Image  WC_Save_Display_Icon.png        css=#ActionDropdownListPopup .save  ${False}
    Crop WebHelp Image  WC_Save_Display_As_Icon.png     css=#ActionDropdownListPopup .saveAs  ${False}
    Crop WebHelp Image  WC_Copy_Display_Icon.png        css=#ActionDropdownListPopup .copydisplay  ${False}
    Crop WebHelp Image  WC_Paste_Display_Icon.png       css=#ActionDropdownListPopup .pastedisplay  ${False}
    Crop WebHelp Image  WC_Edit.png                     css=#ActionDropdownListPopup .editDisplay  ${False}
    Crop WebHelp Image  WC_Create_New_Display_Icon.png  css=#ActionDropdownListPopup .newDisplay  ${False}
    Crop WebHelp Image  WC_Create_List_Icon.png         css=#ActionDropdownListPopup .createList  ${False}
    Crop WebHelp Image  WC_Create_Chart_Icon.png        css=#ActionDropdownListPopup .createChart  ${False}
    Crop WebHelp Image  WC_Create_Pivot_Icon.png        css=#ActionDropdownListPopup .createPivot  ${False}
    Crop WebHelp Image  WC_Export_To_Excel_Icon.png     css=#ActionDropdownListPopup .exportToExcel  ${False}
    Crop WebHelp Image  WC_Export_To_CSV_Icon.png       css=#ActionDropdownListPopup .exportToCSV  ${False}
    Crop WebHelp Image  WC_Add_To_Dashboard_Icon.png    css=#ActionDropdownListPopup .addToDashboard  ${False}
    Crop WebHelp Image  WC_Add_Jump_Icon.png            css=#ActionDropdownListPopup .addFollowup  ${False}
    Crop WebHelp Image  WC_Schedule_Icon.png            css=#ActionDropdownListPopup .scheduleAngle  ${False}
    Crop WebHelp Image  WC_Find_Icon.png                css=#ActionDropdownListPopup .find  ${False}

Crop Displays Dropdown
    Execute JavaScript    $('#DisplayItemList .DisplayOption').show();

    ${dropdownWidth}  ${dropdownHeight}    Get Element Size   css=#SelectedDisplay
    ${dropdownItemsWidth}  ${dropdownItemsHeight}    Get Element Size   css=#DisplayListSelection
    ${height}    Evaluate  ${dropdownHeight}+${dropdownItemsHeight}
    ${left}    ${top}    Get Element Offset    css=#SelectedDisplay
    Crop WebHelp Image With Dimensions  WC_Display_select.png  css=body  ${left}  ${top}  ${dropdownWidth}  ${height}

Crop Delete Display Button
    Mouse Over    jquery=#DisplayItemList .ItemList:not(.ItemListSelected)
    Crop WebHelp Image  WC_delete_display.png  jquery=#DisplayItemList .ItemList:not(.ItemListSelected) .btnDelete  ${False}