*** Settings ***
Resource            ${EXECDIR}/WC/POM/ManagementConsole/GlobalSettings/BusinessProcess.robot
Resource            ${EXECDIR}/WC/POM/ManagementConsole/Overview.robot

*** Keywords ***
Go to Business Process
    Go To MC Page    /Global%20settings/Business%20Processes/
    Wait Until Business Process Page Loaded

Create New Business Process
    [Arguments]    ${businessProcssName}
    Click Add Business Process    ${businessProcssName}
    Fill Abbreviation In New Business Process    ${businessProcssName}
    Fill English In New Business Process    ${businessProcssName}
    Fill German In New Business Process    ${businessProcssName}
    Fill Spanish In New Business Process    ${businessProcssName}
    Fill French In New Business Process    ${businessProcssName}
    Fill Dutch In New Business Process    ${businessProcssName}
    Click Save Business Process Without Delete

Delete Business Process
    [Arguments]    ${businessProcssName}
    Click Delete Business Process By Abbreviation    ${businessProcssName}
    Click Save And Delete Business Process

Delete Multiple Business Process
    [Arguments]    ${businessProcssName}    ${businessProcssName2}
    Click Delete Business Process By Abbreviation    ${businessProcssName}
    Click Delete Business Process By Abbreviation    ${businessProcssName2}
    Click Save And Delete Business Process