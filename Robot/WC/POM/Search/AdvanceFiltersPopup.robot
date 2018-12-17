*** Variables ***
#General
${divAdvFiltersPopup}           css=#popupAdvanceFilter
${btnAdvFiltersSearch}          css=#btn-popupAdvanceFilter0
${btnAdvFiltersClose}           css=#SearchButton

#Controls
${ddlAdvFilterPublicStatus}    dropdownPublicStatus_ddlWrapper
${ddlAdvFilterWarningStatus}    dropdownWarning_ddlWrapper
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

Select Advance Filter Publication Status Dropdown By Status Name
    [Arguments]    ${statusName}
    Scroll Vertical    ${divAdvFiltersPopup}    300
    Select Dropdown By Text    ${ddlAdvFilterPublicStatus}    ${statusName}

Publication Status Should Be "${statusName}"
    Element Should Contain    ${ddlAdvFilterPublicStatus}    ${statusName}

Select Advance Filter Warining Status Dropdown By Status Name
    [Arguments]    ${statusName}
    Scroll Vertical    ${divAdvFiltersPopup}    300
    Select Dropdown By Text    ${ddlAdvFilterWarningStatus}    ${statusName}

Warning Status Should Be "${statusName}"
    Element Should Contain    ${ddlAdvFilterWarningStatus}    ${statusName}