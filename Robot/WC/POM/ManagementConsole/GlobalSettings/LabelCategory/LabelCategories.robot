*** Variables ***
${divLabelCategoryGridContent}               jquery=#LabelCategoriesGridContainer .k-grid-content
${trRowInLabelCategoryList}                  jquery=#LabelCategoriesGridContainer tbody tr
${btnEditLabelCategory}                      .btnEdit
${btnDeleteLabelCategory}                    .btnGroupContainer .btnDelete

${addNewLabelCategory}                       css=.gridToolbarBottom .btnAdd

#Delete Label Category Popup
${btnConfirmDeleteLabelCategory}               css=#popupConfirmation .btnSubmit
${btnCancelDeleteLabelCategory}                css=#popupConfirmation .btnConfirmCancel

*** Keywords ***
Wait Until Label Categories Page Loaded
    Wait MC Progress Bar Closed
    Wait Until Page Contains    Label category settings
    Wait Until Page Contains Element    ${divLabelCategoryGridContent}
    Wait Until Ajax Complete

Click Edit Label Category By ID
    [Arguments]    ${id}
    Click Action In Grid By Name     ${id}    ${trRowInLabelCategoryList}    ${btnEditLabelCategory}
    Wait Until Edit Label Category Page Loaded

Click Action Dropdown Label Category By ID
    [Arguments]    ${id}
    Click Show Action Dropdown In Grid By Name    ${id}    ${trRowInLabelCategoryList}

Click Delete Label Category By ID
    [Arguments]    ${id}
    Click Action In Grid By Name     ${id}    ${trRowInLabelCategoryList}    ${btnDeleteLabelCategory}

Click Add New Label Category
    [Arguments]    ${labelCategoryName}
    ${chkLableExist}    Is Element Visible    ${trRowInLabelCategoryList}:contains(${labelCategoryName})
    Run Keyword If    ${chkLableExist} == True    Delete Label Category Setting    ${labelCategoryName}
    Add New Label Category

Add New Label Category
    Wait Until Element Is Visible    ${addNewLabelCategory}
    Click Element    ${addNewLabelCategory}
    Wait Until Add New Label Category Page Loaded

Click Confirm Delete Label Category
    Wait Until Page Contains Element    ${btnConfirmDeleteLabelCategory}
    Click Element    ${btnConfirmDeleteLabelCategory}
    Wait MC Progress Bar Closed

Click Cancel Delete Label Category
    Wait Until Page Contains Element    ${btnCancelDeleteLabelCategory}
    Click Element    ${btnCancelDeleteLabelCategory}