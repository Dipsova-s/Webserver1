*** Settings ***
Resource            ${EXECDIR}/WC/POM/Shared/Utility.robot
Resource            ${EXECDIR}/WC/POM/Shared/LoginPage.robot

*** Keywords ***
Login
    [Arguments]   ${username}  ${password}
    ${Is_OKTA_Login_Required}=      Is OKTA login required for login to application
    Run Keyword Unless  ${Is_OKTA_Login_Required}   Login with EA credentials   ${username}  ${password}
    Run Keyword If  ${Is_OKTA_Login_Required}==True    Login with OKTA credentials   ${username}  ${password}

Login with EA credentials
    [Arguments]   ${username}  ${password}
    Maximize Browser window
    Wait Login Page Document Loaded
    Fill in Username    ${username}
    Fill in Password    ${password}
    Click Login Button

Login with OKTA credentials
    [Arguments]   ${username}  ${password}
    Wait Login Page Document Loaded
    Maximize Browser window
    Click OKTA button in login page
    ${Is_Login_Required}=   Check if Login required
    Run Keyword If  ${Is_Login_Required} == ${true}   Login using OKTA username and Password in OKTA login page   ${username}  ${password}

Login using OKTA username and Password in OKTA login page
    [Arguments]   ${username}  ${password}
    Wait Login Page Document Loaded
    Fill in Username in OKTA page   ${username}
    Fill in Password in OKTA page   ${password}
    Click Login Button in OKTA page

Login via OKTA page
    Open Browser in Sandbox Mode
    Maximize Browser window
    Go To    ${URL_WC}
    ${Is_OKTA_Login_Required}=      Is OKTA login required for login to application
    Run Keyword If  ${Is_OKTA_Login_Required}   Login with OKTA credentials     ${OKTAUsername}    ${OKTAPassword}
    Wait Search Page Document Loaded

Retry Login
    [Arguments]   ${username}  ${password}
    Delete Cookie   EASECTOKEN
    Reload Page
    Login    ${username}    ${password}

Login And Expected Result
    [Arguments]    ${username}    ${password}  ${expectedResult}
    Login    ${username}  ${password}
    Wait Until Login Page Contains Text    ${expectedResult}

Login To WC
    [Arguments]   ${username}  ${password}
    ${userIsLoggedIn}=  Check If User Is Logged In   ${username}
    Run Keyword If   ${userIsLoggedIn} == ${False}   Login    ${username}    ${password}
    ${result}   Run Keyword And Return Status    Check Login Successful
    Run Keyword If   ${result} == ${False}   Retry Login    ${username}    ${password}
    Wait Search Page Document Loaded

Login To WC By Power User
    ${Is_OKTA_Login_Required}=      Is OKTA login required for login to application
    Run Keyword Unless  ${Is_OKTA_Login_Required}   Login To WC    ${Username}    ${Password}
    Run Keyword If  ${Is_OKTA_Login_Required}==True    Login To WC    ${OKTAPowerUsername}    ${OKTAPowerPassword}

Login To WC By Viewer User
    ${Is_OKTA_Login_Required}=      Is OKTA login required for login to application
    Run Keyword Unless  ${Is_OKTA_Login_Required}   Login To WC    ${ViewerUsername}    ${Password}
    Run Keyword If  ${Is_OKTA_Login_Required}==True    Login To WC    ${OKTAViewerUsername}    ${OKTAViewerPassword}

Login To WC By Basic User
    ${Is_OKTA_Login_Required}=      Is OKTA login required for login to application
    Run Keyword Unless  ${Is_OKTA_Login_Required}   Login To WC    ${BasicUsername}    ${Password}
    Run Keyword If  ${Is_OKTA_Login_Required}==True    Login To WC    ${OKTABasicUsername}    ${OKTABasicPassword}

Login To WC By Admin User
    ${Is_OKTA_Login_Required}=      Is OKTA login required for login to application
    Run Keyword Unless  ${Is_OKTA_Login_Required}   Login To WC    ${AdminUsername}    ${Password}
    Run Keyword If  ${Is_OKTA_Login_Required}==True    Login To WC    ${OKTAUsername}    ${OKTAPassword}

Login To WC By Test Role User
    Login To WC    ${TestPrivilegesUser}    ${Password}

Login To MC
    [Arguments]   ${username}  ${password}
    Login    ${Username}    ${Password}
    ${result}   Run Keyword And Return Status    Check Login Successful
    Run Keyword If   ${result} == ${False}   Retry Login    ${username}    ${password}
    Wait Side Menu Ready

Login To MC By Admin User
    ${Is_OKTA_Login_Required}=      Is OKTA login required for login to application
    Run Keyword Unless  ${Is_OKTA_Login_Required}   Login To MC    ${AdminUsername}    ${Password}
    Run Keyword If  ${Is_OKTA_Login_Required}==True    Login To MC    ${OKTAUsername}    ${OKTAPassword}

Login To MC By Test Role User
    ${Is_OKTA_Login_Required}=      Is OKTA login required for login to application
    Run Keyword Unless  ${Is_OKTA_Login_Required}   Login To MC    ${TestPrivilegesUser}    ${Password}
    Run Keyword If  ${Is_OKTA_Login_Required}==True    Login To MC    ${OKTAUsername}    ${OKTAPassword}

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

Go to WC Then Login With EAViewer User
    Open Browser in Sandbox Mode
    Go To    ${URL_WC}
    Login To WC By Viewer User

Go to WC Then Login With EABasic User
    Open Browser in Sandbox Mode
    Go To    ${URL_WC}
    Login To WC By Basic User

Go to WC Then Login With Admin User
    Open Browser in Sandbox Mode
    Go To    ${URL_WC}
    Login To WC By Admin User

Go to MC Then Login With Admin User
    Open Browser in Sandbox Mode
    Go To    ${URL_MC}
    Login To MC By Admin User
    Wait Until Overview Page Loaded

Go To WC Then Login With Test Role User
    Open Browser in Sandbox Mode
    Go To    ${URL_WC}
    Login To WC By Test Role User

Go To MC Then Login With Test Role User
    Open Browser in Sandbox Mode
    Go To    ${URL_MC}
    Login To MC By Test Role User
    Wait Until Overview Page Loaded

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
