*** Settings ***
Resource            ${EXECDIR}/WC/POM/ManagementConsole/Users/Sessions.robot

*** Keywords ***
Verify the User Sessions grid filtered with the given text
     [Documentation]     Verify the user is able to search and filter the datastores in datastores grid table.
     [Arguments]    ${filteredText}
     Verify the User Sessions Filtered with Text  ${filteredText}
    
Go To Sessions Page With Admin User
    Go to MC Then Login With Admin User
    Go to Sessions page in MC

Try To Go To MC Page and Lands in Login Page
    [Arguments]    ${location}
    ${targetLocation}    Set Variable    ${URL_MC}/home/index#${location}
    ${currentLocation}    Get Location
    ${reload}  Execute JavaScript  return window.location.hash.substr(1)=='${location}';
    Run Keyword If    ${reload}    Reload Page
    ...        ELSE    Go To    ${targetLocation}

Go To All Users Page and Session logs out
    Try To Go To MC Page and Lands in Login Page    /Users/All%20users/
    Wait Until Page Contains Element    ${txtUsername}    ${TIMEOUT_MC_LOAD}