*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Resource            ${EXECDIR}/WC/API/API_User.robot
Suite Setup         Go to MC Then Login With Admin User
Suite Teardown      Close Browser
Test Setup          Go To System Settings Page

*** Variables ***
${providerName}     local
${ADSLValue}        2
${Program/ScriptFolderPath}     c:/random/path

*** Test Cases ***
Test System Settings
    [Documentation]     This test case verifies the ssl email settings and default approval state automation task actions setting lists
    [Tags]  smk_mc  TC_C230851      TC_C603
    Verify SSL Email Settings
    Verify Default Approval State Automation task Actions Setting Lists

Verify No Manage System
    [Documentation]     This test case verifies no manage system privilege in the system settings page
    ...                 Risk Coverage: This test covers the failures in the system settings page
    [Tags]   smk_mc_s  TC_C605
    [Setup]  Run Keywords  Go To System Settings Page
    ...      AND  Prepare No Manage System User

    Go To MC Then Login With Test Role User
    Go To System Settings Page
    Verify No Manage System On System Settings Page
    Logout MC Then Close Browser
    Switch Browser  1

    [Teardown]  Restore No Manage System User


