*** Keywords ***
Screenshot "WC_Search_bar" page
    Go to Search Page

    Crop Advance Search Button

    Open Advance Filters Popup
    Crop Advance Search Popup

Crop Advance Search Button
    Crop WebHelp Image     WC_Down_Arrow.png     css=#SearchButton    ${False}

Crop Advance Search Popup
    Crop WebHelp Image     WC_AdvancedFilters.png     css=.popupAdvanceFilter