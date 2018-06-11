*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Open Browser in Sandbox Mode
Suite Teardown      Close Browser
Test Setup          Go To               ${URL_MC}
Test Teardown       Logout MC
Force Tags        	MC    acc_mc

*** Variables ***
${Role_ID}                   EA2_800_ALL

*** Test Cases ***
Verify EA2_800_ALL Role Has Allow For All Privileges
    Login To MC By Admin User
    Wait Until Overview Page Loaded
    Go To Role Tab Under Model EA2_800
    Verify All Privileges Are Allow By Role Id    ${Role_ID}