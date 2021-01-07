*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to MC Then Login With Admin User
Suite Teardown      Run Keywords   Roll back to ITMC page  AND   Logout MC Then Close Browser
Force Tags          MC    acc_mc_s

*** Test Cases ***
Validate Online Support portal link in ITMC
    [Tags]   TC_C229272
    [Documentation]      Validate Support Option with icon is displayed in 'Help' menu in ITMC
    ...  Validate from 'Help' menu user can navigate to Online Support portal in ITMC

    Click on Help icon in ITMC
    Validate Support button Should be displayed in ITMC
    Click on Support Button
    Validate user is redirected to online support portal