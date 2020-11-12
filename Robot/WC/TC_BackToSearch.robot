*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Force Tags          acc_wc_s

*** Test Cases ***
Verify Back To Search
    [Documentation]     This test verifies whether search text is remembered in search box of search page
    [Tags]  acc_wc_aci_s    TC_C231294
    Search By Text And Expect In Search Result    Angle For General Test
    Open New Seach Page
    Switch Window    MAIN
    Open Angle From First Angle in Search Page    Angle For General Test
    
    ${handle2}   Switch Window    NEW
    Select Search Filter Is Starred
    Reload Search Page

    Switch Window    MAIN
    Reload Angle Page
    Back To Search

    Search Input Should Be    "Angle For General Test"
    Checkbox Is Starred Should Not Be Selected