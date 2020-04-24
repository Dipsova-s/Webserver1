*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Resource            ${EXECDIR}/WC/Scenarios/Angle/TS_AngleState.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Force Tags          acc_wc    smk_content

*** Test Cases ***
Verify Apply Multi Filter To Dashboard
    [Documentation]     Verify applying filters to the dashboard's widget
    [Tags]      TC_C196803  acc_wc_aci
    ${searchText}  Set Variable  Angle For Dashboard Filter
    ${dashboardName}  Set Variable  [ROBOT] Verify Apply Multi Filter To Dashboard
    ${orderDueDate}  Set Variable  (Self) - Order Due Date is after May/24/2016
    ${bottleneckType}  Set Variable  (Self) - Bottleneck Type is not empty

    ${expectedDashboardFilter1}  Create List  ${orderDueDate}
    ${unExpectedDashboardFilter1}  Create List  ${bottleneckType}
    ${expectedDashboardFilter2}  Create List  ${orderDueDate}    ${bottleneckType}

    Create New Dashboard  ${searchText}  ${dashboardName}
    Click Dashboard Tab
    Set Editor Context: Dashboard Tab
    Add Filters To Dashboard

    Verify Filters In Angle When Open Angle From Dashboard Page    0    ${expectedDashboardFilter1}    ${unExpectedDashboardFilter1}
    Verify Filters In Angle When Open Angle From Dashboard Page    1    ${expectedDashboardFilter2}

    [Teardown]  Back To Search And Delete Dashboard Are Created    ${dashboardName}

Verify Dashboard For Allow Obtain More Details
    [Documentation]  Check the Add Filter icon is hidden when a Dashboard widget contains 'allow more details' is false'.
    ...              Risk/Cover area: The addfilter, drilldown the widget should apply state correctly
    [Tags]    TC_C228917   
    ${dashboardID}  Set Variable  ROBOT_ANGLE_Dashboard_AllowMoreDetails  
    [Setup]  Import Dashboard By API  /models/1  DASHBOARD_AllowMoreDetails.json  DASHBOARD_AllowMoreDetails.angles.json  user=${Username}
    Find Angle By ID Then Execute The First Angle    ${dashboardID}
    Set Angle To Not Allow User To Obtain More Details
    Back To Search
    Find Dashboard By ID Then Execute The First Dashboard    ${dashboardID}
    Verify Visibility Of Adding Filter In Dashboard Side Panel    ${False}

    [Teardown]  Clean Up Items And Go To Search Page 

