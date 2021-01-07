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
    [Documentation]     This test case verifies the system settings
    [Tags]  smk_mc  TC_C230851      TC_C603
    Verify Instance To Keep Per Model
    Verify SSL Email Settings
    Verify Default Maximum Export Page Size Is Exist
    Verify Default Approval State Automation task Actions Setting Lists
    
Fill System Settings and verify the data saved successfully with given values
    [Documentation]      Verify the values changed by user in System setings page are saved successfully and changes the data back to old values.
    [Tags]  smk_mc_s  TC_C592  TC_C230851
    Verify System Settings Page Is Ready
    Get the System Settings page field values
    Fill the System settings page field values
    Click Save System Settings
    Verify System Settings Page Is Ready
    Verify the System Settings page field values
    Set the System settings page field values
    Click Save System Settings

Verify Active Directory Size limit changes reflects the users list in users page
    [Documentation]     This test case changes the active directory size limit and verifies the changes reflects in the user page as per the ADSL number
    ...                 Risk Coverage:This test covers the failures in the system settings page and also changes that reflects/affects other modules
    [Tags]   smk_mc  TC_C604
    Get and change Active Directory Size Limit Value   2
    Go To All Users Page
    Click Add User Popup
    Choose Provider Dropdown List    ${providerName}
    Wait Until Add Users Page Loaded
    Verify number of Available Users on Add Users Page      ${ADSLValue}
    Click Hyperlink Overview
    Go To System Settings Page
    Verify System Settings Page Is Ready
    Restore Active Directory Size Limit Value

Verify Program/Scripts folder
    [Documentation]     This test case verifies the path of the Program/Scripts folder in the system settings page
    ...                 Risk Coverage: This test covers the failures in the system settings page
    [Tags]   smk_mc  TC_C39021
    Verify Text for info property of Program/Script folder
    Input Program/Script folder path and Save       ${Program/ScriptFolderPath}
    Verify Program/Script folder path saved correctly     ${Program/ScriptFolderPath}

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


