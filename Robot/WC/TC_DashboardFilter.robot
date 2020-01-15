*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Test Teardown       Go to Search Page
Force Tags          acc_wc    smk_content

*** Test Cases ***
Verify When Angle That Used In The Dashboard Have Filter, And Dashboard Have Filter Itself
    ${searchText}  Set Variable  Angle For General Test
    ${dashboardName}  Set Variable  [ROBOT] Verify When Angle That Used In The Dashboard Have Filter, And Dashboard Have Filter Itself
    
    Create Dashboard From Specific Angle Name    ${searchText}    ${dashboardName}
    Add Filter To Dashboard    "Execution Status"    ExecutionStatus   is equal to    Open
    
    First Filter In Dashboard Popup Should Be Equal    ${dashboardName}    is equal to Open
    First Filter In Dashboard Sidebar Should Be Equal    (Self) - Execution status is equal to Open

    [Teardown]  Back To Search And Delete Dashboard Are Created    ${dashboardName}

Verify Apply Multi Filter To Dashboard
    ${searchText}  Set Variable  Angle For Dashboard Filter
    ${dashboardName}  Set Variable  [ROBOT] Verify Apply Multi Filter To Dashboard

    ${orderDueDate}  Set Variable  (Self) - Order Due Date is after May/24/2016
    ${bottleneckType}  Set Variable  (Self) - Bottleneck Type is not empty

    ${expectedDashboardFilter1}  Create List  ${orderDueDate}
    ${unExpectedDashboardFilter1}  Create List  ${bottleneckType}
    ${expectedDashboardFilter2}  Create List  ${orderDueDate}    ${bottleneckType}

    Create Achoc Dashboard     ${searchText}
    Input Dashboard Name    ${dashboardName} 
    Save Dashboard

    Add Filters To Dashboard
    Total Filters In Dashboard Should Be Equal    4
    Open Dashboard Popup And Remove Filter By index    4
    Total Filters In Dashboard Should Be Equal    2

    Verify Filters In Angle When Open Angle From Dashboard Page    0    ${expectedDashboardFilter1}    ${unExpectedDashboardFilter1}
    Verify Filters In Angle When Open Angle From Dashboard Page    1    ${expectedDashboardFilter2}

    [Teardown]  Back To Search And Delete Dashboard Are Created    ${dashboardName}
