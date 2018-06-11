*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Open Browser in Sandbox Mode
Suite Teardown      Close Browser
Test Setup          Go To               ${URL_MC}
Test Teardown       Logout MC
Force Tags          MC    acc_mc

*** Variables ***
${SystemRole}             ROBOT_role
${DescriptionRole}        ROBOT role description
${FilterAvailableUser}    Power
${UserCount}              3

*** Test Cases ***
Test System Role
    Login To MC By Admin User
    Wait Until Overview Page Loaded
    Go To System Roles Page
    Create New Role And Set All Allowed    ${SystemRole}    ${DescriptionRole}
    Verify Consolidated Role Of All Allowed    ${SystemRole}
    Set Manage System To Undefined    ${SystemRole}
    Verify Set Manage System To Undefined    ${SystemRole}
    Back To System Roles Page And Remove Role    ${SystemRole}

Test Manage Users In System Role
    Login To MC By Admin User
    Wait Until Overview Page Loaded
    Go To System Roles Page
    Create New Role And Set All Allowed    ${SystemRole}    ${DescriptionRole}
    Add User To System Role By Name   ${SystemRole}    ${FilterAvailableUser}
    Delete Role    ${SystemRole}
