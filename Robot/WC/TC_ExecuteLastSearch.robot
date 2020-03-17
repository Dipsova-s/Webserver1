*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Test Teardown       Go to Search Page
Force Tags          acc_wc_s

*** Test Cases ***
Verify Execute Last Search
    [Tags]  acc_wc_aci_s
    Open User Settings Panel
    Click User Tab
    ${lastSearchStatus}    Get Checkbox Repeat Last Executed Search Status
    Check Checkbox Repeat Last Executed Search
    Click Save User Settings
    ${randomText}    Generate Random String    10    [LOWER]
    Search By Text    ${randomText}
    Logout
    Login To WC By Power User
    Search Input Should Be    "${randomText}"
    Open User Settings Panel
    Click User Tab
    Set Checkbox Repeat Last Executed Search Status    ${lastSearchStatus}
    Click Save User Settings