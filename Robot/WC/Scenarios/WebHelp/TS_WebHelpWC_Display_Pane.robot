*** Keywords ***
Screenshot "WC_Display_Pane" page
    ${AngleId}    Set Variable    WEBHELP_WC_Display

    Find Angle By ID Then Execute The First Angle    ${AngleId}
    Click Display Tab

    Crop Display Pane

    Add Or Change Filter    ID     ID    has_value     ${TRUE}
    Create Chart From List Header Column  ObjectType  ObjectType  ${True}
    Mouse Over  jquery=#DisplayTabs .tab-menu:eq(0)
    Crop Delete Icon
    Crop Filter Icon
    Crop Adhoc Icon
    Crop Arrows Icon

Crop Display Pane
    ${tabLeft}  ${tabTop}  Get Element Offset  css=#DisplayTabs
    ${tabWidth}  ${tabHeight}  Get Element Size  css=#DisplayTabs
    ${tabOptionWidth}  ${tabOptionHeight}  Get Element Size  css=#DisplayOption
    ${gridHeaderWidth}  ${gridHeaderHeight}  Get Element Size  css=#AngleGrid .k-grid-header
    ${gridRowWidth}  ${gridRowHeight}  Get Element Size  css=#AngleGrid .k-grid-content tr
    Crop WebHelp Image With Dimensions  WC_Displays_Pane.png  css=body  ${tabLeft}  ${tabTop}  650  ${tabHeight}+${tabOptionHeight}+${gridHeaderHeight}+${gridRowHeight}*5

Crop Delete Icon
    Crop WebHelp Image  WC_Delete_Icon_red.png  jquery=#DisplayTabs .tab-menu:eq(0) .icon-close  ${False}

Crop Filter Icon
    Crop WebHelp Image  WC_Filter_Icon.png  jquery=#DisplayTabs .tab-menu:eq(0) .icon-filter  ${False}

Crop Adhoc Icon
    Crop WebHelp Image  WC_Yellow_Asterisk_Icon.png  jquery=#DisplayTabs .tab-menu:eq(0) .sign-unsaved  ${False}

Crop Arrows Icon
    Set Window Size    1000   700
    Sleep    ${TIMEOUT_LARGEST}
    Crop WebHelp Image With Dimensions  WC_Arrow_Icons.png  jquery=#DisplayTabs .right-btn-wrapper  6  1  45  20  ${False}
    Maximize Browser window
    Sleep    ${TIMEOUT_LARGEST}