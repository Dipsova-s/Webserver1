*** Settings ***
Resource                    ${EXECDIR}/resources/WCSettings.robot
Suite Setup                 Open Browser in Sandbox Mode
Suite Teardown              Close Browser
Test Setup                  Go To               ${URL_MC}
Test Teardown               Logout MC
Force Tags                  smk_mc

*** Variables ***

*** Test Cases ***
Test Start/Stop Model Server Button
    Login To MC By Admin User
    Wait Until Overview Page Loaded
    Go To EA2_800 Models Page
    Verify Start/Stop Model Server Button
