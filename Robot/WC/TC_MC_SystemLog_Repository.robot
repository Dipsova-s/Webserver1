*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Resource            ${EXECDIR}/WC/POM/ManagementConsole/SystemLogs/Repository.robot
Suite Setup         Initialize Download Path And Login MC With Admin User
Suite Teardown      Force Logout MC Then Close Browser
Force Tags          MC    acc_mc

*** Test Cases ***
Verify Systemlog File Should Show Forbidden When Access Path Denied
    [Documentation]     Verify name of the columns, sorting and downlading in Repository Log Page 
    ...                 Risk/coverage area: Repository Log Page
    [Tags]  TC_C228829
    Go To Repository Log Page
    Verify Repository Log Grid Column
    Verify Sorting Repository Log If Applicable
    Verify Download Repository Log If Applicable 