*** Settings ***
Resource            ${EXECDIR}/WC/POM/ManagementConsole/Models/Modules.robot

*** Keywords ***
Go To All Modules Page
    Wait Side Menu Ready
    Click Side Menu Models
    Click Side Menu Models EA2_800
    Click Side Menu Modules
    Wait Until All Modules Page Loaded

Verify Modules Filter
    [Arguments]    ${keyword}
    Put Keyword ON Modules Filter    ${keyword}
    Press Key    ${txtFilterModules}    \\13
    Wait Until Element Is Visible    ${kwdModulesFilter}

Verify Modules Filter PopUp And Select CheckBox
    [Arguments]    ${keyword}
    Click Edit Long Text for Operations & confirmations
    Put Keyword ON Modules Filter PopUp    ${keyword}
    sleep    1s
    Wait Until Element Is Visible    ${trRowModulesPopUpGrid}:contains(${keyword})
    Wait Until Page contains    ${keyword}
    Select Long Text CheckBox After Filter And Save

Select CheckBox In SAPSCM And Save
    Select Operations & confirmations CheckBox
    Click Save Modules

UnSelect Modules CheckBox
    [Arguments]    ${keyword}
    Put Keyword ON Modules Filter    ${keyword}
    Press Key    ${txtFilterModules}    \\13
    UnSelect Operations & confirmations CheckBox
    UnSelect Edit Long Text for Operations & confirmations
    Click Save Modules
    Wait MC Progress Bar Closed
    Wait Until All Modules Page Loaded

Verify Sort Modules Alphabetically
    [Arguments]    ${OMkeyword}    ${PAkeyword}
    Put Keyword ON Modules Filter    ${OMkeyword}
    Press Key    ${txtFilterModules}    \\13
    Wait Until Element Is Visible    ${txtOM}:contains("${OMkeyword}")
    Wait Until Element Is Visible    ${txtPA}:contains("${PAkeyword}")