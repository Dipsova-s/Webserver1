*** Variables ***
${btnSaveWelcomePage}             css=.btnSave
${btnGenerateVideoThumbnails}     css=.btnGenerateThumbnails

${ddlSelectLanguage}           css=span[aria-owns=SelectWelcomeLanguage_listbox]
${btnUploadCustomerLogo}       companyLogo

${txtTextbox1}                 IntroductionText
${txtTextbox2}                 NewsText

${imgPreviewCustomerLogo}      .contentSectionWelcomeLogoItem img

*** Keywords ***
Select Language To Welcome Page
    [Arguments]     ${languageName}
    Wait Until Page Contains Element    ${ddlSelectLanguage}
    Select Dropdown By InnerText    ${ddlSelectLanguage}    ${languageName}
    Sleep    ${TIMEOUT_GENERAL}

Click Select Language
    Wait Until Element Is Visible    ${ddlSelectLanguage}
    Click Element    ${ddlSelectLanguage}

Input Welcome Page Textbox 1
    [Arguments]    ${valueText}
    Wait Until Page Contains Element    ${txtTextbox1}
    Input kendo Text Editor    ${txtTextbox1}    ${valueText}

Input Welcome Page Textbox 2
    [Arguments]    ${valueText}
    Wait Until Page Contains Element    ${txtTextbox2}
    Input kendo Text Editor    ${txtTextbox2}    ${valueText}

Click Upload Customer Logo
    [Arguments]    ${filePath}
    Wait Until Page Contains Element    ${btnUploadCustomerLogo}
    Choose File     ${btnUploadCustomerLogo}    ${filePath}

Click Generate Video Thumbnails
    Wait Until Page Contains Element    ${btnGenerateVideoThumbnails}
    Click Element    ${btnGenerateVideoThumbnails}
    Wait MC Progress Bar Closed

Click Save Welcome Page
    Wait Until Element Is Visible    ${btnSaveWelcomePage}
    Click Element    ${btnSaveWelcomePage}
    Wait MC Progress Bar Closed

Get Preview Customer Image Path
    ${imagePath}    Execute Javascript    return $('${imgPreviewCustomerLogo}').attr('src');
    [Return]    ${imagePath}