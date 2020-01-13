*** Settings ***
Resource            ${EXECDIR}/WC/POM/ManagementConsole/Users/Sessions.robot

*** Keywords ***
Verify the Debug logging checkbox is saved for all the users in Sessions grid
    Select the Debug logging checkbox for all the users in sessions grid
    Go to Sessions page in MC
    Verify the Debug logging checkbox checked for all the users in Sessions grid
    Unselect the Debug logging checkbox for all the users in sessions grid
    Go to Sessions page in MC
    Verify the Debug logging checkbox is not checked for all the users in Sessions grid

Verify the User Sessions grid filtered with the given text
     [Documentation]     Verify the user is able to search and filter the datastores in datastores grid table.
     [Arguments]    ${filteredText}
     Verify the User Sessions Filtered with Text  ${filteredText}
    
Go To Sessions Page With Admin User
    Go to MC Then Login With Admin User
    Go to Sessions page in MC