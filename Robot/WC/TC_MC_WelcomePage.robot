*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Open Browser in Sandbox Mode
Suite Teardown      Close Browser
Test Setup          Go To               ${URL_MC}
Test Teardown       Logout MC
Force Tags          MC   smk_mc

*** Variables ***
${fileImagePath}                           ${EXECDIR}/resources/test.png
${filePath}                                ${EXECDIR}/resources/Robot-Test-1.eapackage

*** Test Cases ***
Test Welcome Page
    Login To MC By Admin User
    Wait Until Overview Page Loaded
    Go To Welcome Page
    ${currentCustomerLogo}=     Get Preview Customer Image Path
    Click Upload Customer Logo    ${filePath}
    ${customerLogoAfterUploadInvalidPath}=     Get Preview Customer Image Path
    Should Contain    ${currentCustomerLogo}    ${customerLogoAfterUploadInvalidPath}
    Click Upload Customer Logo    ${fileImagePath}
    ${customerLogoAfterUploadValidPath}=     Get Preview Customer Image Path
    Should Not Contain    ${currentCustomerLogo}    ${customerLogoAfterUploadValidPath}
    Input Welcome Page Textbox 1    Test Textbox 1 English Language
    Click Select Language
    Wait Until Page Contains    English
    Wait Until Page Contains    German
    Wait Until Page Contains    Spanish
    Wait Until Page Contains    French
    Wait Until Page Contains    Dutch
    Click Select Language
    Sleep    ${TIMEOUT_GENERAL}
    Select Language To Welcome Page    Dutch
    Input Welcome Page Textbox 1    Test Textbox 1 Dutch Languange
    Select Language To Welcome Page    English
    ${textInTextBox1}=    Get Value    ${txtTextbox1}
    Should Be Equal    ${textInTextBox1}    Test Textbox 1 English Language
    Select Language To Welcome Page    Dutch
    ${textInTextBox1}=    Get Value    ${txtTextbox1}
    Should Be Equal    ${textInTextBox1}    Test Textbox 1 Dutch Languange
    Click Save Welcome Page

