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