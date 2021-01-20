*** Keywords ***
Screenshot "WC_User_settings" page
    Go to Search Page
    Open User Settings Panel
    Update Popup Position    css=#SettingsPanel
    Click System Tab
    Close User Settings Panel

# Below keyword is not in use as of now
Crop System Settings Popup
    Crop WebHelp Image     WC_user_settings.png     css=#SettingsPanel