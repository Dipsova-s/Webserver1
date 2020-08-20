*** Variables ***
${breadcrumb}                    css=.breadcrumb-wrapper
${breadcrumbLinkSearch}          ${breadcrumb} .breadcrumb-item:nth-child(1) .breadcrumb-label.breadcrumb-link
${breadcrumbLinkItem}            ${breadcrumb} .breadcrumb-item:nth-child(2) .breadcrumb-label.breadcrumb-link
${breadcrumbLabelItem}           ${breadcrumb} .breadcrumb-item:nth-child(2) .breadcrumb-label:not(.breadcrumb-link)
${breadcrumbLabelDrilldown}      ${breadcrumb} .breadcrumb-item:nth-child(3) .breadcrumb-label:not(.breadcrumb-link)
${breadcrumbIconValidated}       ${breadcrumb} .breadcrumb-item:nth-child(2) .icon-validated

*** Keywords ***
Click Search Results Link
    Wait Until Element Is Visible                   ${breadcrumbLinkSearch}
    Click Element                                   ${breadcrumbLinkSearch}
    Wait Search Page Document Loaded

Click Item Link
    Click Element                                   ${breadcrumbLinkItem}
    Wait Angle Page Document Loaded

Page Should Contain Search Results Link
    Wait Until Page Contains Element                ${breadcrumbLinkSearch}
    Page Should Contain Element                     ${breadcrumbLinkSearch}

Page Should Contain Item Link
    Wait Until Page Contains Element                ${breadcrumbLinkItem}
    Page Should Contain Element                     ${breadcrumbLinkItem}

Page Should Contain Item Label
    Wait Until Page Contains Element                ${breadcrumbLabelItem}
    Page Should Contain Element                     ${breadcrumbLabelItem}

Page Should Contain Drilldown Label
    Wait Until Page Contains Element                ${breadcrumbLabelDrilldown}
    Page Should Contain Element                     ${breadcrumbLabelDrilldown}

Page Should Contain Validated Icon
    Wait Until Page Contains Element                ${breadcrumbIconValidated}
    Page Should Contain Element                     ${breadcrumbIconValidated}

Page Should Not Contain Validated Icon
    Wait Until Page Does Not Contain Element        ${breadcrumbIconValidated}
    Page Should Not Contain Element                 ${breadcrumbIconValidated}