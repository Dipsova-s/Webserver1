*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go To Sessions Page With Admin User
Suite Teardown      Logout WC Then Close Browser
Test Teardown       Go to Sessions page in MC
Force Tags          acc_mc_s

*** Variables ***
${txtSessionsFilterValue}    EAAd

*** Test Cases ***
Verify the Sessions grid in MC is filtered correctly 
    [Documentation]     To verify the user is able to filter User sessions with user id and user sessions are filtered for the entered text in Sessions grid.
    [Tags]  TC_C644_s
    Verify the User Sessions filtered with Text     ${txtSessionsFilterValue}
    Verify the User Sessions Filtered with no Text