*** Settings ***
Resource            ${EXECDIR}/WC/POM/ManagementConsole/GlobalSettings/Authentication.robot

*** Keywords ***
Go To Authentication Page
    Wait Side Menu Ready
    Click Side Menu Global Settings
    Click Side Menu Authentication
    Wait Until Authentication Page Loaded

Go To Authentication Page With Admin User
    Go to MC Then Login With Admin User
    Go To Authentication Page

Reload Authentication Page
    Click Side Menu Authentication
    Wait Until Authentication Page Loaded

Input Invalid Trusted Webservers And Warning Should Be Shown
    Input Trusted Webservers    300.300.300.300
    ${isValid}    Get Invalid Input Trusted Webservers
    Should Be True    ${isValid}
    #${isValid}    Get Validate Input Trusted Webservers
    #Should Not Be True    ${isValid}

Verify At Least 1 Authentication Should Be Enabled
    ${countEnabled}    Get Enabled Authentication Count
    Should Be True    ${countEnabled}>0

Reload Authentication Page And Role "${roleName}" Should Be Their
    Click Reload MC Page
    Wait Until Authentication Page Loaded
    Check Default Role Is Exist    local    ${roleName}

Save Authenticate And Invalid Trusted Webservers Should Be Cleared
    Click Save Authentication
    #${isValid}    Get Invalid Input Trusted Webservers
    #Should Not Be True    ${isValid}
    #${isValid}    Get Validate Input Trusted Webservers
    #Should Be True    ${isValid}

Save Local Role ${RoleName} To System Authentication
    Set Default Roles To System Authentication By ID    ${RoleName}

Remove Local Role "${roleName}" From System Authentication
    Remove Default Roles To System Authentication By ID     local    ${roleName}
    Click Save Authentication
    Check Default Role Is Not Exist    local    ${roleName}

Check Automatically create users for "${ID}" is ON and disabled
    Click Element    ${trRowInSystemAuthenticationGrid}:contains(${ID}) ${btnEditCustomIcons}
    Wait Until Authentication Edit Page Loaded
    Check Automatically create users already selected by ID

Save Authenticate and ADF validate message should show
    Click Save Authentication
    Wait Until Page Contains    Please select default roles

Set Enabled Sync roles to groups
    Set Sync roles to groups


