*** Keywords ***
Screenshot "WC_Angle_actions" page
    Go to Search Page
    Search By Text Without Double Quote    a
    Click Select First Item From Search Result
    Crop Search Action Buttons

    Open Mass Change Popup
    Crop Mass Change Unchange State Checkbox
    Click Close Mass Change Popup

Crop Search Action Buttons
    Crop WebHelp Image     WC_Select_All_Icon.png               css=#ActionDropdownListPopup .selectAll    ${False}
    Crop WebHelp Image     WC_Clear_Selection_Icon.png          css=#ActionDropdownListPopup .deSelect    ${False}
    Crop WebHelp Image     WC_Execute_As_Dashboard_Icon.png     css=#ActionDropdownListPopup .executeDashboard    ${False}
    Crop WebHelp Image     WC_Mass_Change_Icon.png              css=#ActionDropdownListPopup .massChange    ${False}
    Crop WebHelp Image     WC_Copy_Angle_Icon.png               css=#ActionDropdownListPopup .copyAngle    ${False}
    Crop WebHelp Image     WC_Delete_Angle_Icon.png             css=#ActionDropdownListPopup .delete    ${False}
    Crop WebHelp Image     WC_Upload_Angles_Icon.png            css=#ActionDropdownListPopup .uploadAngles    ${False}
    Crop WebHelp Image     WC_Download_Angles_Icon.png          css=#ActionDropdownListPopup .createEAPackage    ${False}

Crop Mass Change Unchange State Checkbox
    Crop WebHelp Image     WC_checkbox_unequal.png              jquery=#popupMassChangePopup .chkIndeterminatable.empty:eq(0)    ${False}