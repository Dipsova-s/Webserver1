*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Close Browser
Test Teardown       Go to Search Page
Force Tags          smk_wc

*** Test Cases ***
Verify User Change Password
    [Documentation]     Check the existence of Change password user menu and input fields in change password pop up
    [Tags]              TC_C231297
    Open User Change Password Popup
