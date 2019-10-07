*** Keywords ***
Screenshot "WC_Basic_list_options" page
    ${AngleId}    Set Variable    WEBHELP_WC_Basic_list_options

    Find Angle By ID Then Execute The First Angle    ${AngleId}

    Set Window Size    1300   ${WINDOW_HEIGHT}
    Sleep    ${TIMEOUT_LARGEST}
    Crop Remove List Display Column
    Crop Add New Column Button
    Maximize Browser window
    Sleep    ${TIMEOUT_LARGEST}

    Click Add New Column To List
    Crop Suggested Filter
    Close Field Chooser Popup

    Click Header by Data Field Angle Grid List Display    Quantity
    Click Sort Custom From List Header Column
    Crop Sort Custom Popup

    Click Format Field From Header Column
    Crop Format Field Popup

    Click Show Add Filter Popup From List Header Column
    Update Popup Position    css=.popupListFilter
    Crop Add Filter Popup
    Click Cancel Add Filter to list

    Click Header by Data Field Angle Grid List Display    ObjectType
    Click Show Add Filter Popup From List Header Column
    Update Popup Position    css=.popupListFilter
    Crop Open Filter List Button
    Click Cancel Add Filter to list

Crop Add New Column Button
    Crop WebHelp Image  WC_Plus.png  css=#AddNewColumn  ${False}

Crop Suggested Filter
    ${left}    ${top}    Get Element Offset    css=#suggested + .label
    ${width}    ${height}    Get Element Size    css=#suggested + .label
    Crop WebHelp Image With Dimensions    WC_suggested.png    css=body  ${left}  ${top - 3}  ${width}  ${height + 5}

Crop Remove List Display Column
    ${width}    ${height}    Get Element Size    css=#AngleGrid
    Drag WebHelp Element To Location    jquery=#AngleGrid    jquery=#AngleGrid [data-field="Material__Material"]    left=20    top=-80
    Crop WebHelp Image With Dimensions  WC_drop.png  css=#MainContainer    0    0    ${width}    323
    Clear Dragging WebHelp Element    jquery=#AngleGrid

Crop Sort Custom Popup
    ${menuLeft}   ${menuTop}       Get Element Offset    jquery=.HeaderPopupList:visible
    ${popupLeft}   ${popupTop}       Get Element Offset    jquery=.customSortPopup:visible
    Crop WebHelp Image With Dimensions  WC_custom_sort.png  css=#MainContainer  ${menuLeft}  ${popupTop}  580  411
    
Crop Format Field Popup
    ${menuLeft}   ${menuTop}       Get Element Offset    jquery=.HeaderPopupList:visible
    Crop WebHelp Image With Dimensions  WC_Format_Field.png  css=#MainContainer  ${menuLeft}  ${menuTop}  545  372

Crop Add Filter Popup
    Crop WebHelp Image  WC_AddFilter.png  css=.popupListFilter

Crop Open Filter List Button
    Crop WebHelp Image  WC_Open_Filter_List.png  css=.btnEnumPopup  ${False}