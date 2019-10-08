*** Keywords ***
Screenshot "WC_Search_bar" page
    Go to Search Page
    Search By Text Without Double Quote    a

    Crop Clear Search Button
    Crop Advance Search Button

    Open Advance Filters Popup
    Crop Advance Search Popup

Crop Clear Search Button
    Crop WebHelp Image     WC_Clear_Icon.png     css=#ClearSearchButton    ${False}

Crop Advance Search Button
    Crop WebHelp Image     WC_Down_Arrow.png     css=#SearchButton    ${False}

Crop Advance Search Popup
    Crop WebHelp Image     WC_AdvancedFilters.png     css=.popupAdvanceFilter