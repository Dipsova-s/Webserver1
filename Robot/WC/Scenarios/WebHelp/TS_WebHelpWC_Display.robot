*** Keywords ***
Screenshot "WC_Display" page
    ${AngleId}    Set Variable    WEBHELP_WC_Display

    Find Angle By ID Then Execute The First Angle    ${AngleId}

    Set Window Size    1300   700
    Sleep    ${TIMEOUT_LARGEST}

    Crop Example Display List

    Change Display To First Chart
    Crop Example Display Chart
    
    Change Display To First Pivot
    Crop Example Display Pivot

    Maximize Browser window
    Sleep    ${TIMEOUT_LARGEST}

Crop Example Display List
    Crop WebHelp Image  WC_display_bl.png  css=body

Crop Example Display Chart
    Crop WebHelp Image  WC_display_gr.png  css=body

Crop Example Display Pivot
    Crop WebHelp Image  WC_display_pivot.png  css=body