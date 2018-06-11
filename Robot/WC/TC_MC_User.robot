*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Open Browser in Sandbox Mode
Suite Teardown      Close Browser
Test Setup          Go To               ${URL_MC}
Test Teardown       Logout MC
Force Tags          MC    acc_mc

*** Variables ***
${providerName}    local

*** Test Cases ***
Test Add User
    Login To MC By Admin User
    Wait Until Overview Page Loaded
    Go To All Users Page
    Click Add User Popup
    Choose Provider Dropdown List    ${providerName}
    Wait Until Add Users Page Loaded
    Click Select All Available Users
    Click Add Selected Users
    Click Select All Selected Users
    Click DeSelect All Selected User
    Click Select All Selected Users
    Click Remove Selected Users
    Click DeSelect All Available User
    ${username}    Get First Available Username
    Click Select First Available User
    Click Add Selected Users
    Click Save Add User
    Wait Until Add Users Page Loaded
    Click Cancel Button on Add User Page
    Wait MC Progress Bar Closed
    Filter User List By Username    ${username}