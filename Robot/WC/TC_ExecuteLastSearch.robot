*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Open Browser in Sandbox Mode
Suite Teardown      Close Browser
Test Setup          Go To               ${URL_WC}
Test Teardown       Logout
Force Tags          acceptance_s    acc_wc_s

*** Test Cases ***
Verify Execute Last Search
    Login To WC By Power User
    Open User Settings Popup
    Click Actions At Login Tab
    ${lastSearchStatus}    Get Checkbox Repeat Last Executed Search Status
    Check Checkbox Repeat Last Executed Search
    Click Save User Settings Via Search Page
    ${randomText}    Generate Random String    10    [LOWER]
    Search By Text    ${randomText}
    Logout
    Login To WC By Power User
    Search Input Should Be    "${randomText}"
    Open User Settings Popup
    Click Actions At Login Tab
    Set Checkbox Repeat Last Executed Search Status    ${lastSearchStatus}
    Click Save User Settings Via Search Page