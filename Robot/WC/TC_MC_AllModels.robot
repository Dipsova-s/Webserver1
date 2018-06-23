*** Settings ***
Resource                    ${EXECDIR}/resources/WCSettings.robot
Suite Setup                 Open Browser in Sandbox Mode
Suite Teardown              Close Browser
Test Setup                  Go To               ${URL_MC}
Test Teardown               Logout MC
Force Tags                  acc_mc_s

*** Test Cases ***
Test Status And Report Button On Model Page
    Login To MC By Admin User
    Wait Until Overview Page Loaded
    Go To EA2_800 Models Page
    Verify Status And Report Button
    Verify Model Server Report Filter    WAERS__TCURC
    Verify Popup Stop Server