*** Keywords ***
Screenshot "WC_Top_Bar" page
    Go to Search Page
    Select Search Filter Angle
    Crop Topbar Logo Button
    Crop Topbar Help Button
    Crop Topbar User Settings Button
    Crop Topbar User Button
    Crop Topbar Notification Button

Crop Topbar Logo Button
    # the same image as WC_EA_Logo.png
    Crop WebHelp Image With Dimensions    WC_Action_Button_Logo.png    css=#TopBar .Wrapper    15    3    150    41

Crop Topbar Help Button
    ${nodeIndex}   Execute JavaScript    return $('#Help').closest('li').prevAll().length;
    Crop WebHelp Image    WC_Action_Button_Help.png    jquery=#UserPanel li:eq(${nodeIndex})

Crop Topbar User Settings Button
    ${nodeIndex}   Execute JavaScript    return $('#Settings').closest('li').prevAll().length;
    Crop WebHelp Image    WC_Settings_Icon.png    jquery=#UserPanel li:eq(${nodeIndex})  ${False}

Crop Topbar User Button
    ${nodeIndex}   Execute JavaScript    return $('#UserControl').closest('li').prevAll().length;
    Crop WebHelp Image    WC_Action_Button_User_settings.png    jquery=#UserPanel li:eq(${nodeIndex})

Crop Topbar Notification Button
    Execute JavaScript    ko.dataFor($('#NotificationsFeed').get(0)).ViewModel.NumberOfNotify(2);
    ${nodeIndex}   Execute JavaScript    return $('#NotificationsFeed').closest('li').prevAll().length;
    Crop WebHelp Image    WC_Notifications_Icon.png    jquery=#UserPanel li:eq(${nodeIndex})    ${False}