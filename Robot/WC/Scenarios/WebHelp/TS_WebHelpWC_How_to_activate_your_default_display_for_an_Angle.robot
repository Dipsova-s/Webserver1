*** Keywords ***
Screenshot "WC_How_to_activate_your_default_display_for_an_Angle" page
    ${AngleId}    Set Variable    WEBHELP_WC_Angle_header

    Find Angle By ID Then Execute The First Angle    ${AngleId}

    Crop Angle Toggle Button
    Open Display Dropdown
    Crop Displays Dropdown For Default Display

Crop Displays Dropdown For Default Display
    ${dropdownWidth}  ${dropdownHeight}    Get Element Size   css=#SelectedDisplay
    ${dropdownItemsWidth}  ${dropdownItemsHeight}    Get Element Size   css=#DisplayListSelection
    ${height}    Evaluate  ${dropdownHeight}+${dropdownItemsHeight}
    ${left}    ${top}    Get Element Offset    css=#SelectedDisplay
    Crop WebHelp Image With Dimensions  WC_display_dropdown.png  css=body  ${left}  ${top}  ${dropdownWidth}  ${height}