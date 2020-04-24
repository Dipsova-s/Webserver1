*** Keywords ***
Screenshot "WC_Angle_header" page
    ${AngleId}    Set Variable    WEBHELP_WC_Angle_header
    ${AngleId2}    Set Variable    WEBHELP_WC_Angle_details

    Find Angle By ID Then Execute The First Angle    ${AngleId}

    Set Window Size    1600   700
    Sleep    ${TIMEOUT_LARGEST}

    Crop Angle Details Panel
    Crop Display Action Buttons
    Crop Save Action Buttons
    Crop Create New Display Button

    Maximize Browser window
    Sleep    ${TIMEOUT_LARGEST}

    Find Angle By ID Then Execute The First Angle    ${AngleId2}
    Crop Publishing Buttons
    Crop Validating Buttons

Crop Angle Details Panel
    Sleep    ${TIMEOUT_GENERAL}
    Click Angle Tab
    ${width}    Execute JavaScript    return $('#AngleTopBar').outerWidth();
    ${height}    Execute JavaScript    return $('#AngleTopBar').outerHeight()+$('#AngleField').outerHeight();
    Crop WebHelp Image With Dimensions  WC_Angle_Header_AD_Header_Vendor.png  css=#MainContainer  0  0  ${width}  ${height}

Crop Display Action Buttons
    Execute JavaScript  $('#ActionDropdownListPopup .actionDropdownItem').removeClass('disabled alwaysHide');
    Execute JavaScript  $('#ActionSelect').width(480);
    Crop WebHelp Image  WC_Copy_Display_Icon.png        css=#ActionDropdownListPopup .copydisplay  ${False}
    Crop WebHelp Image  WC_Paste_Display_Icon.png       css=#ActionDropdownListPopup .pastedisplay  ${False}
    Crop WebHelp Image  WC_Export_To_Excel_Icon.png     css=#ActionDropdownListPopup .exportToExcel  ${False}
    Crop WebHelp Image  WC_Export_To_CSV_Icon.png       css=#ActionDropdownListPopup .exportToCSV  ${False}
    Crop WebHelp Image  WC_Add_Jump_Icon.png            css=#ActionDropdownListPopup .addFollowup  ${False}
    Crop WebHelp Image  WC_Schedule_Icon.png            css=#ActionDropdownListPopup .scheduleAngle  ${False}
    Crop WebHelp Image  WC_Find_Icon.png                css=#ActionDropdownListPopup .find  ${False}

Crop Save Action Buttons
    Click Display Tab
    Select Checkbox Execute On Login
    Crop WebHelp Image  WC_Button_Save_Active.png       css=#AngleSavingWrapper .saving-wrapper
    Unselect Checkbox Execute On Login
    Highlight WebHelp Element  css=#AngleSavingWrapper .btn-saving-options
    Crop WebHelp Image  WC_Button_Save_Caret.png        css=#AngleSavingWrapper .saving-wrapper

Crop Create New Display Button
    Crop WebHelp Image  WC_Create_New_Display_Icon.png  css=#BtnNewDisplay  ${False}

Crop Publishing Buttons
    Execute JavaScript  anglePageHandler.HandlerState.Data.is_published(false);
    Crop WebHelp Image  WC_Publish_button.png        css=#ShowPublishSettingsButton
    Execute JavaScript  anglePageHandler.HandlerState.Data.is_published(true);
    Crop WebHelp Image  WC_Published_button.png      css=#ShowPublishSettingsButton

Crop Validating Buttons
    Execute JavaScript  anglePageHandler.HandlerState.Data.authorizations().unvalidate = true;
    Execute JavaScript  anglePageHandler.HandlerState.Data.is_validated(false);
    Crop WebHelp Image  WC_Validate_button.png       css=#ShowValidateButton
    Execute JavaScript  anglePageHandler.HandlerState.Data.is_validated(true);
    Crop WebHelp Image  WC_Validated_button.png      css=#ShowValidateButton