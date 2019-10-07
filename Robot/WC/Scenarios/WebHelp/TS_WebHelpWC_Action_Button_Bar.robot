*** Keywords ***
Screenshot "WC_Action_Button_Bar" page
    Go to Search Page

    Crop Action Create Angle Button
    Crop Action Search Bar

    Search By Text Without Double Quote    a
    Click Select First Item From Search Result
    
    Crop Action List Icons
    Crop Action Mode Button
    Crop Action Button Sort

Crop Action Create Angle Button
    Crop WebHelp Image     WC_Action_Button_Create.png     css=#CreateNewAngleButtonWrapper

Crop Action Search Bar
    Crop WebHelp Image     WC_Action_Button_Search.png     css=#Search

Crop Action List Icons
    Crop WebHelp Image     WC_action_icons.png    css=#ActionSelect    ${False}

Crop Action Mode Button
    Crop WebHelp Image    WC_Action_Button_Compact_Mode.png    css=#ShortList       ${False}
    Crop WebHelp Image    WC_Action_Button_Details_Mode.png    css=#DisplaysList    ${False}

Crop Action Button Sort
    Crop WebHelp Image    WC_Action_Button_Sort_by.png   css=#SearchSortingView .search-sorting-item:last-child