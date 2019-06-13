*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Open Browser in Sandbox Mode
Suite Teardown      Close Browser
Test teardown       Run Keyword If Test Failed    Force Logout WC
Force Tags          smk_wc_s

*** Test Cases ***
EAPower is redirected to searchpage after logging in to MC or deeplink URL to MC
    Go To    ${URL_MC}
    Sleep    3s
    Login To WC By Power User
    ${testUrl}    Get MC Language Page Url
    Go to    ${testUrl}
    Sleep    5s
    Wait Search Page Document Loaded
    Logout

EAPower is redirectrd to searchpage when using deeplink URL to MC
    Go to    ${URL_WC}
    Sleep    3s
    Login To WC By Power User
    ${testUrl}    Get MC Language Page Url
    Go to    ${testUrl}
    Sleep    5s
    Wait Search Page Document Loaded
    Logout

EAAdmin can login to MC directly when using deeplink URL
    Go to    ${URL_MC}/home/index#/Global settings/Languages/
    Sleep    3s
    Login    ${AdminUsername}    ${Password}
    Wait Until Languages Page Loaded
    Logout MC

EAAdmin can login to WC and directly to MC with deeplink URL
    Go to    ${URL_WC}
    Sleep    3s
    Login To WC By Admin User
    ${testUrl}    Get MC Language Page Url
    Go to    ${testUrl}
    Wait Until Languages Page Loaded
    Logout MC