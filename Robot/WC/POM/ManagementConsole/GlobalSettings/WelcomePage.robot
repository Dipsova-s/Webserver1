*** Variables ***
${btnSaveWelcomePage}             css=.btnSave
${btnGenerateVideoThumbnails}     css=.btnGenerateThumbnails

${ddlSelectLanguage}           css=span[aria-owns=SelectWelcomeLanguage_listbox]
${btnUploadCustomerLogo}       companyLogo

${txtTextbox1}                 IntroductionText
${txtTextbox2}                 NewsText

${imgPreviewCustomerLogo}      .contentSectionWelcomeLogoItem img

${imgUploadedCustomerLogo}        css=.contentSectionWelcomeLogoItem > img[src*="logo_EN"]

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
    Clear Element text      ${txtTextbox1}
    Input kendo Text Editor    ${txtTextbox1}    ${valueText}

Input Welcome Page Textbox 2
    [Arguments]    ${valueText}
    Wait Until Page Contains Element    ${txtTextbox2}
    Clear Element text      ${txtTextbox2}
    Input kendo Text Editor    ${txtTextbox2}    ${valueText}

Get Welcome Page Textbox 1 Value
    ${textInTextBox1ITMC}=    Get Value    ${txtTextbox1}
    [Return]    ${textInTextBox1ITMC}

Get Welcome Page Textbox 2 Value
    ${textInTextBox2ITMC}=    Get Value    ${txtTextbox2}
    [Return]    ${textInTextBox2ITMC}

Click Upload Customer Logo
    [Arguments]    ${filePath}
    Wait Until Page Contains Element    ${btnUploadCustomerLogo}
    Choose File     ${btnUploadCustomerLogo}    ${filePath}

Check Upload success of Customer Logo
    Wait Until Element Is Visible       ${imgUploadedCustomerLogo}
    Page Should Contain Image       ${imgUploadedCustomerLogo}
    ${imageSrc}=   Get Element Attribute     ${imgUploadedCustomerLogo}     src
    Run Keyword And Return Status       Should Contain      ${imageSrc}     logo_EN.png

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