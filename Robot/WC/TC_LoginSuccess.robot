*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Open Browser in Sandbox Mode
Suite Teardown      Close Browser
Test Setup          Go To               ${URL_WC}
Force Tags          smk_wc_s


*** Test Cases ***
Verify Login Success And Currect Session
    [Documentation]   Checking user can login to WC and ITMC with valid credentials.
    [Tags]     C1
    Login To WC By Admin User
    ${cookieValueWC}    Get Cookie    EASECTOKEN
    Click User Menu
    Click IT Management Console on User Menu
    Switch Window    IT Management Console
    Wait Until Page Contains Element    jquery=#UserMenuControl
    ${cookieValueMC}    Get Cookie    EASECTOKEN
    Should Be Equal    ${cookieValueWC.value}    ${cookieValueMC.value}
    Logout MC
    Close Window

    # switch to WC window and check cookie
    Switch Window
    Wait Until Element Is Visible    btn-popupNotification0
    Click Element    btn-popupNotification0
    Wait Until Page Contains Element    jquery=#LoginForm    120s
    ${cookies}    Get Cookies
    Should Not Contain    ${cookies}    EASECTOKEN
