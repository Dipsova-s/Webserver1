*** Settings ***
Resource            ${EXECDIR}/WC/POM/ManagementConsole/GlobalSettings/EditAuthentication.robot


*** Keywords ***
Add New Authentication
    [Arguments]    ${ProviderType}    ${ID}    ${Description}    ${RoleName}    ${Target}    ${Identity}
    Click Element    ${btnCreateAuthentication}
    Set Authentication Provider Type    ${ProviderType}
    Fill Authentication ID    ${ID}
    Fill Authentication Description    ${Description}
    Set Enable Authentication
    Set Auto Create User
    Set Enabled Sync roles to groups
    Fill Authentication Target    ${Target}
    Fill Authentication Identity    ${Identity}
    Save Local Role ${RoleName} To System Authentication
    Click Save Authentication
    Wait Until Authentication Page Loaded

Verify New Authentication
    [Arguments]    ${ID}
    Verify Authentication    ${ID}

Delete Authentication Provider by ID
    [Arguments]    ${ID}
    Delete Authentication     ${ID}



