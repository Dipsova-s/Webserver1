*** Keywords ***
Screenshot "WC_Angles" page
    ${AngleId}    Set Variable    WEBHELP_WC_Angles

    Find Angle By ID Then Execute The First Angle    ${AngleId}

    Resize WebHelp Window    1300   700
    Change Display To First Chart
    Maximize WebHelp Window

# Below keywords not in use as of now
Crop Example List
    Crop WebHelp Image  WC_Angle_result_list.png  css=body

Crop Example Chart
    Crop WebHelp Image  WC_Angle_result_table.png  css=body