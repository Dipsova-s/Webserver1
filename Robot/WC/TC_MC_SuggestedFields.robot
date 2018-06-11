*** Settings ***
Resource                  ${EXECDIR}/resources/WCSettings.robot
Suite Setup               Go To Suggested Fields Page With Admin User
Suite Teardown            Logout MC Then Close Browser
Test Teardown             Reload Suggested Fields Page
Force Tags                MC    acc_mc

*** Variables ***
${ObjectName}             PD
${BusinessProcess}        S2D

*** Test Cases ***
Test Suggested Fields For Single Object
    Set Suggested Fields For Single Object    ${ObjectName}    ${BusinessProcess}
    Verify Suggested Fields After Set    ${ObjectName}    ${BusinessProcess}
    Click Clear All Suggested Fields

Test Suggested Fields For Basic List
    Set Suggested Fields For Basic List    ${ObjectName}    ${BusinessProcess}
    Set Suggested Fields For Clear All Suggestion    ${ObjectName}    ${BusinessProcess}

Test Suggested Fields For Default Template
    Set Suggested Fields For Default Template    ${ObjectName}    ${BusinessProcess}
    Set Suggested Fields For Clear All Suggestion    ${ObjectName}    ${BusinessProcess}

Test Suggested Fields For All Template
    Set Suggested Fields For All Template    ${ObjectName}    ${BusinessProcess}
    Set Suggested Fields For Clear All Suggestion    ${ObjectName}    ${BusinessProcess}