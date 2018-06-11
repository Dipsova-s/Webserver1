*** Variables ***
${txtUsername}          UserName
${txtPassword}          Password
${btnLogin}             LoginButton
${btnUserMenu}          UserControl
${btnUserMenuMC}          UserMenuControl
${btnLogout}            css=#UserMenu .btnLogout
${btnUserSetting}       css=#UserMenu .actionDropdownItem.btnSettings
${btnChangePassword}    css=#UserMenu .actionDropdownItem.btnChangePassword
${btnManagementConsole}       css=#UserMenu .actionDropdownItem.btnMC

*** Keywords ***
Wait Login Page Document Loaded
    Sleep    ${TIMEOUT_GENERAL}
    Wait Until JavaScript Is True    window.jQuery && window.jQuery.isReady && window.isResourcesLoaded

Fill in Username
    [Arguments]   ${username}
    Wait Until Page Contains Element    ${txtUsername}
    Input Text    ${txtUsername}  ${username}

Fill in Password
    [Arguments]   ${password}
    Wait Until Page Contains Element    ${txtPassword}
    Input Password    ${txtPassword}  ${password}

Click Login Button
    Wait Until Page Contains Element    ${btnLogin}
    Click Button  ${btnLogin}

Wait Until Login Page Contains Text
    [Arguments]   ${expectedResult}
    Wait Progress Bar Closed
    Wait Until Page Contains   ${expectedResult}    120s
