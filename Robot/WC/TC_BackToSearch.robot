*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Force Tags          acc_wc_s

*** Test Cases ***
Verify Back To Search
    Search By Text And Expect In Search Result    Angle For General Test
    Open New Seach Page
    Select Window    MAIN
    Open Angle From First Angle in Search Page    Angle For General Test
    
    ${handle2}   Select Window    NEW
    Select Search Filter Is Starred
    Reload Search Page

    Select Window    MAIN
    Reload Angle Page
    Back To Search

    Search Input Should Be    "Angle For General Test"
    Checkbox Is Starred Should Not Be Selected