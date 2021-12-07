*** Settings ***
Resource            ${EXECDIR}/WC/POM/ManagementConsole/Models/ModelServer.robot

*** Keywords ***
Verify Reload Model Server Button
    ${txtModelServerStatus} =    Get Text    ${lblModelServerStatus}
    ${txtStartStopModelServer} =    Get Text    ${btnStartStopModelServer}
    Run Keyword If    '${txtModelServerStatus}' == 'Up'    Should Be Equal As Strings    '${txtStartStopModelServer}'    'Reload'
