*** Variables ***
${trRowInLabelCategoryGrid}                  jquery=#LabelCategoryGrid tbody tr
${txtLabelCategoryID}                        .field_id

${trRowInLabelsGrid}                         jquery=#LabelsGridContainer tbody tr
${divLabelsGridContent}                      jquery=#LabelsGridContainer .k-grid-content
${btnDeleteLabel}                            .btnDelete

${trNewLabelRow}                             .newRow

${txtEnglishLabel}                           input[name="lang_en"]
${txtGermanLabel}                            input[name="lang_de"]
${txtSpanishLabel}                           input[name="lang_es"]
${txtFrenchLabel}                            input[name="lang_fr"]
${txtDutchLabel}                             input[name="lang_nl"]

${txtAbbreviationNewLabel}                   input[name="id"]
${txtEnglishNewLabel}                        input[name="en"]


${addNewLabel}                               css=.gridToolbarBottom .btnAdd

${btnSaveLabelCategory}                      css=.btnSave
${btnCancelEditLabelCategory}                css=.btnBack

${listOfLabelsData}                          //div[@class='k-grid-content']//descendant::td[@role='gridcell']//input[@type='text']


#Delete Label Category Popup
${btnConfirmDeleteLabel}               css=#popupConfirmation .btnSubmit
${btnCancelDeleteLabel}                css=#popupConfirmation .btnConfirmCancel

*** Keywords ***
Wait Until Add New Label Category Page Loaded
    Wait MC Progress Bar Closed
    Wait Until Ajax Complete
    Wait Until Page Contains    Create new label category
    Wait Until Page Contains Element    ${trRowInLabelCategoryGrid}


Wait Until Edit Label Category Page Loaded
    Wait MC Progress Bar Closed
    Wait Until Ajax Complete
    Wait Until Page Contains    Edit label category
    Wait Until Page Contains Element    ${trRowInLabelCategoryGrid}
    Wait Until Page Contains Element    ${divLabelsGridContent}

Click Save New Label Category
    Wait Until Element Is Visible    ${btnSaveLabelCategory}
    Click Element    ${btnSaveLabelCategory}
    Wait MC Progress Bar Closed
    Wait Until Edit Label Category Page Loaded

Click Save Edit Label Category
    Wait Until Element Is Visible    ${btnSaveLabelCategory}
    Click Element    ${btnSaveLabelCategory}
    Wait MC Progress Bar Closed
    Wait Until Label Categories Page Loaded

Click Cancel Edit Label Category
    Wait Until Element Is Visible    ${btnCancelEditLabelCategory}
    Click Element    ${btnCancelEditLabelCategory}
    Wait MC Progress Bar Closed
    Wait Until Label Categories Page Loaded

Click Add New Label
    Wait Until Element Is Visible    ${addNewLabel}
    Wait Until Page Contains Element    ${addNewLabel}
    Click Element    ${addNewLabel}

Click Delete Label By Abbreviation
    [Arguments]    ${abbreviation}
    Click Action In Grid By Name     ${abbreviation}    ${trRowInLabelsGrid}    ${btnDeleteLabel}

Click Confirm Delete Label
    Wait Until Page Contains Element    ${btnConfirmDeleteLabel}
    Click Element    ${btnConfirmDeleteLabel}
    Wait MC Progress Bar Closed

Click Cancel Delete Label
    Wait Until Page Contains Element    ${btnCancelDeleteLabel}
    Click Element    ${btnCancelDeleteLabel}
    Wait MC Progress Bar Closed

#Add/Edit Lable Category
Add Or Edit Label Category ID
    [Arguments]    ${text}
    Wait Until Page Contains Element    ${trRowInLabelCategoryGrid} ${txtLabelCategoryID}
    Input Text    ${trRowInLabelCategoryGrid} ${txtLabelCategoryID}    ${text}

Add Or Edit Label Category English
    [Arguments]    ${text}
    Wait Until Page Contains Element    ${trRowInLabelCategoryGrid} ${txtEnglishLabel}
    Input Text    ${trRowInLabelCategoryGrid} ${txtEnglishLabel}    ${text}

Add Or Edit Label Category German
    [Arguments]    ${text}
    Wait Until Page Contains Element    ${trRowInLabelCategoryGrid} ${txtGermanLabel}
    Input Text    ${trRowInLabelCategoryGrid} ${txtGermanLabel}    ${text}

Add Or Edit Label Category Spanish
    [Arguments]    ${text}
    Wait Until Page Contains Element    ${trRowInLabelCategoryGrid} ${txtSpanishLabel}
    Input Text    ${trRowInLabelCategoryGrid} ${txtSpanishLabel}    ${text}

Add Or Edit Label Category French
    [Arguments]    ${text}
    Wait Until Page Contains Element    ${trRowInLabelCategoryGrid} ${txtFrenchLabel}
    Input Text    ${trRowInLabelCategoryGrid} ${txtFrenchLabel}    ${text}

Add Or Edit Label Category Dutch
    [Arguments]    ${text}
    Wait Until Page Contains Element    ${trRowInLabelCategoryGrid} ${txtDutchLabel}
    Input Text    ${trRowInLabelCategoryGrid} ${txtDutchLabel}    ${text}

#Verify Label Category data
Verify Each Data Of Label Category
    [Arguments]     ${labelCategoryName}    ${labelName}
    ${count}        Get Element Count        ${listOfLabelsData}
    @{labelsDataList}      Create List
    :FOR    ${i}    IN RANGE    1   ${count} + 1
    \    ${labelsName}    Get Value    (${listOfLabelsData})[${i}]  
    \    ${labelNameString}=     Encode String To Bytes      ${labelsName}     UTF-8
    \    Append To List      ${labelsDataList}   ${labelNameString}
    Log     ${labelsDataList}

    :FOR    ${i}    IN RANGE    0   ${count} - 6
    \   Should Be Equal As Strings   @{labelsDataList}[${i}]     ${labelCategoryName}

    :FOR    ${j}    IN RANGE    6   ${count}
    \   Should Be Equal As Strings   @{labelsDataList}[${j}]     ${labelName}

#Edit Lable
Edit English Label By Abbreviation
    [Arguments]    ${abbreviation}    ${text}
    Wait Until Page Contains Element    ${trRowInLabelsGrid}:contains(${abbreviation}) ${txtEnglishLabel}
    Input Text    ${trRowInLabelsGrid}:contains(${abbreviation}) ${txtEnglishLabel}    ${text}

Edit German Label By Abbreviation
    [Arguments]    ${abbreviation}    ${text}
    Wait Until Page Contains Element    ${trRowInLabelsGrid}:contains(${abbreviation}) ${txtGermanLabel}
    Input Text    ${trRowInLabelsGrid}:contains(${abbreviation}) ${txtGermanLabel}    ${text}

Edit Spanish Label By Abbreviation
    [Arguments]    ${abbreviation}    ${text}
    Wait Until Page Contains Element    ${trRowInLabelsGrid}:contains(${abbreviation}) ${txtSpanishLabel}
    Input Text    ${trRowInLabelsGrid}:contains(${abbreviation}) ${txtSpanishLabel}    ${text}

Edit French Label By Abbreviation
    [Arguments]    ${abbreviation}    ${text}
    Wait Until Page Contains Element    ${trRowInLabelsGrid}:contains(${abbreviation}) ${txtFrenchLabel}
    Input Text    ${trRowInLabelsGrid}:contains(${abbreviation}) ${txtFrenchLabel}    ${text}

Edit Dutch Label By Abbreviation
    [Arguments]    ${abbreviation}    ${text}
    Wait Until Page Contains Element    ${trRowInLabelsGrid}:contains(${abbreviation}) ${txtDutchLabel}
    Input Text    ${trRowInLabelsGrid}:contains(${abbreviation}) ${txtDutchLabel}    ${text}

#Add Label
Add Abbreviation To Label
    [Arguments]    ${text}
    Wait Until Page Contains Element    ${trRowInLabelsGrid}${trNewLabelRow} ${txtAbbreviationNewLabel}
    Input Text    ${trRowInLabelsGrid}${trNewLabelRow} ${txtAbbreviationNewLabel}    ${text}

Add English Label
    [Arguments]    ${text}
    Wait Until Page Contains Element    ${trRowInLabelsGrid}${trNewLabelRow} ${txtEnglishNewLabel}
    Input Text    ${trRowInLabelsGrid}${trNewLabelRow} ${txtEnglishNewLabel}    ${text}

Add German Label
    [Arguments]    ${text}
    Wait Until Page Contains Element    ${trRowInLabelsGrid}${trNewLabelRow} ${txtGermanLabel}
    Input Text    ${trRowInLabelsGrid}${trNewLabelRow} ${txtGermanLabel}    ${text}

Add Spanish Label
    [Arguments]    ${text}
    Wait Until Page Contains Element    ${trRowInLabelsGrid}${trNewLabelRow} ${txtSpanishLabel}
    Input Text    ${trRowInLabelsGrid}${trNewLabelRow} ${txtSpanishLabel}    ${text}

Add French Label
    [Arguments]    ${text}
    Wait Until Page Contains Element    ${trRowInLabelsGrid}${trNewLabelRow} ${txtFrenchLabel}
    Input Text    ${trRowInLabelsGrid}${trNewLabelRow} ${txtFrenchLabel}    ${text}

Add Dutch Label
    [Arguments]    ${text}
    Wait Until Page Contains Element    ${trRowInLabelsGrid}${trNewLabelRow} ${txtDutchLabel}
    Input Text    ${trRowInLabelsGrid}${trNewLabelRow} ${txtDutchLabel}    ${text}
