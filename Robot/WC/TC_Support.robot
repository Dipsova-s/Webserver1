*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With Admin User
Suite Teardown      Run Keywords   Roll back to WC page  AND   Logout WC Then Close Browser       
Force Tags          acc_wc


*** Test Cases ***
Validate Online Support portal link in WC
    [Tags]   TC_C229271
    [Documentation]      Validate Support Option with icon is displayed in 'Help' menu of WC
    ...  Validate from 'Help' menu user can navigate to Online Support portal in Webclient

    Click on Help icon in WC
    Validate Support button Should be displayed in WC
    Click on Support Button
    Validate user is redirected to online support portal