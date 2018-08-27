*** Settings ***
Resource            ${EXECDIR}/WC/POM/ManagementConsole/Models/ModelServer.robot

*** Keywords ***
Verify Start/Stop Model Server Button
    ${txtModelServerStatus} =    Get Text    ${lblModelServerStatus}
    ${txtStartStopModelServer} =    Get Text    ${btnStartStopModelServer}
    Run Keyword If    '${txtModelServerStatus}' == 'Up'    Should Be Equal As Strings    '${txtStartStopModelServer}'    'Stop server'
    ...    ELSE                                            Should Be Equal As Strings    '${txtStartStopModelServer}'    'Start server'
