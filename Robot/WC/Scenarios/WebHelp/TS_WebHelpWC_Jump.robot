*** Keywords ***
Screenshot "WC_Jump" page
    ${AngleId}    Set Variable    WEBHELP_WC_Jump

    Find Angle By ID Then Execute The First Angle    ${AngleId}

    Set Window Size    1300   700
    Sleep    ${TIMEOUT_LARGEST}

    Crop Example List Display For Jump

    Click Toggle Angle
    Change Display By Index    1
    Crop Example Jump Display

    Crop Jump Icon
    
    Maximize Browser window
    Sleep    ${TIMEOUT_LARGEST}

Crop Example List Display For Jump
    Crop WebHelp Image  WC_Jump_AD_Header_Vendor.png  css=body

Crop Example Jump Display
    Crop WebHelp Image  WC_Jump_Controlling_Area.png  css=body

Crop Jump Icon
    Crop WebHelp Image With Dimensions  WC_jump_icon.png  css=#DisplayDescriptionWrapper .followup  0  0  16  25  ${False}