*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to MC Then Login With Admin User
Suite Teardown      Close Browser
Force Tags          smk_mc

*** Test Cases ***
Test Navigation To User Defaults Page 
    [Documentation]     This test case verifies navigation to User defaults page.
    Go to User Defaults page in MC