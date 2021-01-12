*** Variables ***
${txtUsername}          Username
${txtPassword}          Password
${btnLogin}             LoginButton
${btnUserMenu}          UserControlName
${btnUserMenuMC}          UserMenuControl
${btnLogout}            css=#UserMenu .btnLogout
${btnChangePassword}    css=#UserMenu .actionDropdownItem.btnChangePassword
${btnManagementConsole}       css=#UserMenu .actionDropdownItem.btnMC
${OKTAtxtUsername}          okta-signin-username
${OKTAtxtPassword}          okta-signin-password
${OKTAbtnLogin}             okta-signin-submit
${OKTALogin}                //a/img[@alt='OKTA']/parent::a
${btnSettings}                      Settings

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

Check Login Successful
    ${isRedirected}   Run Keyword And Return Status    Wait Until Page Does Not Contain Element    ${btnLogin}   20s
    ${hasCookie}      Run Keyword And Return Status    Get Cookie   STSEASECTOKEN
    Run Keyword If  ${isRedirected} == ${False} and ${hasCookie} == ${False}   Fail   Stuck at login page!

Wait Until Login Page Contains Text
    [Arguments]   ${expectedResult}
    Wait Progress Bar Closed
    Wait Until Page Contains   ${expectedResult}    120s

Fill in Username in OKTA page
    [Arguments]   ${username}
    Wait Until Page Contains Element    ${OKTAtxtUsername}
    Input Text    ${OKTAtxtUsername}  ${username}

Fill in Password in OKTA page
    [Arguments]   ${password}
    Wait Until Page Contains Element    ${OKTAtxtPassword}
    Input Password    ${OKTAtxtPassword}  ${password}

Click Login Button in OKTA page
    Wait Until Page Contains Element    ${OKTAbtnLogin}
    Click Button  ${OKTAbtnLogin}

Click OKTA button in login page
    Wait Until Page Contains Element    ${OKTALogin}
    Click Link  ${OKTALogin}
    
Check if Login required
    ${isRedirected}   Run Keyword And Return Status    Wait Until Page Contains Element    ${OKTAbtnLogin}   10s
    [Return]    ${isRedirected}

Check if user is logged in
    [Arguments]   ${username}
    ${present}=    Run Keyword And Return Status    Element Should Be Visible   ${btnSettings}
    ${loggedIn}=   Run Keyword If   ${present}    Check correct user logged in   ${username}
    ...    ELSE  Set Variable  ${present}
    [Return]    ${loggedIn}

Check correct user logged in
    [Arguments]   ${username}
    Click Element    ${btnSettings}
    Wait Until Ajax Complete
    ${loggedInUser}=    Run Keyword     Execute JavaScript $($("#SettingsPanelUserContent div.card.settingsPanelProfile > div > div > div.form-col.settingsPanelProfileName > span").text().replace('local','\\')
    ${correctuserLoggedIn}=     Run Keyword If   ${loggedInUser} == ${username}     Set Variable ${True}
    ...     ELSE Set Variable ${False}
    Run Keyword If      ${correctuserLoggedIn} == ${False}      Execute JavaScript    jQuery('#UserMenu .btnLogout').click()
    [Return]    ${correctuserLoggedIn}