*** Keywords ***
Screenshot "WC_Display_details" page
    ${AngleId}    Set Variable    WEBHELP_WC_Display_details

    Find Angle By ID Then Execute The First Angle    ${AngleId}
    Click Angle Dropdown Actions Edit Display
    Update Popup Position    css=.popupDisplayDetail
    
    Click Display Detail General Tab
    Crop Display Details "General" Tab

    Click Display Detail Filter And Jumps Tab
    Crop Display Details "Filters & Jumps" Tab

Crop Display Details "General" Tab
    Crop WebHelp Image  WC_DisplayDetailsGeneral.png  css=.popupDisplayDetail

Crop Display Details "Filters & Jumps" Tab
    Drag WebHelp Element To Location    jquery=#FilterWrapper .definitionList    jquery=#FilterWrapper .filterItem.first    .handler
    Crop WebHelp Image  WC_Drag_Display_Filter_to_Angle.png  css=.popupDisplayDetail
    Clear Dragging WebHelp Element    jquery=#FilterWrapper .definitionList