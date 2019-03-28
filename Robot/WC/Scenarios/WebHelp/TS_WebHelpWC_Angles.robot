*** Keywords ***
Screenshot "WC_Angles" page
    ${AngleId}    Set Variable    WEBHELP_WC_Angles

    Find Angle By ID Then Execute The First Angle    ${AngleId}

    Set Window Size    1300   700
    Sleep    ${TIMEOUT_LARGEST}

    Crop Example List
    Change Display To First Chart
    Crop Example Chart

    Maximize Browser window
    Sleep    ${TIMEOUT_LARGEST}

Crop Example List
    Crop WebHelp Image  WC_Angle_result_list.png  css=body

Crop Example Chart
    Crop WebHelp Image  WC_Angle_result_table.png  css=body