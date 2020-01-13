*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go To Sessions Page With Admin User
Suite Teardown      Logout WC Then Close Browser
Test Teardown       Go to Sessions page in MC
Force Tags          acc_mc_s

*** Variables ***
${txtSessionsFilterValue}    EAAd

*** Test Cases ***
Verify the user is able to edit debug logging value of user sessions and saved successfully
    [Documentation]     To verify the user is able to edit the debug logging checkbox option for user sessions and saved automatically on checking/unchecking the checkbox.
    [Tags]  TC_C202359_s
    Verify the Debug logging checkbox is saved for all the users in Sessions grid

Verify the Sessions grid in MC is filtered correctly 
    [Documentation]     To verify the user is able to filter User sessions with user id and user sessions are filtered for the entered text in Sessions grid.
    [Tags]  TC_C644_s
    Verify the User Sessions filtered with Text     ${txtSessionsFilterValue}