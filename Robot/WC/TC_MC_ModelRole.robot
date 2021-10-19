*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to MC Then Login With Admin User
Suite Teardown      Close Browser
Test Setup          Go To Role Tab Under Model EA2_800
Force Tags          MC    acc_mc

*** Variables ***
${Role_Name}              Test_role
${FilterAvailableUser}    EAViewer
${testRoleUser}           EATestUserRole
${UserCount}              1

*** Test Cases ***
Test Manage Users Under Role
    [Documentation]     This test is for adding roles, sort, copy, make changes to the role then verify and delete
    ...                 Risk covered: Failures over adding, sorting and modifying roles
    ...                 This test failure affects role based login scenarios
    [Tags]      TC_C683    TC_C691    TC_C692    TC_C693    TC_C1962   TC_C2186
    Create Role By Copy Role    EA2_800_ALL    ${Role_Name}
    Filter Role By Role Name    ${Role_Name}
    Add User To Role Name    ${Role_Name}    ${FilterAvailableUser}
    Click Side Menu Models EA2_800 Roles
    Verify Users Count After Added    ${Role_Name}    ${UserCount}
    Delete Role By Role Name    ${Role_Name}

Verify Content Privileges and Consolidated Roles For User For Modeling Workbench In Management Console
    [Documentation]     In this test verifying content privileges for modeling workbench in Management console by adding new role.
    ...                 Checking the existence of modeling workbench section in "Show Consolidated Role" pop up window.
    ...                 And verifying whether workbench link is hide from user in WC & ITMC when user dont have privilege to Edit and Config content.
    [Tags]      TC_C229034      TC_C229141      TC_C229142
    Create Role By Copy Role    EA2_800_ALL    ${Role_Name}
    Filter Role By Role Name    ${Role_Name}
    Add User To Role Name    ${Role_Name}    ${testRoleUser}
    ${values}=  Create List  Configure  Edit  Deny  Undefined
    :FOR  ${value}  IN  @{values}
    \   Verify Content Privileges In Modeling Workbench     ${Role_Name}    ${value}
    Verify Modeling Workbench Privileges Section Existence In Show Consolidated Role Pop Up     ${Role_Name}
    Verify Modeling Workbench Link Is Hiding When User Dont Have Privilege To Edit/Config Content   ${Role_Name}
    Delete Role By Role Name    ${Role_Name}