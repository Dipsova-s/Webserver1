*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Open Browser in Sandbox Mode
Suite Teardown      Close Browser
Test Setup          Go To               ${URL_WC}
Force Tags          smoke    smk_wc


*** Test Cases ***
Verify Login Success And Currect Session
    Login To WC By Admin User
    ${cookieValueWC}    Get Cookie Value    EASECTOKEN
    Click User Menu
    Click IT Management Console on User Menu
    Select Window    IT Management Console
    Wait Until Page Contains Element    jquery=#UserMenuControl
    ${cookieValueMC}    Get Cookie Value    EASECTOKEN
    Should Be Equal    ${cookieValueWC}    ${cookieValueMC}
    Logout MC
    Close Window

    # switch to WC window and check cookie
    Select Window
    Wait Until Element Is Visible    btn-popupNotification0
    Click Element    btn-popupNotification0
    Wait Until Page Contains Element    jquery=#LoginForm    120s
    ${cookies}    Get Cookies
    Should Not Contain    ${cookies}    EASECTOKEN
