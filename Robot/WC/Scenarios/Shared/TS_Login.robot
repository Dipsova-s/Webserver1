*** Settings ***
Resource            ${EXECDIR}/WC/POM/Shared/LoginPage.robot

*** Keywords ***
Login
    [Arguments]   ${username}  ${password}
    Maximize Browser Window
    Wait Login Page Document Loaded
    Fill in Username    ${username}
    Fill in Password    ${password}
    Click Login Button

Login And Expected Result
    [Arguments]    ${username}    ${password}  ${expectedResult}
    Login    ${username}  ${password}
    Wait Until Login Page Contains Text    ${expectedResult}

Login To WC By Power User
    Login    ${Username}    ${Password}
    Wait Search Page Document Loaded
    Maximize Browser Window

Login To WC By Admin User
    Login    ${AdminUsername}    ${Password}
    Wait Search Page Document Loaded

Login To WC By Test Role User
    Login    ${TestPrivilegesUser}    ${Password}
    Wait Search Page Document Loaded

Login To MC By Admin User
    Login    ${AdminUsername}    ${Password}
    Wait Side Menu Ready

Logout
    [Arguments]
    Execute JavaScript    jQuery('#UserMenu .btnLogout').click()
    Wait Until Page Contains Element    ${txtUsername}    ${TIMEOUT_MC_LOAD}

Logout MC
    Execute JavaScript    jQuery('#logoutForm').submit()
    Wait Until Page Contains Element    ${txtUsername}    ${TIMEOUT_MC_LOAD}

Go to WC Then Login With EAPower User
    Open Browser in Sandbox Mode
    Go To    ${URL_WC}
    Login To WC By Power User

Go to WC Then Login With Admin User
    Open Browser in Sandbox Mode
    Go To    ${URL_WC}
    Login To WC By Admin User

Go to MC Then Login With Admin User
    Open Browser in Sandbox Mode
    Go To    ${URL_MC}
    Login To MC By Admin User

Logout WC Then Close Browser
    Logout
    Close Browser

Logout MC Then Close Browser
    Logout MC
    Close Browser

Force Logout WC
    Go to    ${URL_WC}/en/search/searchpage
    Wait Search Page Document Loaded
    Logout

Force Logout MC Then Close Browser
    Go to    ${URL_MC}/security/logout
    Close Browser

Get MC Language Page Url
    ${languagePageUrl}    Execute JavaScript    return window.location.origin + "/${Branch}/admin/home/index#/Global settings/Languages/"
    [Return]    ${languagePageUrl}
