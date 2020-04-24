*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Test Teardown       Go to Search Page
Force Tags          acc_wc    smk_content

*** Test Cases ***
Verify Dashboard Statistics
    [Documentation]     Dashboard statistics
    [Tags]              smk_wc  C229134
    ${searchText}  Set Variable  Angle For General Test
    ${dashboardName}  Set variable  [ROBOT] Test Verify Dashboard Statistics
    Create Adhoc Dashboard    ${searchText}  ${dashboardName}

    # adhoc
    Verify Adhoc Dashboard Statistics

    # saved
    Click Dashboard Save All
    Verify Saved Dashboard Statistics

    # edit mode
    Go to Search Page
    Search By Text And Expect In Search Result  ${dashboardName}
    Execute First Search Dashboard In Edit Mode
    Verify Edit Mode Dashboard Statistics

    [Teardown]  Back To Search And Delete Dashboard Are Created    ${dashboardName}

Verify Dashboard Execution Parameters
    Dashboard Execution Parameters

Verify Execute Dashboard With Execution Parameters In Edit Mode
    [Tags]  acc_wc_aci
    ${dashboardName}  Set variable  Dashboard with execute parameters in edit mode
    Execute Dashboard With Execution Parameters In Edit Mode    ${dashboardName}
    [Teardown]  Back To Search And Delete Dashboard Are Created    ${dashboardName}

Verify Dashboard Drilldown
    [Documentation]  Check drilldown 2 widgets in Dashboard.
    ...              One is a normal drilldown on Chart then get adhoc list Display.
    ...              Another one is a drilldown to Display on Pivot then get chart Display.
    [Tags]  TC_C228701
    [Setup]  Import Dashboard By API  /models/1  DASHBOARD_Drilldown.json  DASHBOARD_Drilldown.angles.json  user=${Username}

    Find Dashboard By ID Then Execute The First Dashboard  ROBOT_DASHBOARD_Drilldown
    Verify A Normal Drilldown On Chart Widget
    Verify A Drilldown To Display On Pivot Widget

    [Teardown]  Clean Up Items And Go To Search Page

Verify Dashboard Widget Definition
    [Documentation]  Create Dashboard then edit, add and delete Widget to existing Dashboard.
    ...              Risk/coverage area: Dashboard widget definition.
    [Tags]  TC_C229148  acc_wc_aci
    ${dashboardName}  Set variable  [ROBOT] Dashboard Widget Definition
    Create Dashboard With 2 Angles    ${dashboardName}
    Click Displays Tab
    Check Widget Names After Created
    Change And Check Widget Names
    Change And Check Widget Display
    Add And Check Widget Display  ${dashboardName}
    Save And Check All Widgets
    Delete And Check All Widgets
    [Teardown]  Back To Search And Delete Dashboard Are Created    ${dashboardName}

Verify Delete Dashboard Widget
    [Documentation]  Delete adhoc widget and saved widget
    ...              Risk/coverage area: Dashboard result.
    [Tags]  TC_C229219
    [Setup]  Run Keywords  Import Angle By API  /models/1  ANGLE_DashboardWidgetDeletion1.json  user=${Username}
    ...      AND           Import Angle By API  /models/1  ANGLE_DashboardWidgetDeletion2.json  user=${Username}
    ...      AND           Import Angle By API  /models/1  ANGLE_DashboardWidgetDeletion3.json  user=${Username}
    ...      AND           Import Angle By API  /models/1  ANGLE_DashboardWidgetDeletion4.json  user=${Username}
    ${searchText}     Set Variable  [ROBOT] Angle for Dashboard deletion
    ${dashboardName}  Set variable  [ROBOT] Dashboard widget deletion

    # delete adhoc widget #2
    Create Adhoc Dashboard  ${searchText}  ${dashboardName}
    Click Delete Widget  1
    Check Web Error

    # delete saved widget #2
    Go to Search Page
    Create New Dashboard  ${searchText}  ${dashboardName}
    Click Delete Widget  1
    Reload Dashboard Page
    All Widgets Should Display Properly

    [Teardown]  Run Keywords  Back To Search And Delete Dashboard Are Created    ${dashboardName} 
    ...         AND           Clean Up Items And Go To Search Page