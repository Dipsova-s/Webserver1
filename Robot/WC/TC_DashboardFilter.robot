*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Test Teardown       Go to Search Page
Force Tags          acc_wc

*** Test Cases ***
Verify When Angle That Used In The Dashboard Have Filter, And Dashboard Have Filter Itself
    ${searchText}  Set Variable  Plant for Dashboard filter
    ${dashboardName}  Set Variable  [ROBOT] Dashboard Filter Add From Dashboard Name
    Create Dashboard From Specific Angle Name    ${searchText}    ${dashboardName}
    Add Dashboard Filter From Dashboard Name
    Verify Dashboard Filter Showing    ${dashboardName}
    Verify Editing Dashboard Filter
    Back To Search And Delete Dashboard Are Created    ${dashboardName}

Verify Apply Multi Filter To Dashboard
    ${searchText}  Set Variable  For Dashboard Filter
    ${dashboardName}  Set Variable  [ROBOT] Dashboard Filter Add From Filter Panel
    Create Dashboard From Many Angles     ${searchText}    ${dashboardName}
    Add Dashboard Filter From Dashboard Filter Panel
    Verify Dashboard Filters Count    4
    Verify Remove Field In Fields Tab
    Verify Dashboard Filters Count    2

    Open Angle In Dashboard Widget    0
    Check Dashboard Filters For Angle #1
    Open Angle In Dashboard Widget    1
    Check Dashboard Filters For Angle #2
    Open Angle In Dashboard Widget    2
    Check Dashboard Filters For Angle #3

    Back To Search And Delete Dashboard Are Created    ${dashboardName}