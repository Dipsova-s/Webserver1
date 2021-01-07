*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Open Browser in Sandbox Mode
Suite Teardown      Close Browser
Test Setup          Go To               ${URL_WC}
Test Teardown       Logout
Force Tags          smk_wc

*** Test Cases ***
Copy And Delete Angle Via Search Action Test
    [Documentation]     Verifying  Copy angle search action button
    [Tags]              TC_C231296  
    Copy And Delete Angle Via Search Page    Angle For General Test
