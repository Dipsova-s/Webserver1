*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Initialize Download Path And Login With Power User
Suite Teardown      Close Browser

*** Test Cases ***
Verify Download Items From Search Page
    [Documentation]     This test verify downloading Angle and Dashboard from Search page
    [Tags]   acc_wc    TC_C199723
    [Setup]  Run Keywords  Import Dashboard By API  /models/1  DASHBOARD_Download.json  DASHBOARD_Download.angles.json  user=${Username}
    ...      AND           Import Angle By API  /models/1  ANGLE_Download.json  user=${Username}
    Search By Text And Expect In Search Result    Dashboard Download
    Click Select All Items from Search Result
    Click Search Action Download Items
    Wait Until Keyword Succeeds    1 min    2 sec    Download Should Be Done  6
    [Teardown]  Run Keywords  Empty Download Directory
    ...         AND           Clean Up Items And Go To Search Page

Verify Download Item From Angle Page
    [Documentation]     This test verify downloading from Angle page
    [Tags]   acc_wc    TC_C229266
    ${angleName}  Set Variable  [ROBOT] Angle Download Test
    Create Adhoc Angle From Object List  PD   ${angleName}
    Download Button Should Not Be Available
    Click Save Angle
    Verify Angle Downloading Confirmation
    Click Download Angle
    Wait Until Keyword Succeeds    1 min    2 sec    Download Should Be Done
    [Teardown]  Run Keywords  Empty Download Directory
    ...         AND           Back To Search And Delete Angle Are Created  ${angleName}

Verify Download Item From Dashboard Page
    [Documentation]     This test verify downloading from Dashboard page
    [Tags]   acc_wc    TC_C229267
    [Setup]  Import Angle By API  /models/1  Angle_Download.json  user=${Username}
    ${dashboardName}  Set Variable  [ROBOT] Dashboard Download Test
    Create Adhoc Dashboard  Dashboard Download  ${dashboardName}
    Dashboard Download Button Should Not Be Available
    Click Dashboard Save All
    Verify Dashboard Downloading Confirmation
    Click Download Dashboard
    Wait Until Keyword Succeeds    1 min    2 sec    Download Should Be Done  2
    [Teardown]  Run Keywords  Empty Download Directory
    ...         AND           Back To Search And Delete Dashboard Are Created  Dashboard Download