*** Keywords ***
Screenshot "WC_How_to_use_Templates" page
    ${AngleId}    Set Variable    WEBHELP_WC_Templates
    Find Angle By ID Then Execute The First Angle    ${AngleId}
    Crop Angle Details Unposted FI Docs

Crop Angle Details Unposted FI Docs
    Open Angle Detail Popup
    Click Angle Detail Description Tab
    Update Popup Position    css=.popupAngleDetail
    Crop WebHelp Image     WC_Angle_Details_Unposted_FI_Docs.png     css=.popupAngleDetail  