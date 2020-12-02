*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Resource            ${EXECDIR}/WC/Scenarios/Dashboard/TS_DashboardState.robot
Resource            ${EXECDIR}/WC/Scenarios/Dashboard/TS_DashboardSave.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Close Browser
Force Tags          acc_wc_s

*** Test Cases ***
Verify Dashboard Saving Privilege
    [Documentation]  Check save buttons on a difference user.
    ...              Clicking Dashboard save all button should remove the filter asterisk sign.
    ...              Risk/Cover area: Save all dasboard, Save Dashboard as.
    [Tags]    TC_C228917
    ${dashboardID}  Set Variable    ROBOT_DASHBOARD_SAVE
    [Setup]  Import Dashboard By API  /models/1  DASHBOARD_SaveButton.json  DASHBOARD_SaveButton.angles.json  user=${Username}
    Find Dashboard By ID Then Execute The First Dashboard    ${dashboardID}
    Click Dashboard Tab
    Set Editor Context: Dashboard Tab

    Verify EAPower: Dashboard Save Buttons Privilege
    Verify Dashboard Save All Button  
    Publish Dashboard
    Validate Dashboard

    Verify EAViewer: Dashboard Save Buttons Privilege    ${dashboardID}
    Verify EABasic: Dashboard Save Buttons Privilege    ${dashboardID}
    Unvalidate Dashboard

    [Teardown]  Clean Up Items And Go To Search Page   

Verify Save Dashboard As
    [Documentation]  Check save Dashboard as functionals.
    ...              Risk/Cover area: Save Angle as popup.
    [Tags]    TC_C228917     
    ${dashboardID}  Set Variable    ROBOT_SAVE_DASHBOARD_AS
    ${dashboardName}  Set Variable    [ROBOT] Dashboard for Save Button (new)
    [Setup]  Import Dashboard By API  /models/1  DASHBOARD_SaveAs.json  DASHBOARD_SaveAs.angles.json  user=${Username}
    Find Dashboard By ID Then Execute The First Dashboard    ${dashboardID}

    Verify Save Dashboard As Button    ${dashboardName}  

    [Teardown]  Run Keywords  Back To Search And Delete Dashboard Are Created    ${dashboardName}  
    ...         AND           Clean Up Items And Go To Search Page

Verify Newly Dashboard With The Filter
    [Documentation]  Check the adhoc icon when user create a new dashboard with filter
    [Tags]    TC_C228917  

    [Setup]  Import Angle By API  /models/1  ANGLE_ForNewlyDashboard.json  user=${Username}
    ${searchText}     Set Variable    [ROBOT] Angle for Newly Dashboard
    ${dashboardName}  Set Variable    [ROBOT] Newly Dashboard with asterisk
 
    Set Editor Context: Dashboard Tab
    Verify Newly Dashboard With The Filter Should Not Show Asterisk    ${searchText}   ${dashboardName}

    [Teardown]  Run Keywords  Back To Search And Delete Dashboard Are Created    ${dashboardName} 
    ...         AND           Clean Up Items And Go To Search Page