*** Variables ***
${breadcrumbLinkSearchResults}                      jquery=.breadcrumbLink:nth(0)
${breadcrumbLinkItem}                               jquery=.breadcrumbLink:nth(1)
${breadcrumbLabelItem}                                jquery=.breadcrumbLabel
${breadcrumbLabelDrilldownResults}                    jquery=.breadcrumbLabel
${breadcrumbIconValidated}                          jquery=.icon-breadcrumb-validated

*** Keywords ***
Click Search Results Link
    Click Element                                   ${breadcrumbLinkSearchResults}
    Wait Search Page Document Loaded

Click Item Link
    Click Element                                   ${breadcrumbLinkItem}
    Wait Angle Page Document Loaded

Page Should Contain Search Results Link
    Wait Until Page Contains Element                ${breadcrumbLinkSearchResults}
    Page Should Contain Element                     ${breadcrumbLinkSearchResults}

Page Should Contain Item Link
    Wait Until Page Contains Element                ${breadcrumbLinkItem}
    Page Should Contain Element                     ${breadcrumbLinkItem}

Page Should Contain Item Label
    Wait Until Page Contains Element                ${breadcrumbLabelItem}
    Page Should Contain Element                     ${breadcrumbLabelItem}

Page Should Contain Drilldown Label
    Wait Until Page Contains Element                ${breadcrumbLabelDrilldownResults}
    Page Should Contain Element                     ${breadcrumbLabelDrilldownResults}

Page Should Contain Validated Icon
    Wait Until Page Contains Element                ${breadcrumbIconValidated}
    Page Should Contain Element                     ${breadcrumbIconValidated}

Page Should Not Contain Validated Icon
    Wait Until Page Does Not Contain Element        ${breadcrumbIconValidated}
    Page Should Not Contain Element                 ${breadcrumbIconValidated}