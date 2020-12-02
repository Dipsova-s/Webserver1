*** Settings ***
Resource                    ${EXECDIR}/resources/WCSettings.robot
Suite Setup                 Go to MC Then Login With Admin User
Suite Teardown              Logout MC Then Close Browser
Test Setup                  Go To MC Page  Overview
Force Tags                  acc_mc_s

*** Test Cases ***
Test Status And Report Button On Model Page
    [Documentation]     To verify the status and Report is displayed and the user is able to filter in the popup for the selected model. Medium criticality
    [Tags]              TC_C657
    Go To EA2_800 Models Page
    Verify Status And Report Button
    Verify Model Server Report Filter    WAERS__TCURC
    Verify Popup Stop Server

Test Start/Stop Model Server Button
    [Documentation]     To verify the start and stop button displayed for the selected model server in model server overview page. Medium criticality
    [Tags]              TC_C657
    Go To EA2_800 Models Page
    Verify Start/Stop Model Server Button

Verify the Model options displayed for selected Model server in Management console Models Page
    [Documentation]     To verify all the model options displayed in right side page as link for the selected model server and the options page are redirected upon clicking the model options. Medium criticality.
    [Tags]              TC_C658  acc_mc_aci_s
    Go To EA2_800 Models Page
    Verify the model options displayed
    Verify the page redirected to the selected model options in MC model server page