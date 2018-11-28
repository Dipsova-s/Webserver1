*** Settings ***
Resource                    ${EXECDIR}/resources/WCSettings.robot
Suite Setup                 Open Browser in Sandbox Mode
Suite Teardown              Close Browser
Test Setup                  Go To               ${URL_MC}
Test Teardown               Logout MC
Force Tags                  acc_mc_s

*** Test Cases ***
Verify Fields On Setup New Model Form
    Login To MC By Admin User
    Wait Until Overview Page Loaded
    Go To All Models Page
    Click Create Models
    Verify Setup New Model Form
