*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Open Browser in Sandbox Mode
Suite Teardown      Close Browser
Test Setup          Go To               ${URL_MC}
Force Tags          MC    smk_mc_s


*** Test Cases ***
Test Edit Input Fields And Verify Edited Content
    [Documentation]     In this test case verifying edited content in diffrent fields in Webserver settings page and restore the content back to old values.
    [Tags]      TC_C615     TC_C616     TC_C617     TC_C618     TC_C620     TC_C621     TC_C622     TC_C623     TC_C624
    Login To MC By Admin User
    Wait Until Overview Page Loaded
    Go To Web Server Settings Page
    Verify Web Server Settings Page Is Ready
    Read The Content From Input Fields
    Edit The Content From Input Fields
    Click Save Web Server Setting
    Login To MC By Admin User
    Wait Until Overview Page Loaded
    Go To Web Server Settings Page
    Verify The Edited Input Values
    Restore Old Input Values 
    Click Save Web Server Setting
    