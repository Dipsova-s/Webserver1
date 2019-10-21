*** Variables ***
${txtFitlerAvailableProperties}    txtFitlerAvailableProperties
${btnFitlerAvailableProperties}    btnFitlerAvailableProperties
${btnSubmitFieldChooser}    css=#btn-popupFieldChooser0 > span
${tblFieldList}    jquery=#DisplayPropertiesGrid .k-grid-content
${pgbFieldChooser}    jquery=#DisplayPropertiesGrid .k-loading-mask
${popupFieldChooser}    css=#popupFieldChooser
${btnCloseFieldChooser}    css=#popupFieldChooser_wnd_title + .k-window-actions .k-i-close

${btnFieldChooserFullMode}      LongProperty
${btnFiedlChooserCompactMode}     ShortProperty

${divFieldChooserDetail}         css=.fieldChooserGridContainer .detail
${divFieldSource}                jquery=#NewColumnFilter .FilterTab-metadata:eq(0) 
${chkSourceSelf}                 jquery=#source_Checkbox input:eq(0)

*** Keywords ***
Wait Until Field Chooser Loaded
    Sleep    ${TIMEOUT_GENERAL}
    Wait Until Ajax Complete
    Wait Until Page Does Not Contain Element    ${pgbFieldChooser}

Close Field Chooser Popup
    Click Element    ${btnCloseFieldChooser}

Click Insert Field From Field Chooser
    Wait Until Ajax Complete
    Click Element   ${btnSubmitFieldChooser}
    Wait Until Ajax Complete

Click Field Chooser Info
    [Arguments]  ${fieldId}
    Click Element    jquery=#DisplayPropertiesGrid [id="${fieldId}"] .btnInfo
    Wait Until Ajax Complete

Fill In Search Field Chooser
    [Arguments]   ${searchText}
    Input Text By JQuery   ${txtFitlerAvailableProperties}    ${searchText}
    Press Keys    ${txtFitlerAvailableProperties}    RETURN
    Wait Until Field Chooser Loaded

Choose Field Chooser From Search Result
    [Arguments]   ${fieldId}
    Click Element    jquery=#DisplayPropertiesGrid [id="${fieldId}"] td:eq(2)

Click Set Field Chooser View To Full Mode
    Wait Until Element Is Visible    ${btnFieldChooserFullMode}
    Click Element    ${btnFieldChooserFullMode}

Click Set Field Chooser View To Compact Mode
    Wait Until Element Is Visible    ${btnFiedlChooserCompactMode}
    Click Element    ${btnFiedlChooserCompactMode}

Select Field Source(Self)
    Wait Until Ajax Complete
    Wait Until Element Is Visible    ${divFieldSource}
    Click Element    ${divFieldSource}
    Select Checkbox    ${chkSourceSelf}   
    Wait Until Ajax Complete 