*** Variables ***
${divItemInfoPopup}                 css=#popupImportAngle
${ddlModelImportAngle}              css=#ddlModelImportAngle_ddlWrapper
${fileUploadAngles}                 css=#ImportAngle
${btnCloseUploadanglesReport}       jquery=.popupCompleteUploadReport .k-link:contains(Close)

*** Keywords ***
Wait Upload Angles Popup Loaded
    Wait Until Page Contains Element    ${ddlModelImportAngle}
    Wait Until Page Contains Element    ${fileUploadAngles}

Select Model To Upload
    [Arguments]    ${modelName}
    Select Dropdown By Text    ${ddlModelImportAngle}    ${modelName}

Select Angle Json File
    [Arguments]    ${angleJsonFilename}
    Choose File    ${fileUploadAngles}    ${EXECDIR}/resources/${angleJsonFilename}

Wait Upload Angles Successful
    [Arguments]    ${angleName}
    Wait Until Page Contains    Upload Angles successful
    Click Element    ${btnCloseUploadanglesReport}
    Check Existing Angle From Search Result    ${angleName}
