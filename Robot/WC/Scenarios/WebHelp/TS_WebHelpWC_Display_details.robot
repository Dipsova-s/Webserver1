*** Keywords ***
Screenshot "WC_Display_details" page
    ${AngleId}    Set Variable    WEBHELP_WC_Display_details

    Find Angle By ID Then Execute The First Angle    ${AngleId}
    Click Display Tab
    Collapse All Display Section Panels

    Crop Display Details

    Crop Innowera Template Icon

Crop Display Details
    ${width}  ${height}  Get Element Size  css=#TabContentDisplay
    ${tabWidth}  ${tabHeight}  Get Element Size  css=#TabDetails .tab-menu-wrapper
    Crop WebHelp Image With Dimensions  WC_Display_Details_Angle.png  css=#TabDetails  0  0  ${width}  ${height}+${tabHeight}

Crop Innowera Template Icon
    Select Excel Template To     RobotInnoweraTestTemplate.xlsx
    Crop WebHelp Image      WC_Icon_InnoweraTemplate.png     css=.icon-innowera    ${False}

