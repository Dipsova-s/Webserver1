*** Variables ***
${divItemInfoPopup}                 css=#popupImportAngle
${ddlModelImportAngle}              css=#ddlModelImportAngle_ddlWrapper
${fileUploadAngles}                 css=#ImportAngle
${divPopupUploadReport}             css=#popupCompleteUploadReport
${btnCloseUploadAnglesReport}       jquery=.popupCompleteUploadReport .k-i-close

*** Keywords ***
Wait Upload Angles Popup Loaded
    Wait Until Page Contains Element    ${ddlModelImportAngle}
    Wait Until Page Contains Element    ${fileUploadAngles}

Select Model To Upload
    [Arguments]    ${modelName}
    Select Dropdown By Text    ${ddlModelImportAngle}    ${modelName}

Select Upload Item File
    [Arguments]    ${filename}
    Choose File    ${fileUploadAngles}    ${EXECDIR}/resources/${filename}

Wait Upload Items Successful
    Wait Until Page Contains Element    ${btnCloseUploadAnglesReport}
    Sleep    3s

Close Upload Item Report Popup
    Click Element    ${btnCloseUploadAnglesReport}

Upload Item Report Should Show Failure
    Page Should Contain Element  ${divPopupUploadReport} .fail

Upload Item Report Should Not Show Failure
    Page Should Not Contain Element  ${divPopupUploadReport} .fail