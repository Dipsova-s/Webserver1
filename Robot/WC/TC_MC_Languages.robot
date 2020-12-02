*** Settings ***
Resource                  ${EXECDIR}/resources/WCSettings.robot
Suite Setup               Open Browser in Sandbox Mode
Suite Teardown            Close Browser
Test Setup                Go To               ${URL_MC}
Force Tags                smk_mc_s

*** Variables ***
${LanguageName}    Spanish

*** Test Cases ***
Test Languages
    [Documentation]     Verify delete a language and add a language function 
    ...                 Risk/coverage area: MC Language screen
    [Tags]      TC_C576     TC_C577
    Login To MC By Admin User
    Wait Until Overview Page Loaded
    Go To Languages Page
    Click Delete Language By Language Name    ${languageName}
    Click Save And Delete Language
    Add Languages And Select Language    ${LanguageName}
    Verify Language Were Added    ${languageName}
    Verify Language Under Model EA2_800    ${languageName}
    Go Back To Languages Page
