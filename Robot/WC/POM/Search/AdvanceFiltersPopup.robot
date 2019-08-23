*** Variables ***
#General
${divAdvFiltersPopup}           css=#popupAdvanceFilter
${btnAdvFiltersSearch}          css=#btn-popupAdvanceFilter0
${btnAdvFiltersClose}           css=#SearchButton

#Controls
${txtIds}                       ids

*** Keywords ***
Input IDS Filter
    [Arguments]    ${ids}
    Scroll Vertical    ${divAdvFiltersPopup}    400
    Input Text    ${txtIds}   ${ids}

Submit Advance Filters Search
    Click Element    ${btnAdvFiltersSearch}
    Wait Progress Bar Search Closed

Close Advance Filters Popup
    Click Element    ${btnAdvFiltersClose}