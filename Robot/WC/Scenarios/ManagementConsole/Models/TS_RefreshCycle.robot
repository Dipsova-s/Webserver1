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
    Go To Refresh Cycle Page

Reload Refresh Cycle Page
    Click Side Menu Refresh Cycle
    Wait Until Refresh Cycle Page Loaded

Set Refresh Cycle Time Detail
    [Arguments]    ${refreshCycleName}          ${refreshCycleTime}
    Click Add Refresh Cycle
    Fill Refresh Cycle Name                     ${refreshCycleName}
    Set Refresh Cycle Action List               Conversion
    Click Refresh Cycle Sunday
    Input Refresh Cycle Start Time              ${refreshCycleTime}
    Click Contiinuous Refresh Cycle
    Input Refresh Cycle Restart Delay           ${refreshCycleTime}
    Input Refresh Cycle Until                   ${refreshCycleTime}
    Input Refresh Cycle Maximum Runtime         ${refreshCycleTime}
    Click Enabled Refresh Cycle
    Click Save Refresh Cycle Form

Edit Refresh Cycle Time Detail
    [Arguments]    ${refreshCycleName}          ${refreshCycleTime}
    Fill Refresh Cycle Name                     ${refreshCycleName}
    Click Refresh Cycle Monday
    Input Refresh Cycle Start Time              ${refreshCycleTime}
    Input Refresh Cycle Restart Delay           ${refreshCycleTime}
    Input Refresh Cycle Until                   ${refreshCycleTime}
    Input Refresh Cycle Maximum Runtime         ${refreshCycleTime}
    Click Save Refresh Cycle Form

Verify Filtering On Specify Tables
    [Arguments]    ${FilterKeyword}   
    Click Add Refresh Cycle
    Set Refresh Cycle Action List               Tables
    Click Specify Tebles Botton                         
    Filter Specify Tables By Keyword            ${FilterKeyword}
    Specify Tables Grid Should Contains         ${FilterKeyword}  

Verify Sorting On Specify Tables 
    [Arguments]    ${FirstRecordValue}  
    Sort ASC/DESC Column Headder On Specify Tables Popup 
    First Record On Table Should Equal          ${FirstRecordValue}    
    Click Close Specify Tables Popup

Verify Refresh Cycle After Set
    [Arguments]    ${refreshCycleName}                  ${refreshCycleTime}
    Click Edit Refresh Cycle By Name                    ${refreshCycleName}
    Refresh Cycle Name Should Be Equal                  ${refreshCycleName}
    Refresh Cycle Start Time Should Be Equal            ${refreshCycleTime}
    Refresh Cycle Restart Delay Should Be Equal         ${refreshCycleTime}
    Refresh Cycle Until Should Be Equal                 ${refreshCycleTime}
    Refresh Cycle Maximum Runtime Should Be Equal       ${refreshCycleTime}

Delete Refresh Cycle
    [Arguments]    ${refreshCycleName}
    Click Action Delete Refresh Cycle By Name           ${refreshCycleName}
    Click Delete Refresh Cycle By Name                  ${refreshCycleName}
    Click Confirm Delete Refresh Cycle

Check Field Elements
    Click Add Refresh Cycle
    Page Should Contain Name Field
    Page Should Contain External Field
    Page Should Contain Action List Field
    Page Should Contain Delta Field
    Page Should Contain New And Changed Tables Only Field
    Page Should Contain Day Field
    Page Should Contain Start Time Field
    Page Should Contain Delay Model Server Stop Field
    Page Should Contain Continuous Field
    Page Should Contain Restart Delay Field
    Page Should Contain Until Field
    Page Should Contain Maximum Run Time Field
    Page Should Contain Enabled Field
