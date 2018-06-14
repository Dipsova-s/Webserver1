*** Variables ***
${rdoShowActivePackage}                                          jquery=input[name=FilterPackages][value=active]
${rdoShowInactivePackage}                                        jquery=input[name=FilterPackages][value=inactive]
${rdoShowAllPackage}                                             jquery=input[name=FilterPackages][value=all]

*** Keywords ***
Click Inactive Radio Button
    Wait Until Page Contains Element    ${rdoShowInactivePackage}
    Click Element    ${rdoShowInactivePackage}
