*** Settings ***
Resource            ${EXECDIR}/WC/POM/ManagementConsole/GlobalSettings/BusinessProcess.robot
Resource            ${EXECDIR}/WC/POM/ManagementConsole/Overview.robot

*** Keywords ***
Go to Business Process
    Click Side Menu Global Settings
    Click Side Menu Business Process

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