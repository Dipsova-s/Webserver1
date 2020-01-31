*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to MC Then Login With Admin User
Suite Teardown      Logout WC Then Close Browser
Test Setup          Go To Role Tab Under Model EA2_800
Force Tags          MC    acc_mc

*** Variables ***
${Role_Name}              Test_role
${FilterAvailableUser}    EAViewer
${UserCount}              1

*** Test Cases ***
Test Manage Users Under Role
    [Documentation]     This test is for adding roles, sort, copy, make changes to the role then verify and delete
    ...                 Risk covered: Failures over adding, sorting and modifying roles
    ...                 This test failure affects role based login scenarios
    Create Role By Copy Role    EA2_800_ALL    ${Role_Name}
    Filter Role By Role Name    ${Role_Name}
    Add User To Role Name    ${Role_Name}    ${FilterAvailableUser}
    Go To Role Tab Under Model EA2_800
    Verify Users Count After Added    ${Role_Name}    ${UserCount}
    Delete Role By Role Name    ${Role_Name}