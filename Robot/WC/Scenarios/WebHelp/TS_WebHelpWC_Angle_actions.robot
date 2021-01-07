*** Keywords ***
Screenshot "WC_Angle_actions" page
    Go to Search Page
    Select Search Filter Angle
    Crop Search Action Buttons

Crop Search Action Buttons
    Click Select First Item From Search Result
    Crop WebHelp Image     WC_Select_All_Icon.png               css=#ActionDropdownListPopup .selectAll    ${False}
    Crop WebHelp Image     WC_Clear_Selection_Icon.png          css=#ActionDropdownListPopup .deSelect    ${False}
    Crop WebHelp Image     WC_Execute_As_Dashboard_Icon.png     css=#ActionDropdownListPopup .executeDashboard    ${False}
    Crop WebHelp Image     WC_Mass_Change_Icon.png              css=#ActionDropdownListPopup .massChange    ${False}
    Crop WebHelp Image     WC_Copy_Angle_Icon.png               css=#ActionDropdownListPopup .copyAngle    ${False}
    Crop WebHelp Image     WC_Delete_Angle_Icon.png             css=#ActionDropdownListPopup .delete    ${False}
    Crop WebHelp Image     WC_Upload_Angles_Icon.png            css=#ActionDropdownListPopup .upload    ${False}
    Crop WebHelp Image     WC_Download_Angles_Icon.png          css=#ActionDropdownListPopup .download    ${False}