*** Keywords ***
Screenshot "WC_User_settings" page
    Go to Search Page
    Open User Settings Popup
    Update Popup Position    css=.popupUserSetting
    Click System Settings Tab
    Crop System Settings Popup
    Click Close User Setting Popup

Crop System Settings Popup
    Crop WebHelp Image     WC_user_settings.png     css=.popupUserSetting