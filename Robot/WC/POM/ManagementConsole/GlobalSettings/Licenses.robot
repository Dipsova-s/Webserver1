*** Variables ***
${lblLicensedTo}                   mainContent .contentSectionInfo .contentSectionInfoItem:eq(0) p
${lblLicensedType}                 mainContent .contentSectionInfo .contentSectionInfoItem:eq(10) p


*** Keywords ***
Wait Until License Page Loaded
    Wait Until Page Contains    Licensed to
    Wait Until Page Contains    License
    Wait Until Page Contains    Limits
    Wait Until Page Contains    Features
    Sleep    ${TIMEOUT_LARGEST}
    Wait Until Ajax Complete
    Sleep    ${TIMEOUT_GENERAL}


Get Licensed To in License Page
    Wait Until Page Contains Element    jquery=#${lblLicensedTo}
    ${LicensedTo}    Execute Javascript     return $.trim($('#${lblLicensedTo}').text())
    [Return]    ${LicensedTo}

Get Licensed Type in License Page
    Wait Until Page Contains Element    jquery=#${lblLicensedType}
    ${LicensedType}    Execute Javascript     return $.trim($('#${lblLicensedType}').text())
    [Return]    ${LicensedType}
