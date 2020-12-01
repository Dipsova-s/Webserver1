*** Settings ***
Resource                    ${EXECDIR}/resources/WCSettings.robot
Suite Setup                 Go to MC Then Login With Admin User
Test Setup                  Go To EA2_800 Model Communications Settings Page
Suite Teardown      Close Browser
Force Tags                  acc_mc

*** Variables ***
${Comment}      test
${Index}        0
${trRowInGrid}      jquery=#GridComment tbody tr

*** Test Cases ***
Fill Company Information Under Models Communications Settings and verify the data saved successfully with given values
    [Documentation]     This test case is to verify the information changed by user in company information under models communications settings are saved successfully and changes the data back to old values.
    [Tags]      TC_C661     TC_C663
    Read The Default Content From Input Fields
    Edit The Content From Input Fields Under Communications
    Click Save Communications
    Verify Edited Content Under Communications
    Restore content to old values
    Click Save Communications

Add Comment, Edit Added Comment Under Communications Settings And Delete The Comment
    [Documentation]     In This test case adding comment under communications settings, Edit comment and verifying once it get saved and delete the comment
    ...                 This test covers failures while adding comment and attaching file in the Communications settings page
    [Tags]      TC_C228546
    Click Add New Comment
    Input Comment Text      ${Comment}    
    Attach Comment File
    Click Save Comment
    Click Show Action Dropdown In Grid By Index     ${Index}     ${trRowInGrid}
    Click Edit comment and verify       ${Comment}
    Delete comment

Verify Attach Logfiles checkbox and Non-Default value in SendLogsFrequency dropdown
    [Documentation]     This test case verifies the Send Logs Frequency and Logfiles checkbox changes and validates whether changes are remained after reload
    ...                 Risk-Coverage:This test covers the failures related to Email Settings changes in Model Communications page
    [Tags]     TC_C39617
    Flip attach logfiles checkbox and enter non-default value in SendLogsFrequency
    Verify attach logfiles checkbox and non-default value in SLF are saved

Verify No error and saved when SendLogsFrequency value is zero
    [Documentation]     This test case verifies the Send Logs Frequency and validates whether changes are remained after reload
    ...                 Risk-Coverage:This test covers the failures related to Email Settings changes in Model Communications page
    [Tags]     TC_C39617
    Input no value in send log frequency dropdown
    Verify no value in SLF is saved