*** Keywords ***
Screenshot "WC_User_settings" page
    Go to Search Page
    Open User Settings Panel
    Update Popup Position    css=#SettingsPanel
    Click System Tab
    Crop System Settings Popup
    Close User Settings Panel

Crop System Settings Popup
    Crop WebHelp Image     WC_user_settings.png     css=#SettingsPanel