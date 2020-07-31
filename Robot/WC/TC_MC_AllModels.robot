*** Settings ***
Resource                    ${EXECDIR}/resources/WCSettings.robot
Suite Setup                 Go to MC Then Login With Admin User
Suite Teardown              Logout MC Then Close Browser
Test Setup                  Go To All Models Page
Test Teardown               Go To MC Page       /Overview/
Force Tags                  acc_mc_s

*** Test Cases ***
Verify Fields On Setup New Model Form
    [Documentation]     This test will verify the Setup New model Form
    ...                 Risk Covered: This test helps in creating new models and covers the test failures in the model setup page
    [Tags]      TC_C653  acc_mc_aci_s
    Click Create Models
    Verify Setup New Model Form

Edit the model verify and restore content back to the same values
    [Documentation]     This test will verify the Setup New model Form edit the model details verify and then restores the content back to the same values
    ...                 Risk Covered: This test helps in modifying models and covers the test failures in the model setup page
    [Tags]      TC_C653
    Edit Model
    Verify the model modified
    Restore model