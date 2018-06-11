*** Settings ***
Resource            ${EXECDIR}/WC/POM/ManagementConsole/GlobalSettings/Languages.robot

*** Keywords ***
Go To Languages Page
    Wait Side Menu Ready
    Click Side Menu Global Settings
    Click Side Menu Languages
    Wait Until Languages Page Loaded

Add Languages And Select Language
    [Arguments]     ${languageName}
    Click Add New Language
    Select Language Dropdown    ${languageName}
    Sleep    ${TIMEOUT_GENERAL}
    Click Save Language Without Delete

Verify Language Were Added
    [Arguments]     ${languageName}
    Wait Until Page Contains Element    ${trRowInLanguageGrid}:Contains(${languageName})
    Capture Page Screenshot

Verify Language Under Model EA2_800
    [Arguments]     ${languageName}
    Click Side Menu Models
    Click Side Menu Models EA2_800
    Click Side Menu Model Languages
    Wait Until Page Contains Element    ${trRowInModelLanguageGrid}:Contains(${languageName})

Go Back To Languages Page
    Click Side Menu Global Settings
    Click Side Menu Languages
    Wait Until Languages Page Loaded
