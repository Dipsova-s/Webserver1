*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Resource            ${EXECDIR}/resources/WC/API/Mock/API_Utility.robot
Suite Setup         Go to MC Then Login With Admin User
Suite Teardown      Logout MC Then Close Browser
Test Setup          Go To System Settings Page
Force Tags          MC    smk_mc

*** Variables ***
${providerName}     local
${ADSLValue}        2
${Program/ScriptFolderPath}     c:/random/path

*** Test Cases ***
Test System Settings
    [Documentation]     This test case verifies the system settings
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
    [Tags]      TC-C604
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

Verify Program/Scripts folder Text for info property on system settings page
    [Documentation]     This test case verifies the Text for info property of the Program/Scripts folder in the system settings page
    ...                 Risk Coverage:This test covers the failures in the system settings page
    [Tags]      TC-C39021
    Verify Text for info property of Program/Script folder

Input Program/Scripts folder path and save on system settings page
    [Documentation]     This test case verifies the path of the Program/Scripts folder in the system settings page
    ...                 Risk Coverage:This test covers the failures in the system settings page
    [Tags]      TC-C39021
    Input Program/Script folder path and Save       ${Program/ScriptFolderPath}
    Verify Program/Script folder path saved correctly     ${Program/ScriptFolderPath}
    
Fill The Minimum Number Of Label Categories To Publish Angle Settings And Verify
    [Documentation]     Set Minimum number of label categories to publish angle to 2 and verifying by creating new angle and publishing at last cleans up the created items.
    [Tags]  TC_C601  
    Get The Minimum No Of Label Categories To Publish Angle Input Field Value
    Fill The Minimum No Of Label Categories To Publish Angle Input Field Value
    Click Save System Settings
    Go to WC Then Login With EAPower User

    @{cleanUpItems}    Create List
    Create Context: Web    user=${Username}
    ${angleData}    Create Angle    /models/1    ANGLE_AssignPrivilegeLabelTesting.json
    ${angleUri}    Get Uri From Response    ${angleData}
    Append To List   ${cleanUpItems}    ${angleUri}?forced=true
    Find Angle By ID Then Execute The First Angle    ROBOT_ANGLE_ASSIGNPRIVILEGELABLE

    Click Validate Publishing Angle
    Assign Previlege Label And Save
    Verify Published Angle
    Logout WC Then Close Browser
    Switch Browser  1

    [Teardown]   Clean Up Items     Web    ${cleanUpItems}

    