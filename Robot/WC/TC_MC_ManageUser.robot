*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Open Browser in Sandbox Mode
Suite Teardown      Close Browser
Test Setup          Go To               ${URL_MC}
Test Teardown       Logout MC
Force Tags          MC    acc_mc

*** Variables ***
${Role_Name}                 TestMassUser
${FilterAvailableUser}       RoleMassChangeUser_
${UserCount}                 3

*** Test Cases ***
Test Manage Users Under Role
    Login To MC By Admin User
    Wait Until Overview Page Loaded
    Go To Role Tab Under Model EA2_800
    Create Role By Copy Role    EA2_800_ALL    ${Role_Name}
    Filter Role By Role Name    ${Role_Name}
    Add User To Role Name    ${Role_Name}    ${FilterAvailableUser}
    Verify Users Count After Added    ${Role_Name}    ${UserCount}
    Delete Role By Role Name    ${Role_Name}

