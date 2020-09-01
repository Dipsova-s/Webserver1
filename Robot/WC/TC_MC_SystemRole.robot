*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go To System Roles Page With Admin User
Suite Teardown      Logout WC Then Close Browser
Test Teardown       Go To System Roles Page
Force Tags          MC    acc_mc

*** Variables ***
${SystemRole}             ROBOT_role
${DescriptionRole}        ROBOT role description
${FilterAvailableUser}    Power

*** Test Cases ***
Test System Role
    [Documentation]     Verify the consolidated role when set privilege all allowed and undefined
    ...                 Risk/coverage area: System role page manage system to all allowed and undefined
    [Tags]       TC_C7385   acc_mc_aci
    Create New Role And Set All Allowed    ${SystemRole}    ${DescriptionRole}
    Verify Consolidated Role Of All Allowed    ${SystemRole}
    Set Manage System To Undefined    ${SystemRole}
    Verify Set Manage System To Undefined    ${SystemRole}
    Back To System Roles Page And Remove Role    ${SystemRole}

Test Manage Users In System Role
    [Documentation]     Verify create a new system role and set the privilege
    ...                 Risk/coverage area: System role page Create/Assign the system role
    [Tags]      TC_C589
    Create New Role And Set All Allowed    ${SystemRole}    ${DescriptionRole}
    Add User To System Role By Name   ${SystemRole}    ${FilterAvailableUser}
    Delete System Role   ${SystemRole}