*** Settings ***
Resource            ${EXECDIR}/WC/POM/Shared/TocWc.robot

*** Keywords ***
Go to WebHelp Page
    Click Help icon in WC
    Click On Help Page Option In WC Help

Click On Subject Item On Webhelp Page Toc
    [Arguments]     ${subjectItem}
    Wait Until Ajax Complete
    Click Element      //aside[@class='site-sidebar']/ul[@class='toc nav nav-site-sidebar']/li/a[contains(text(),'${subjectItem}')]

Expand/Collapse Subject Item In Webhelp Page Toc
    [Arguments]     ${subjectItemToExpand}
    Wait Until Ajax Complete
    Click On Subject Item On Webhelp Page Toc        ${subjectItemToExpand}

Verify Expanded Item In Webhelp Page Toc
    Wait Until Element Is Visible           ${leftPanelHelpPage}
    Element Should Contain       ${leftPanelHelpPage}       Supporting concepts     Navigating Every Angle     User configuration

Verify Collapsed Item In Webhelp Page Toc
    Element Should Not Contain      ${leftPanelHelpPage}       Supporting concepts     Navigating Every Angle     User configuration


