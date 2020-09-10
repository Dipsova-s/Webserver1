*** Keywords ***
Screenshot "WC_Display" page
    ${AngleId}    Set Variable    WEBHELP_WC_Display

    Find Angle By ID Then Execute The First Angle    ${AngleId}
    Resize WebHelp Window    1300   700
    
    Crop Example Display List
    Crop Example Display Chart
    Crop Example Display Pivot

    Maximize WebHelp Window

Crop Example Display List
    Crop WebHelp Image  WC_display_bl.png  css=body

Crop Example Display Chart
    Change Display To First Chart
    Crop WebHelp Image  WC_display_gr.png  css=body

Crop Example Display Pivot
    Change Display To First Pivot
    Crop WebHelp Image  WC_display_pivot.png  css=body