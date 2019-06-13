*** Variables ***
${lblLicensedTo}                   h2:contains(License) ~ .contentSectionInfoItem:contains(Licensed to) p
${lblLicensedExpiration}           h2:contains(License) ~ .contentSectionInfoItem:contains(Expiration date) p
${lblLicensedType}                 h2:contains(Model EA2_800) ~ .contentSectionInfoItem:contains(Licensed applications) p

${lblExpectedLicensedTo}            h3:contains(License) ~ .modelInfoItem:contains(Licensed to) div
${lblExpectedLicensedExpiration}    h3:contains(License) ~ .modelInfoItem:contains(License expiration date) div
${lblExpectedLicensedType}          h3:contains(License) ~ .modelInfoItem:contains(License type) div

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
    Wait Until Page Contains Element    jquery=${lblLicensedTo}
    ${LicensedTo}    Execute Javascript     return $.trim($('${lblLicensedTo}').text())
    [Return]    ${LicensedTo}

Get Licensed Expiration Date in License Page
    Wait Until Page Contains Element    jquery=${lblLicensedExpiration}
    ${LicensedExpiration}    Execute Javascript     return $.trim($('${lblLicensedExpiration}').text())
    [Return]    ${LicensedExpiration}

Get Licensed Type in License Page
    Wait Until Page Contains Element    jquery=${lblLicensedType}
    ${LicensedType}    Execute Javascript     return $.trim($('${lblLicensedType}').text())
    [Return]    ${LicensedType}

Get Licensed To in Overview Page
    Wait Until Page Contains Element    jquery=${lblExpectedLicensedTo}
    ${ExpectedLicensedTo}    Execute Javascript     return $.trim($('${lblExpectedLicensedTo}').text())
    [Return]    ${ExpectedLicensedTo}

Get Licensed Expiration Date in Overview Page
    Wait Until Page Contains Element    jquery=${lblExpectedLicensedExpiration}
    ${ExpectedLicensedExpiration}    Execute Javascript     return $.trim($('${lblExpectedLicensedExpiration}').text())
    [Return]    ${ExpectedLicensedExpiration}

Get Licensed Type in Overview Page
    Wait Until Page Contains Element    jquery=${lblExpectedLicensedType}
    ${ExpectedLicensedType}    Execute Javascript     return $.trim($('${lblExpectedLicensedType}').text())
    [Return]    ${ExpectedLicensedType}