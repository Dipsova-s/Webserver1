*** Variables ***
${queryOperatorInput}           .query-operator .k-input
${argumentInputValue}           .input-argument-value.k-input
${argumentInputType}            .input-argument-type .k-input
${argumentInputPeriodValue}     .k-periodpicker-control .k-formatted-value.k-input
${filterDisplayName}            .item-header.displayNameContainer .textEllipsis
${btnIncreaseValue}             .filter-editor-arguments .icon-caret-right
${btnIncreaseNumberValue}       .filter-editor-arguments .icon-caret-up
${textInputValue}               .input-argument-typing
${rdoEditFilterBooleanYes}      .input-argument-boolean-value .input-argument-value.input-argument-true 
${txtDateInPut}                 .input-argument-value.k-input 
${ddDateDropDownList}           .k-dropdown.input-argument-type
${dropdownOperator}            .k-dropdown.query-operator

${chkEnumList}                  .filter-editor-arguments .k-selectable
${iconParameterized}            .icon-parameterized

${btnAddFilter}                         .action-edit-filters
${btnAddJump}                           .action-add-jump
${btnAddFilterToJump}                   .action-add-filter
${btnDeleteOperator}                    .action-delete
${btnUndo}                              .action-cancel
${btnApplyFilter}                       .btn-save
${chkExecutionParameter}                .query-execution-parameter
${btnSelectField}                       .btn-select-field
${btnInfo}								.action-info
${btnEditFilter}						.action-edit
				
*** Keywords ***
Set Editor Context
    [Arguments]  ${context}
    Set Test Variable  ${EditorContext}  ${context}

Set Editor Index 
    [Arguments]     ${index}    
    Set Test Variable  ${EditorIndex}  .query-definition:eq(${EditorDefinitionindex}) .item[data-index="${index}"]

Set Editor Context: Angle Tab
    Set Test Variable  ${EditorDefinitionindex}    0
    Set Editor Context  jquery=#TabContentAngle

Set Editor Context: Display Tab
    Set Test Variable  ${EditorDefinitionindex}    1
    Set Editor Context  jquery=#TabContentDisplay

Set Editor Context: Dashboard Tab
    Set Test Variable  ${EditorDefinitionindex}    0
    Set Editor Context  jquery=#TabContentDashboard

Query Operator Should Be
    [Arguments]     ${expectedValue}
    Element Text Should Be      ${EditorContext} ${EditorIndex} ${queryOperatorInput}  ${expectedValue}

Filter Display Name Should Contains
    [Arguments]     ${expectedValue}
    Wait Until Page Contains Element    ${EditorContext} ${EditorIndex} ${filterDisplayName}
    Wait Until Element Contains         ${EditorContext} ${EditorIndex} ${filterDisplayName}    ${expectedValue}

Check Apply Button
    Apply Filter Button Should Be Visible
    Click Undo Filters And Jumps   
    Apply Filter Button Should Not Be Visible

Argument Value Should Be
    [Arguments]     ${expectedValue}
    Textfield Value Should Be      ${EditorContext} ${EditorIndex} ${argumentInputValue}    ${expectedValue}

Argument Type Should Be
    [Arguments]     ${expectedValue}
    Element Text Should Be      ${EditorContext} ${EditorIndex} ${argumentInputType}       ${expectedValue}     ignore_case=True

Argument Period Value Should Be
    [Arguments]     ${expectedValue}
    Textfield Value Should Be      ${EditorContext} ${EditorIndex} ${argumentInputPeriodValue}    ${expectedValue}

Choose Dropdown Filter Operator Via Edit Filter
    [Arguments]    ${selectText}
    Sleep    ${TIMEOUT_GENERAL}  
    Wait Until Page Contains Element     ${EditorContext} ${EditorIndex} ${dropdownOperator} 
    Select Dropdown By Text   ${EditorContext} ${EditorIndex} ${dropdownOperator}    ${selectText}    


Click Execute Parameter To Edit Filter
    Click Element   ${EditorContext} ${EditorIndex} ${chkExecutionParameter}

Filter Display Execution Parameter Icon Should Be Visible
    Wait Until Page Contains Element    ${EditorContext} ${EditorIndex} ${iconParameterized} 
    Page Should Contain Element    ${EditorContext} ${EditorIndex} ${iconParameterized}
    
Click Boolean Radio Button "Yes"
    Wait Until Page Contains Element    ${EditorContext} ${EditorIndex} ${rdoEditFilterBooleanYes} 
    Click Element    ${EditorContext} ${EditorIndex} ${rdoEditFilterBooleanYes}      

Choose Dropdown Edit Filter Value
    [Arguments]    ${selectText}
    Sleep    ${TIMEOUT_GENERAL}  
    Select Dropdown By Text    ${EditorContext} ${EditorIndex} ${ddDateDropDownList}    ${selectText}   

Select Checkbox Enum List     
    [Arguments]    ${Index}
    Wait Until Page Contains Element    ${EditorContext} ${EditorIndex} ${chkEnumList} [data-index="${Index}"]  
    Click Element    ${EditorContext} ${EditorIndex} ${chkEnumList} [data-index="${Index}"]      
    
Input Edit Filter Value
    [Arguments]    ${filterValue}
    Wait Until Page Contains Element    ${EditorContext} ${EditorIndex} ${txtEditFilterCurrency}
    Click Element    ${EditorContext} ${EditorIndex} ${txtEditFilterCurrency} 
    Input Text    ${EditorContext} ${EditorIndex} ${txtEditFilterCurrency}    ${filterValue}         

Input Text Filter Value
    [Arguments]     ${editValue}
    Input Text    ${EditorContext} ${EditorIndex} ${textInputValue}    ${editValue}
    Press Keys    ${EditorContext} ${EditorIndex} ${textInputValue}    RETURN

Input Date Filter Value
    [Arguments]     ${editValue}
    Input Text    ${EditorContext} ${EditorIndex} ${txtDateInPut}    ${editValue}
    Press Keys    ${EditorContext} ${EditorIndex} ${txtDateInPut}    RETURN

Input Time Filter Value
    [Arguments]     ${editValue}
    Input Text    ${EditorContext} ${EditorIndex} ${argumentInputValue}    ${editValue}
    Press Keys    ${EditorContext} ${EditorIndex} ${argumentInputValue}    RETURN

Click Increase Timespan,Period Filter Value
    Wait Until Page Contains Element    ${EditorContext} ${EditorIndex} ${btnIncreaseValue}
    Press Keys    ${EditorContext} ${EditorIndex} ${btnIncreaseValue}    RETURN

Click Increase Number Filter Value
    Wait Until Page Contains Element    ${EditorContext} ${EditorIndex} ${btnIncreaseNumberValue}
    Click Element      ${EditorContext} ${EditorIndex} ${btnIncreaseNumberValue}  

Click Add Filter
    Wait Until Element Is Visible       ${EditorContext} ${btnAddFilter}
    Click Element   ${EditorContext} ${btnAddFilter}
    Wait Until Field Chooser Loaded

Add Filter
    [Arguments]   ${fieldKeyword}    ${fieldId}    ${isSelfSource}
    Click Add Filter
    Add Field By Search From Field Chooser    ${fieldKeyword}    ${fieldId}  ${isSelfSource}

Apply Filter Button Should Be Visible
    Element Should Be Visible   ${EditorContext} ${btnApplyFilter}

Apply Filter Button Should Not Be Visible
    Element Should Not Be Visible   ${EditorContext} ${btnApplyFilter}       

Apply Filter Button Should Be Disable
    Element Should Be Visible   ${EditorContext} ${btnApplyFilter}.disabled

Click Undo Filters And Jumps   
    Wait Until Element Is Visible    ${EditorContext} ${btnUndo} 
    Click Element    ${EditorContext} ${btnUndo}

Click Apply Filter Button   
    Wait Until Element Is Visible    ${EditorContext} ${btnApplyFilter} 
    Click Element    ${EditorContext} ${btnApplyFilter}    

Check Filter Asterisk Should Not Be Available
    Page Should Not Contain Element    ${EditorContext} .icon-adhoc   

Check Undo Filter Should Not Be Available
    Page Should Not Contain Element    ${EditorContext} ${btnUndo}  

Click Add Jump
    Wait Until Element Is Visible       ${EditorContext} ${btnAddJump}
    Click Element   ${EditorContext} ${btnAddJump}
    Wait Until Add Jump Popup Loaded

Add Jump By Id
    [Arguments]    ${id}
    Click Add Jump
    Click Select Jump by Id  ${id}
    Click Add Jump Button