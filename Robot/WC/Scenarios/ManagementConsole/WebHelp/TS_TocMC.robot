*** Settings ***
Resource            ${EXECDIR}/WC/POM/Shared/Help.robot
Resource            ${EXECDIR}/WC/POM/Shared/WebHelp.robot

*** Keywords ***
Go to Web Help Page of IT MC
    Click on Help icon in ITMC
    Click On Help Page Option

Search for Item using Search bar in IT MC Web Help
    [Arguments]     ${searchText}
    Search for Item using Search bar    ${searchText}

Verify Expanded Item In IT MC Webhelp Page TOC
    Wait Until Element Is Visible           ${leftPanelHelpPage}
    Element Should Contain       ${leftPanelHelpPage}     Management Console Overview
    Element Should Contain       ${leftPanelHelpPage}     Comments

Verify Collapsed Item In IT MC Webhelp Page TOC
    Element Should Not Contain       ${leftPanelHelpPage}     Management Console Overview
    Element Should Not Contain       ${leftPanelHelpPage}     Comments

Header text on Navigating to Sub section page Should be
    [Arguments]     ${expectedText}
    Click on Next page Navigation Arrow
    Click on Next page Navigation Arrow
    Header2 text of Web Help Page Should Be     ${expectedText}

Header text On Navigating to Sub section page using Breadcrumb link Should be
    [Arguments]     ${expectedLinkText}     ${expectedText}
    Click on Breadcrumb link    ${expectedLinkText}
    Header text of Web Help Page Should Be     ${expectedText}

Header2 text of Web Help Page Should Be
    [Arguments]     ${expectedText}
    Wait Until Element Is Visible   ${expectedHeader2Element}
    Page Should Contain Element     //div[@class='title']/h2[contains(text(), '${expectedText}')]

Header text of a page on clicking an Item link in left panel Should Be
    [Arguments]     ${expectedLinkText}     ${expectedText}
    Click on Item in Left Panel     ${expectedLinkText}
    Header2 text of Web Help Page Should Be     ${expectedText}