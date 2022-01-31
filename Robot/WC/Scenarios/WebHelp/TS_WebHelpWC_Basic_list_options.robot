*** Keywords ***
Screenshot "WC_Basic_list_options" page
    ${AngleId}    Set Variable    WEBHELP_WC_Basic_list_options

    Find Angle By ID Then Execute The First Angle    ${AngleId}

    Click Display Tab
    Set Editor Context: Display Tab

    Resize WebHelp Window    1300   ${WINDOW_HEIGHT}
    Crop Remove List Display Column
    Crop Add New Column Button
    Maximize WebHelp Window

    Crop Suggested Filter
    Crop Add Filter Panel
    Crop Open Filter List Button
    Crop Field Category Icons

Crop Add New Column Button
    Crop WebHelp Image  WC_Plus.png  css=#AddNewColumn  ${False}

Crop Suggested Filter
    Click Add New Column To List
    ${left}    ${top}    Get Element Offset    css=#suggested + .label
    ${width}    ${height}    Get Element Size    css=#suggested + .label
    Crop WebHelp Image With Dimensions    WC_suggested.png    css=body  ${left}  ${top - 3}  ${width}  ${height + 5}
    Close Field Chooser Popup

Crop Remove List Display Column
    ${width}    ${height}    Get Element Size    css=#AngleGrid
    Drag WebHelp Element To Location    jquery=#AngleGrid   jquery=#AngleGrid [data-field="Material__Material"]    left=20    top=-90
    Sleep  3s
    Crop WebHelp Image With Dimensions  WC_drop.png  css=#MainContainer    0    0    ${width}    323
    Clear Dragging WebHelp Element    jquery=#AngleGrid

Crop Add Filter Panel
    Click Header by Data Field Angle Grid List Display    Quantity
    Click Show Add Filter Popup From List Header Column
    Crop WebHelp Image  WC_AddFilter.png  css=#TabContentDisplay .query-definition .editmode
    Click Undo Filters And Jumps

Crop Open Filter List Button
    Click Header by Data Field Angle Grid List Display    ObjectType
    Click Show Add Filter Popup From List Header Column
    Crop WebHelp Image  WC_Open_Filter_List.png  css=#TabContentDisplay .section-definition .action-popup  ${False}
    Click Undo Filters And Jumps

Crop Field Category Icons
    Click Header by Data Field Angle Grid List Display  ObjectType
    Click Show Field Info From List Header
    Execute JavaScript  var img=$('#HelpTextPopup .helpHeaderContainer img').attr('src');img=img.replace('ea_32', 'sap_32');$('#HelpTextPopup .helpHeaderContainer img').attr('src', img);
    Crop WebHelp Image  SAP_32.png  css=#HelpTextPopup .helpHeaderContainer img  ${False}
    Execute JavaScript  var img=$('#HelpTextPopup .helpHeaderContainer img').attr('src');img=img.replace('sap_32', 'reference_32');$('#HelpTextPopup .helpHeaderContainer img').attr('src', img);
    Crop WebHelp Image  reference_32.png  css=#HelpTextPopup .helpHeaderContainer img  ${False}
    Close Help Text Popup