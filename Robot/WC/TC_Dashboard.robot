*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Test Teardown       Go to Search Page
Force Tags          acceptance    acc_wc

*** Test Cases ***
Verify Dashboard Details
    Dashboard Details

Add Display To Existing Dashboard Test
    Add Display To Dashboard Dashboard

Verify Dashboard Execution Parameters
    Dashboard Execution Parameters

Verify Execute Dashboard With Execution Parameters In Edit Mode
    Execute Dashboard With Execution Parameters In Edit Mode    Dashboard with execute parameters in edit mode

Dashboard Info Popup Test
    ${dashboardName}    Set Variable    [ROBOT] Dashboard Info Popup Test
    ${angleName}        Set Variable    [ROBOT] Dashboard Info Popup Angle Test

    Create Dashboard With 2 Angles    ${dashboardName}
    Back To Search

    Create Angle From One Object List And Save    Vendor    ${angleName}
    Back To Search

    Select Search Business Process P2P
    Create Dashboard From Specific Angle Name    ${angleName}    ${dashboardName}
    Back To Search

    Search By Text And Expect In Search Result    ${dashboardName}

    : FOR    ${INDEX}    IN RANGE    2
    \    Click First Item Info Button
    \    Click Dashbaord Ok Button Via Item Info Popup
    \    Click Item Info Button    1
    \    Click Dashbaord Ok Button Via Item Info Popup

    [teardown]
    Search By Text And Expect In Search Result    ${dashboardName}
    Delete All Search Result Items
    Search By Text And Expect In Search Result    ${angleName}
    Delete All Search Result Items
