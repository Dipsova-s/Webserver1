*** Variables ***
${btnSaveCustomIcons}                      css=.btnSave

${trRowInCustomIconsGrid}                    jquery=#FieldCategoryGrid tbody tr
${btnEditCustomIcons}                        .btnGroupContainer>.btn
${btnActionDeleteCustomIcons}                .btnGroupInner .btnDelete

${txtCustomIconsFieldType}                   input[name="editId"]
${btnCustomIconsUpload32}                    .upload16 input[name="files"]
${btnCustomIconsUpload64}                    .upload32 input[name="files"]
${iconFilePath}                               ${EXECDIR}/resources/test.png

${trNewCustomIconsRow}                       .newRow
${trEditCustomIconsRow}                      .editRow

${addNewIcon}                                css=.pageCustomIcons .btnAdd

#Delete Custom Icons Popup
${btnConfirmDeleteCustomIcons}               css=#popupConfirmAction .btnSubmit

*** Keywords ***
Wait Until Custom Icons Page Loaded
    Wait MC Progress Bar Closed
    Wait Until Ajax Complete
    Wait Custom Icons By Field Type    EA

Wait Custom Icons By Field Type
    [Arguments]    ${fieldType}
    Wait Until Page Contains Element    css=#row-${fieldType}

Click Edit Custom Icons By Field Name
    [Arguments]    ${fieldType}
    Click Action In Grid By Name     ${fieldType}    ${trRowInCustomIconsGrid}    ${btnEditCustomIcons}

Click Edit Custom Icons Action By Field Type
    [Arguments]    ${fieldType}
    Click Show Action Dropdown In Grid By Name    ${fieldType}    ${trRowInCustomIconsGrid}

Edit Custom Icons Field Type
    [Arguments]    ${fieldType}
    Wait Until Page Contains Element    css=${trEditCustomIconsRow} ${txtCustomIconsFieldType}
    Input Text    css=${trEditCustomIconsRow} ${txtCustomIconsFieldType}   ${fieldType}

Edit Custom Icons File Size 16
    Wait Until Page Contains Element    css=${trEditCustomIconsRow} ${btnCustomIconsUpload32}
    Choose File    css=${trEditCustomIconsRow} ${btnCustomIconsUpload32}    ${iconFilePath}

Edit Custom Icons File Size 32
    Wait Until Page Contains Element    css=${trEditCustomIconsRow} ${btnCustomIconsUpload64}
    Choose File    css=${trEditCustomIconsRow} ${btnCustomIconsUpload64}    ${iconFilePath}

Add Custom Icons Field Type
    [Arguments]    ${fieldType}
    Wait Until Page Contains Element    css=${trNewCustomIconsRow} ${txtCustomIconsFieldType}
    Input Text    css=${trNewCustomIconsRow} ${txtCustomIconsFieldType}    ${fieldType}

Add Custom Icons File Size 16
    Wait Until Page Contains Element    css=${trNewCustomIconsRow} ${btnCustomIconsUpload32}
    Choose File    css=${trNewCustomIconsRow} ${btnCustomIconsUpload32}    ${iconFilePath}

Add Custom Icons File Size 32
    Wait Until Page Contains Element    css=${trNewCustomIconsRow} ${btnCustomIconsUpload64}
    Choose File    css=${trNewCustomIconsRow} ${btnCustomIconsUpload64}    ${iconFilePath}

Click Add New Icon
    Wait Until Page Contains Element    ${addNewIcon}
    Click Element    ${addNewIcon}

Click Delete Custom Icons Action By Field Name
    [Arguments]    ${fieldType}
    Click Edit Custom Icons Action By Field Type    ${fieldType}
    Click Action In Grid By Name     ${fieldType}    ${trRowInCustomIconsGrid}    ${btnActionDeleteCustomIcons}

Click Save Custom Icons
    Sleep    ${TIMEOUT_LARGEST}
    Click Element    ${btnSaveCustomIcons}
    Wait Until Custom Icons Page Loaded

Click Save Custom Icons With Delete Exist Icons
    Sleep    ${TIMEOUT_LARGEST}
    Click Element    ${btnSaveCustomIcons}
    Wait Until Page Contains    Deleted Icons
    Wait Until Page Contains Element    ${btnConfirmDeleteCustomIcons}
    Click Element    ${btnConfirmDeleteCustomIcons}
    Wait Until Custom Icons Page Loaded