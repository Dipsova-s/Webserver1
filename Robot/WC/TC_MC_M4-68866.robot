*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Open Browser in Sandbox Mode
Suite Teardown      Close Browser
Test Setup          Go To               ${URL_MC}
Test Teardown       Logout MC
Force Tags          acc_mc

*** Variables ***
${Comment}      test
${Index}        0
${trRowInGrid}      jquery=#GridComment tbody tr

*** Test Cases ***
Test for comment sections
    [Documentation]     This test performs adding comment, attaches file then verify comment and delete
    ...                 This test covers failures while adding comment and attaching file in the package module
    [Tags]      TC_CommentTest
    Login To MC By Admin User
    Wait Until Overview Page Loaded
    Go To Package Page
    Verify Package Page Is Ready
    Click Add New Comment
    Input Comment Text      ${Comment}    
    Attach Comment File
    Click Save Comment
    Click Show Action Dropdown In Grid By Index     ${Index}     ${trRowInGrid}
    Click Edit comment and verify       ${Comment}
    Delete comment