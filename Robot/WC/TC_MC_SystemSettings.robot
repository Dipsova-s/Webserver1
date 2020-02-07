*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to MC Then Login With Admin User
Suite Teardown      Logout MC Then Close Browser
Test Setup          Go To System Settings Page
Test Teardown       Click Hyperlink Overview
Force Tags          MC    acc_mc

*** Variables ***
${providerName}     local
${ADSLValue}        2

*** Test Cases ***
Test System Settings
    [Documentation]     This test case verifies the system settings
    Verify System Settings Page Is Ready
    Verify Instance To Keep Per Model
    Verify SSL Email Settings
    Verify Default Maximum Export Page Size Is Exist

Fill System Settings and verify the data saved successfully with given values
    [Documentation]      Verify the values changed by user in System setings page are saved successfully and changes the data back to old values.
    [Tags]  TC_C592
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
    Verify System Settings Page Is Ready
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