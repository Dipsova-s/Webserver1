*** Settings ***
Resource            ${EXECDIR}/WC/POM/Shared/Help.robot
Resource            ${EXECDIR}/WC/POM/Shared/WebHelp.robot

*** Keywords ***
Go to Web Help Page of WC
    Click on Help icon in WC
    Click On Help Page Option

Click On Subject Item On Webhelp Page TOC
    [Arguments]     ${subjectItem}
    Wait Until Ajax Complete
    Click Element      //aside[@class='site-sidebar']/ul[@class='toc nav nav-site-sidebar']/li/a[contains(text(),'${subjectItem}')]

Expand/Collapse Subject Item In Webhelp Page TOC
    [Arguments]     ${subjectItemToExpand}
    Wait Until Ajax Complete
    Click On Subject Item On Webhelp Page TOC        ${subjectItemToExpand}

Verify Expanded Item In Webhelp Page TOC
    Wait Until Element Is Visible           ${leftPanelHelpPage}
    Element Should Contain       ${leftPanelHelpPage}     Supporting concepts
    Element Should Contain       ${leftPanelHelpPage}     Navigating Every Angle
    Element Should Contain       ${leftPanelHelpPage}     User configuration

Verify Collapsed Item In Webhelp Page TOC
    Element Should Not Contain      ${leftPanelHelpPage}     Supporting concepts
    Element Should Not Contain      ${leftPanelHelpPage}     Navigating Every Angle
    Element Should Not Contain      ${leftPanelHelpPage}     User configuration

Header text of Web Help Page Should Be
    [Arguments]     ${expectedText}
    Wait Until Element Is Visible   ${expectedHeaderElement}
    Page Should Contain Element     //div[@class='title']/h1[contains(text(), '${expectedText}')]

Header text on Navigating to Main page of a Section Should be
    [Arguments]     ${expectedText}
    Click on Next page Navigation Arrow
    Click on Previous page Navigation Arrow
    Header text of Web Help Page Should Be      ${expectedText}

