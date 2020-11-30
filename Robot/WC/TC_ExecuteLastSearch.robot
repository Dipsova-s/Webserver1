*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Test Teardown       Go to Search Page
Force Tags          acc_wc_s

*** Test Cases ***
Verify Execute Last Search
    [Documentation]     This test verifies that checking repeat last executed search checkbox in actions at login makes search page open with same last searched string
    [Tags]  acc_wc_aci_s   TC_C231298
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