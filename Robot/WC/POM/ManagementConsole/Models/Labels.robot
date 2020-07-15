*** Variables ***
${listCategory}                             //td[@role='gridcell'][2]
${listCategoryMove}                         //a[@class='btnMove']
${listLabels}                               //td[@role='gridcell'][3]
${labelCategoryNameText}                    //td[contains(text(),'
${labelActive}                              ')]//following-sibling::td//label//input[@name='activeForModel']
${labelValid}                               ')]//following-sibling::td//label//input[@name='used_for_authorization']
${labelRequired}                            ')]//following-sibling::td//label//input[@name='is_required']
${filterTextbox}                            //input[@id='FilterLabelCategoryTextbox']

*** Keywords ***
Verify Category Data
    [Arguments]     ${expectedName}
    ${returnedNameList}=    Create a List of String     ${listCategory}
    ${count}        Get Element Count        ${listCategory}

    :FOR    ${j}    IN RANGE    1   ${count} + 1
    \   List Should Contain Value   ${returnedNameList}[${j}]     ${expectedName}

Verify Labels Data
    [Arguments]     ${expectedName}
    ${returnedNameList}=    Create a List of String     ${listLabels}
    ${count}        Get Element Count        ${listLabels}

    :FOR    ${j}    IN RANGE    1   ${count} + 1
    \   List Should Contain Value   ${returnedNameList}[${j}]     ${expectedName}

Verify Filtering
    [Arguments]     ${labelCategoryName}    ${labelName}
    Wait Until Element Is Visible   ${filterTextbox}
    Input text      ${filterTextbox}    ${labelCategoryName}
    Press Keys    ${filterTextbox}    RETURN
    Wait Until Label Grid Loaded
    Verify Existence of Label category      ${labelCategoryName}
    Clear Element text      ${filterTextbox}
    Press Keys    ${filterTextbox}    RETURN
    Wait Until Label Grid Loaded
    Verify Existence of Label category      ${labelCategoryName}
    Input text      ${filterTextbox}    ${labelName}
    Press Keys    ${filterTextbox}    RETURN
    Wait Until Label Grid Loaded
    Verify Existence of Labels      ${labelName}
    Clear Element text      ${filterTextbox}
    Press Keys    ${filterTextbox}    RETURN
    Wait Until Label Grid Loaded
    Verify Existence of Labels      ${labelName}

Wait Until Label Grid Loaded
    Sleep    ${TIMEOUT_GENERAL}
    Wait Until Page Does Not Contain Element    ${gridLoading}
    Wait MC Progress Bar Closed
    Sleep    ${TIMEOUT_GENERAL}

Selecting Checkboxes
    [Arguments]     ${labelCategoryName}
    Select Checkbox      ${labelCategoryNameText}${labelCategoryName}${labelActive}
    Select Checkbox      ${labelCategoryNameText}${labelCategoryName}${labelValid}
    Select Checkbox      ${labelCategoryNameText}${labelCategoryName}${labelRequired}

Unselecting Checkboxes
    [Arguments]     ${labelCategoryName}    
    Unselect Checkbox      ${labelCategoryNameText}${labelCategoryName}${labelRequired}
    Unselect Checkbox      ${labelCategoryNameText}${labelCategoryName}${labelValid}
    Unselect Checkbox      ${labelCategoryNameText}${labelCategoryName}${labelActive}

Verify Reordering
    [Arguments]     ${labelCategoryName}
    ${count}        Get Element Count       ${listCategoryMove}
    ${beforeDragDropList}=    Create a List of String     ${listCategory}
    ${count}        Get Element Count        ${listCategory}

    Drag And Drop       (${listCategoryMove})[${count}]      (${listCategoryMove})[1]
    Sleep       2s

    ${afterDragDropList}=    Create a List of String     ${listCategory}
    ${count}        Get Element Count        ${listCategory}

    ${firstElementValueAfterDragDrop}=    Get From List     ${afterDragDropList}    0
    ${lastElementValueBeforeDragDrop}=     Get From List     ${beforeDragDropList}   ${count-1}
    ${setfirstElementValueAfterDragDrop}=    Set Variable    ${firstElementValueAfterDragDrop}
    ${setLastElementValueBeforeDragDrop}=    Set Variable    ${lastElementValueBeforeDragDrop}
    Should be Equal As Strings      ${setfirstElementValueAfterDragDrop}    ${setLastElementValueBeforeDragDrop}
    
    :FOR    ${j}    IN RANGE    1   ${count}
    \   ${i}=       Convert To Integer      ${j}
    \   ${valueBeforeDragDrop}=     Get From List     ${beforeDragDropList}   ${i-1}
    \   ${setValueBeforeDragDrop}=    Set Variable    ${valueBeforeDragDrop}
    \   ${valueAfterDragDrop}=    Get From List     ${afterDragDropList}    ${i}
    \   ${setValueAfterDragDrop}=    Set Variable    ${valueAfterDragDrop}
    \   Should be Equal As Strings      ${setValueBeforeDragDrop}    ${setValueAfterDragDrop}

Create a List of String
    [Arguments]     ${listString}
    ${count}        Get Element Count        ${listString}
    @{nameList}      Create List
    :FOR    ${i}    IN RANGE    1   ${count} + 1
    \    ${name}    Get Text    (${listString})[${i}]
    \    ${nameString}=     Encode String To Bytes      ${name}     UTF-8
    \    Append To List      ${nameList}   ${nameString}
    [Return]    ${nameList}