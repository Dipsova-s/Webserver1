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





