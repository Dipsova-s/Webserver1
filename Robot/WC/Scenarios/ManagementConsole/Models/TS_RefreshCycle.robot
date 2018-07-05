*** Settings ***
Resource            ${EXECDIR}/WC/POM/ManagementConsole/Models/RefreshCycle.robot

*** Keywords ***
Go To Refresh Cycle Page
    Wait Side Menu Ready
    Click Side Menu Models
    Click Side Menu Models EA2_800
    Click Side Menu Refresh Cycle
    Wait Until Refresh Cycle Page Loaded

Go To Refresh Cycle Page With Admin User
    Go to MC Then Login With Admin User
    Wait Until Overview Page Loaded
    Go To Refresh Cycle Page

Reload Refresh Cycle Page
    Click Side Menu Refresh Cycle
    Wait Until Refresh Cycle Page Loaded

Set Refresh Cycle Time Detail
    [Arguments]    ${refreshCycleName}          ${refreshCycleTime}
    Click Add Refresh Cycle
    Fill Refresh Cycle Name                     ${refreshCycleName}
    Select Refresh Cycle Action List Dropdown     Conversion
    Click Refresh Cycle Sunday
    Input Refresh Cycle Start Time              ${refreshCycleTime}
    Click Contiinuous Refresh Cycle
    Input Refresh Cycle Restart Delay           ${refreshCycleTime}
    Input Refresh Cycle Until                   ${refreshCycleTime}
    Input Refresh Cycle Maximum Runtime         ${refreshCycleTime}
    Click Save Refresh Cycle Form

Eidt Refresh Cycle Time Detail
    [Arguments]    ${refreshCycleName}          ${refreshCycleTime}
    Fill Refresh Cycle Name                     ${refreshCycleName}
    Click Refresh Cycle Monday
    Input Refresh Cycle Start Time              ${refreshCycleTime}
    Input Refresh Cycle Restart Delay           ${refreshCycleTime}
    Input Refresh Cycle Until                   ${refreshCycleTime}
    Input Refresh Cycle Maximum Runtime         ${refreshCycleTime}
    Click Save Refresh Cycle Form

Verify Refresh Cycle After Set
    [Arguments]    ${refreshCycleName}                  ${refreshCycleTime}
    Click Edit Refresh Cycle By Name                    ${refreshCycleName}
    Refresh Cycle Name Should Be Equal                  ${refreshCycleName}
    Refresh Cycle Start Time Should Be Equal            ${refreshCycleTime}
    Refresh Cycle Restart Delay Should Be Equal         ${refreshCycleTime}
    Refresh Cycle Until Should Be Equal                 ${refreshCycleTime}
    Refresh Cycle Maximum Runtime Should Be Equal       ${refreshCycleTime}