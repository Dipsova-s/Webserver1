*** Keywords ***
Screenshot "WC_Jump" page
    ${AngleId}    Set Variable    WEBHELP_WC_Jump

    Find Angle By ID Then Execute The First Angle    ${AngleId}

    Crop Jump Icon

Crop Jump Icon
    Click Display Tab
    Change Display By Index    1
    Crop WebHelp Image  WC_jump_icon.png  css=#TabContentDisplay .icon-followup  ${False}