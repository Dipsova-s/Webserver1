*** Variables ***
${txtFitlerAvailableProperties}    txtFitlerAvailableProperties
${btnFitlerAvailableProperties}    btnFitlerAvailableProperties
${btnFieldChooser}    css=#btn-popupFieldChooser1 > span
${tblFieldList}    jquery=#DisplayPropertiesGrid .k-grid-content
${pgbFieldChooser}    jquery=#DisplayPropertiesGrid .k-loading-mask
${popupFieldChooser}    css=#popupFieldChooser

${btnFieldChooserFullMode}      LongProperty
${btnFiedlChooserCompactMode}     ShortProperty

${divFieldChooserDetail}         css=.fieldChooserGridContainer .detail

*** Keywords ***
Wait Progress Bar Field Chooser Search Closed
    Wait Until Page Does Not Contain Element    ${pgbFieldChooser}

Click Insert Field From Field Chooser
    Wait Until Ajax Complete
    Click Element   ${btnFieldChooser}
    Wait Until Ajax Complete

Fill In Search Field Chooser
    [Arguments]   ${searchText}
    Input Text By JQuery   ${txtFitlerAvailableProperties}    ${searchText}
    Press Key    ${txtFitlerAvailableProperties}    \\13
    Sleep    ${TIMEOUT_GENERAL}
    Wait Until Ajax Complete
    Wait Progress Bar Field Chooser Search Closed
    #Wait Until Element Contains    ${tblFieldList}    ${searchText}

Choose Field Chooser From Search Result
    [Arguments]   ${fieldId}
    Click Element    jquery=#DisplayPropertiesGrid [id="${fieldId}"] td:eq(2)

Click Set Field Chooser View To Full Mode
    Wait Until Element Is Visible    ${btnFieldChooserFullMode}
    Click Element    ${btnFieldChooserFullMode}

Click Set Field Chooser View To Compact Mode
    Wait Until Element Is Visible    ${btnFiedlChooserCompactMode}
    Click Element    ${btnFiedlChooserCompactMode}