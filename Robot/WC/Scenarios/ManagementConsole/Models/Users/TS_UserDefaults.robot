*** Settings ***
Resource            ${EXECDIR}/WC/POM/ManagementConsole/Overview.robot
Resource            ${EXECDIR}/WC/POM/ManagementConsole/Users/UserDefaults.robot

*** Keywords ***
Click Default Business Process For User
    [Arguments]    ${businessProcessName}
    Click Side Menu Users
    Click Side Menu User Defaults
    Click Set Default Setting For Business Process Bar    ${businessProcessName}
    Save User Defaults