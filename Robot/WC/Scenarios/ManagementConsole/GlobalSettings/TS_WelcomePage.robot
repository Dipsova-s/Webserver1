*** Settings ***
Resource            ${EXECDIR}/WC/POM/ManagementConsole/GlobalSettings/WelcomePage.robot
Resource            ${EXECDIR}/WC/POM/ManagementConsole/Overview.robot

*** Keywords ***
Go To Welcome Page
    Click Side Menu Global Settings
    Click Side Menu Welcome Page
    Wait Until Page Contains Element    ${btnSaveWelcomePage}
    Wait Until Page Contains Element    ${btnGenerateVideoThumbnails}
    Wait Until Page Contains Element    ${ddlSelectLanguage}
    Wait Until Page Contains Element    ${btnUploadCustomerLogo}

Assert Welcome Page Available Languages
    Click Select Language
    Wait Until Page Contains    English
    Wait Until Page Contains    German
    Wait Until Page Contains    Spanish
    Wait Until Page Contains    French
    Wait Until Page Contains    Dutch
    Click Select Language
    Sleep    ${TIMEOUT_GENERAL}

Select Language And Input Welcome page Textbox 1
    [Arguments]     ${languageName}      ${valueText}
    Select Language To Welcome Page     ${languageName}
    Input Welcome Page Textbox 1    ${valueText}

Assert Welcome Page Textbox 1
    [Arguments]     ${languageName}      ${expectedText}
    Select Language To Welcome Page     ${languageName}
    ${text}     Get Welcome Page Textbox 1 Value
    Should Be Equal     ${text}     ${expectedText}

Assert Welcome Page Textbox 2
    [Arguments]      ${expectedText}
    ${text}     Get Welcome Page Textbox 2 Value
    Should Be Equal     ${text}     ${expectedText}





