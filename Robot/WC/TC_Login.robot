*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Open Browser in Sandbox Mode
Suite Teardown      Logout WC Then Close Browser
Test teardown       Run Keyword If Test Failed    Force Logout WC

*** Test Cases ***
EAPower is redirected to searchpage after logging in to MC or deeplink URL to MC
    [Documentation]     This test verifies that EAPower is redirected to searchpage after logging in to MC or deeplink URL to MC.
    [Tags]   smk_wc_s    TC_C231308
    Go To    ${URL_MC}
    Sleep    3s
    Login To WC By Power User
    ${testUrl}    Get MC Language Page Url
    Go to    ${testUrl}
    Sleep    5s
    Wait Search Page Document Loaded
    Logout

EAPower is redirectrd to searchpage when using deeplink URL to MC
    [Documentation]     This test verifies that EAPower can login to WC and is redirected to searchpage when using deeplink URL to MC.
    [Tags]   smk_wc_s    TC_C231308
    Go to    ${URL_WC}
    Sleep    3s
    Login To WC By Power User
    ${testUrl}    Get MC Language Page Url
    Go to    ${testUrl}
    Sleep    5s
    Wait Search Page Document Loaded
    Logout

EAAdmin can login to WC and directly to MC with deeplink URL
    [Documentation]     This test verifies that EAAdmin can login to WC and directly to MC with deeplink URL.     
    [Tags]    smk_wc_s   TC_C231308  
    Go to    ${URL_WC}
    Sleep    3s
    Login To WC By Admin User
    ${testUrl}    Get MC Language Page Url
    Go to    ${testUrl}
    Wait Until Languages Page Loaded
    Logout MC

Login to MC directly when using deeplink URL to check the Overview page displayed
    [Documentation]     This test verifies that login to MC directly when using deeplink URL landing to overview page.
    [Tags]   acc_mc_s   TC_C231308
    Go to    ${URL_MC}/home/index
    Sleep    3s
    Login    ${AdminUsername}    ${Password}
    Wait Until Overview Page Loaded
    Logout MC