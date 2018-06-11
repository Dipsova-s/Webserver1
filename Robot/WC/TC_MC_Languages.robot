*** Settings ***
Resource                  ${EXECDIR}/resources/WCSettings.robot
Suite Setup               Open Browser in Sandbox Mode
Suite Teardown            Close Browser
Test Setup                Go To               ${URL_MC}
Test Teardown             Logout MC
Force Tags                smk_mc_s

*** Variables ***
${LanguageName}    Arabic

*** Test Cases ***
Test Languages
    Login To MC By Admin User
    Wait Until Overview Page Loaded
    Go To Languages Page
    Add Languages And Select Language    ${LanguageName}
    Verify Language Were Added    ${languageName}
    Verify Language Under Model EA2_800    ${languageName}
    Go Back To Languages Page
    Click Delete Language By Language Name    ${languageName}
    Click Save And Delete Language
