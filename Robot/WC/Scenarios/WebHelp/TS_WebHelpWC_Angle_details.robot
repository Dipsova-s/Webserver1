*** Keywords ***
Screenshot "WC_Angle_details" page
    ${AngleId}    Set Variable    WEBHELP_WC_Angle_details

    Go to Search Page
    Find Angle By ID Then Execute The First Angle    ${AngleId}

    Click Angle Tab
    Set Editor Context: Angle Tab

    Crop Angle Details
    Crop Field Chooser Popup
    Crop Add Filter Before Jump Button
    Crop Edit Filter Button
    Crop Undo Button
    Crop Angle Publishing Popup

Crop Angle Details
    Collapse All Angle Section Panels
    ${width}  ${height}  Get Element Size  css=#TabContentAngle
    ${tabWidth}  ${tabHeight}  Get Element Size  css=#TabDetails .tab-menu-wrapper
    Crop WebHelp Image With Dimensions  WC_Angle_Details.png  css=#TabDetails  0  0  ${width}  ${height}+${tabHeight}
    Expand All Angle Section Panels

Crop Field Chooser Popup
    Click Add Filter
    Update Popup Position    jquery=.k-overlay + .k-window:visible
    Click Element    css=#popupFieldChooser_wnd_title
    Crop WebHelp Image  WC_add_filter_list.png  jquery=.k-overlay + .k-window:visible
    Close Field Chooser Popup

Crop Add Filter Before Jump Button
    Add Jump By Id    Material
    Mouse Over  css=#TabContentAngle .item-jump
    Crop WebHelp Image  WC_Icon_Filter_Before_Jump.png  css=#TabContentAngle .item-jump .action-add-filter    ${False}

Crop Edit Filter Button
    ${objectText}  Get Localization Text  object  object  objekt  objeto  objet
    Add Filter Before Jump On Angle  0  ${objectText}  ObjectType  ${TRUE}
    Crop WebHelp Image  WC_Icon_Edit.png  css=#TabContentAngle .item-filter .action-edit  ${False}

Crop Undo Button
    Crop WebHelp Image  WC_Icon_Undo.png  css=#TabContentAngle .btn-cancel
    Click Undo Filters And Jumps

Crop Angle Publishing Popup
    Open Angle Publishing Popup
    Update Popup Position    css=.popupPublishSettings
    Crop WebHelp Image  WC_ADPublishing.png  css=.popupPublishSettings