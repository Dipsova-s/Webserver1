*** Settings ***
Resource                    ${EXECDIR}/resources/WCSettings.robot
Suite Setup                 Go To Communications Settings Page
Suite Teardown              Logout MC Then Close Browser
Force Tags                  acc_mc_s

*** Variables ***
${Comment}      test
${Index}        0
${trRowInGrid}      jquery=#GridComment tbody tr

*** Test Cases ***
Fill Company Information Under Models Communications Settings and verify the data saved successfully with given values
    [Documentation]     This test case is to verify the information changed by user in company information under models communications settings are saved successfully and changes the data back to old values.
    [Tags]      TC-C661     TC-C663
    Read The Default Content From Input Fields
    Edit The Content From Input Fields Under Communications
    Click Save Communications
    Click Side Menu Models EA2_800
    Go To Communications Settings Page
    Verify Edited Content Under Communications
    Restore content to old values
    Click Save Communications

Add Comment, Edit Added Comment Under Communications Settings And Delete The Comment
    [Documentation]     In This test case adding comment under communications settings, Edit comment and verifying once it get saved and delete the comment
    ...                 This test covers failures while adding comment and attaching file in the Communications settings page
    [Tags]      TC-C228546
    Click Add New Comment
    Input Comment Text      ${Comment}    
    Attach Comment File
    Click Save Comment
    Click Show Action Dropdown In Grid By Index     ${Index}     ${trRowInGrid}
    Click Edit comment and verify       ${Comment}
    Delete comment
    
