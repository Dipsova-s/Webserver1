*** Settings ***
Resource            ${EXECDIR}/WC/POM/Shared/SidePanel.robot
Resource            ${EXECDIR}/WC/POM/Shared/ItemBusinessProcess.robot
Resource            ${EXECDIR}/WC/POM/Shared/ItemTag.robot

*** Variables ***
${tabAngle}                             jquery=#TabDetails .tab-menu-angle
${divTabContentAngle}                   css=#TabContentAngle
${divAngleDescription}                  jquery=#TabContentAngle .section-description-body
${btnEditAngleDescription}              jquery=#TabContentAngle .action-edit-description
${btnEditAngleDescriptionOnAngleName}   jquery=.section-info-header .action-edit-description
${divAngleQueryDefinition}              jquery=#TabContentAngle .query-definition-wrapper
${liAngleOperator}                      jquery=#TabContentAngle .query-definition-wrapper .item
${liAngleFilter}                        jquery=#TabContentAngle .query-definition-wrapper .item-filter
${liAngleJump}                          jquery=#TabContentAngle .query-definition-wrapper:not(.readonly) .item-jump
${liAngleInvalidJump}                   jquery=#TabContentAngle .query-definition-wrapper .item-jump.item-error
${liAngleInvalidFilter}                 jquery=#TabContentAngle .query-definition-wrapper .item-filter.item-warning

${tabDisplay}                           jquery=#TabDetails .tab-menu-display
${divDisplaySidepanel}                  jquery=#TabDetails .tab-content-wrapper:last 
${divTabContentDisplay}                 css=#TabContentDisplay
${divDisplayDescription}                jquery=#TabContentDisplay .section-description-body
${btnEditDisplayDescription}            jquery=#TabContentDisplay .action-edit-description
${btnEditDisplayDescriptionOnDisplayTab}    .btn-edit-description
${divAngleReadOnlyQueryDefinition}      jquery=#TabContentDisplay .query-definition-wrapper.readonly
${divAngleReadOnlyOperator}             jquery=#TabContentDisplay .query-definition-wrapper.readonly .item
${divDisplayQueryDefinition}            jquery=#TabContentDisplay .query-definition-wrapper:not(.readonly)
${liDisplayOperator}                    jquery=#TabContentDisplay .query-definition-wrapper:not(.readonly) .item
${liDisplayFilter}                      jquery=#TabContentDisplay .query-definition-wrapper:not(.readonly) .item-filter
${liDisplayJump}                        jquery=#TabContentDisplay .query-definition-wrapper:not(.readonly) .item-jump
${chkExecuteOnLogin}                    css=#ExecuteOnLogin
${chkIsAngleDefault}                    css=#IsAngleDefault

${spnAngleName}                         jquery=#SectionInfo .displayNameContainer .name

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

${popupListFilter}                      css=.popupListFilter
${popupExecutionParameter}              jquery=.popup-execution-parameter

${liFilterHeight}                       32
${liFilterGutter}                       5

${divAngleDefinitionHeader}             css=#TabContentAngle .section-definition .accordion-header
${divAngleDescriptionHeader}            css=#TabContentAngle .section-description .accordion-header
${divDisplayDefinitionHeader}           css=#TabContentDisplay .section-definition .accordion-header
${divDisplayAggregationHeader}          css=#TabContentDisplay .section-aggregation .accordion-header
${divDisplayDescriptionHeader}          css=#TabContentDisplay .section-description .accordion-header

*** Keywords ***
Click Angle Tab
    [Arguments]  ${expandAll}=${True}
    Click Element  ${tabAngle}
    Run Keyword If  ${expandAll}==${True}  Expand All Angle Section Panels

Expand All Angle Section Panels
    Expand Section Panel: Angle Filters & Jumps
    Expand Section Panel: Angle Description

Collapse All Angle Section Panels
    Collapse Section Panel: Angle Filters & Jumps
    Collapse Section Panel: Angle Description

Expand All Display Section Panels
    Expand Section Panel: Display Filters & Jumps
    Expand Section Panel: Display Aggregation
    Expand Section Panel: Display Description

Collapse All Display Section Panels
    Collapse Section Panel: Display Filters & Jumps
    Collapse Section Panel: Display Aggregation
    Collapse Section Panel: Display Description

Expand Section Panel: Angle Filters & Jumps
    Expand Section Panel  ${divAngleDefinitionHeader}

Expand Section Panel: Angle Description
    Expand Section Panel  ${divAngleDescriptionHeader}

Expand Section Panel: Display Filters & Jumps
    Expand Section Panel  ${divDisplayDefinitionHeader}

Expand Section Panel: Display Aggregation
    ${exists}  Is Element Visible  ${divDisplayAggregationHeader}
    Run Keyword If  ${exists} == ${True}  Expand Section Panel  ${divDisplayAggregationHeader}

Expand Section Panel: Display Description
    Expand Section Panel  ${divDisplayDescriptionHeader}

Collapse Section Panel: Angle Filters & Jumps
    Collapse Section Panel  ${divAngleDefinitionHeader}

Collapse Section Panel: Angle Description
    Collapse Section Panel  ${divAngleDescriptionHeader}

Collapse Section Panel: Display Filters & Jumps
    Collapse Section Panel  ${divDisplayDefinitionHeader}

Collapse Section Panel: Display Aggregation
    ${exists}  Is Element Visible  ${divDisplayAggregationHeader}
    Run Keyword If  ${exists} == ${True}  Collapse Section Panel  ${divDisplayAggregationHeader}

Collapse Section Panel: Display Description
    Collapse Section Panel  ${divDisplayDescriptionHeader}

Section Panel Should Expanded: Angle Filters & Jumps
    Section Panel Should Expanded  ${divAngleDefinitionHeader}

Section Panel Should Expanded: Angle Description
    Section Panel Should Expanded  ${divAngleDescriptionHeader}

Section Panel Should Expanded: Display Filters & Jumps
    Section Panel Should Expanded  ${divDisplayDefinitionHeader}

Section Panel Should Expanded: Display Aggregation
    Section Panel Should Expanded  ${divDisplayAggregationHeader}

Section Panel Should Expanded: Display Description
    Section Panel Should Expanded  ${divDisplayDescriptionHeader}

Section Panel Should Collapsed: Angle Filters & Jumps
    Section Panel Should Collapsed  ${divAngleDefinitionHeader}

Section Panel Should Collapsed: Angle Description
    Section Panel Should Collapsed  ${divAngleDescriptionHeader}

Section Panel Should Collapsed: Display Filters & Jumps
    Section Panel Should Collapsed  ${divDisplayDefinitionHeader}

Section Panel Should Collapsed: Display Aggregation
    Section Panel Should Collapsed  ${divDisplayAggregationHeader}

Section Panel Should Collapsed: Display Description
    Section Panel Should Collapsed  ${divDisplayDescriptionHeader}

Click Edit Angle Description
    Click Element  ${btnEditAngleDescription}
    Wait Until Edit Description Popup Loaded

Click Edit Angle Description On Angle Name
    Click Element  ${btnEditAngleDescriptionOnAngleName}
    Wait Until Edit Description Popup Loaded

Angle Description Should Contain
    [Arguments]  ${text}
    Element Should Contain  ${divAngleDescription}  ${text}

Click Display Tab
    [Arguments]  ${expandAll}=${True}
    Click Element  ${tabDisplay}
    Run Keyword If  ${expandAll}==${True}  Expand All Display Section Panels

Scroll Display Tab To Vertical
    [Arguments]    ${top} 
    Mouse Over    ${divDisplaySidepanel}  
    Scroll Vertical    ${divDisplaySidepanel}    ${top}  

Click Edit Display Description
    Click Element  ${btnEditDisplayDescription}
    Wait Until Edit Description Popup Loaded

Click Edit Display Description On Display Tab
    Mouse Over     ${tabCurrentDisplay}
    Click Element  ${tabCurrentDisplay} ${btnEditDisplayDescriptionOnDisplayTab}
    Wait Until Edit Description Popup Loaded

Display Description Should Contain
    [Arguments]  ${text}
    Element Should Contain  ${divDisplayDescription}  ${text}

Move Display Filter To Angle
    [Arguments]    ${fromIndex}
    ${offsetY}    Execute JavaScript    return -(${liFilterHeight}) * (${fromIndex}+1)
    Drag And Drop By Offset    ${liDisplayFilter}[data-index=${fromIndex}]    0    ${offsetY}
    Sleep    ${TIMEOUT_GENERAL}

Move Display Filter By Index
    [Arguments]    ${fromIndex}    ${toIndex}
    ${offsetY}    Execute JavaScript    return (function(){var x=(${toIndex} - ${fromIndex}) * ${liFilterHeight}; return x < 0 ? x - ${liFilterGutter} : x + ${liFilterGutter} })()
    Drag And Drop By Offset    ${liDisplayFilter}[data-index=${fromIndex}]    0    ${offsetY}
    Sleep    ${TIMEOUT_GENERAL}

Get Display Filter Name By Index
    [Arguments]    ${index}
    ${text}    Get Text   ${liDisplayFilter}[data-index=${index}] .name span
    [Return]    ${text}

Angle Readonly Filter Should Contain
    [Arguments]    ${text}
    Element Should Contain    ${divAngleReadonlyQueryDefinition}    ${text}

Display Filter Should Contain
    [Arguments]    ${text}
    Element Should Contain    ${divDisplayQueryDefinition}    ${text}

Display Filter Should Not Contain
    [Arguments]    ${text}
    Element Should Not Contain    ${divDisplayQueryDefinition}    ${text}

Display Filter/Jump Count Should Be
    [Arguments]  ${expected}
    ${count}  Get Element Count  ${liDisplayOperator}
    Should Be True  ${count}==${expected}

Add Filter On Angle
    [Arguments]   ${fieldKeyword}    ${fieldId}    ${isSelfSource}
    Wait Until Element Is Visible       ${divTabContentAngle} ${btnAddFilter}
    Click Element   ${divTabContentAngle} ${btnAddFilter}
    Add Field By Search From Field Chooser    ${fieldKeyword}    ${fieldId}  ${isSelfSource}

Add Filter On Display
    [Arguments]   ${fieldKeyword}    ${fieldId}    ${isSelfSource}
    Wait Until Element Is Visible       ${divTabContentDisplay} ${btnAddFilter}
    Click Element   ${divTabContentDisplay} ${btnAddFilter}
    Add Field By Search From Field Chooser    ${fieldKeyword}    ${fieldId}  ${isSelfSource}

Add Filter Before Jump On Angle
    [Arguments]    ${index}    ${fieldKeyword}    ${fieldId}    ${isSelfSource}
    Mouse Over   ${liAngleJump}[data-index=${index}]
    Click Element   ${liAngleJump}[data-index=${index}] ${btnAddFilterToJump}
    Add Field By Search From Field Chooser    ${fieldKeyword}    ${fieldId}   ${isSelfSource}

Input Argument Text On Display
    [Arguments]  ${index}  ${value}
    Click Element    ${liDisplayFilter}[data-index=${index}] .input-argument-value.k-widget
    Input Text    ${liDisplayFilter}[data-index=${index}] .input-argument-value[data-role=numerictextbox]    ${value}

Add Filter Before Jump On Display
    [Arguments]    ${index}    ${fieldKeyword}    ${fieldId}    ${isSelfSource}
    Mouse Over   ${liDisplayJump}[data-index=${index}]
    Click Element   ${liDisplayJump}[data-index=${index}] ${btnAddFilterToJump}
    Add Field By Search From Field Chooser    ${fieldKeyword}    ${fieldId}    ${isSelfSource}

Add Jump To Display
    [Arguments]    ${name}
    Click Add Jump On Display
    Click Select Jump by Name    ${name}
    Click Add Jump Button

Add Jump To Angle
    [Arguments]    ${name}
    Click Angle Tab
    Click Add Jump On Angle
    Click Select Jump by Name    ${name}
    Click Add Jump Button

Click Add Jump On Angle
    Click Element    ${divTabContentAngle} ${btnAddJump}
    Wait Until Add Jump Popup Loaded

Click Add Jump On Display
    Click Element    ${divTabContentDisplay} ${btnAddJump}
    Wait Until Add Jump Popup Loaded
	
Click Delete Jump From Angle
    [Arguments]    ${index}
    Mouse Over   ${liAngleJump}[data-index=${index}]
	Click Element    ${liAngleJump}[data-index=${index}] ${btnDeleteOperator}
 
Click Delete Filter From Angle
    [Arguments]    ${index}
    Mouse Over   ${liAngleFilter}[data-index=${index}]
	Click Element    ${liAngleFilter}[data-index=${index}] ${btnDeleteOperator} 

Click Apply Filter On Angle
    Wait Until Element Is Visible      ${divTabContentAngle} ${btnApplyFilter}
    Click Element    ${divTabContentAngle} ${btnApplyFilter}
    Wait Progress Bar Closed
    Wait Until Ajax Complete

Click Apply Filter On Display
    Wait Until Element Is Visible       ${divTabContentDisplay} ${btnApplyFilter}
    Click Element    ${divTabContentDisplay} ${btnApplyFilter}
    Wait Progress Bar Closed
    Wait Until Ajax Complete

Click Apply Filter On Display If It Visible
    ${present}=    Run Keyword And Return Status    Element Should Be Visible   ${divTabContentDisplay} ${btnApplyFilter}
    Run Keyword If    ${present}    Click Apply Filter On Display

Click Execute Parameter On Angle
    Wait Until Element Is Visible       ${divTabContentAngle} ${chkExecutionParameter}
    Click Element      ${divTabContentAngle} ${chkExecutionParameter}

Click Delete Angle Operator
    [Arguments]    ${index}
    Mouse Over    ${liAngleOperator}[data-index=${index}]
    Wait Until Element Is Visible    ${liAngleOperator}[data-index=${index}] ${btnDeleteOperator}
    Click Element    ${liAngleOperator}[data-index=${index}] ${btnDeleteOperator}

Click Delete Display Operator
    [Arguments]    ${index}
    Mouse Over    ${liDisplayOperator}[data-index=${index}]
    Wait Until Element Is Visible    ${liDisplayOperator}[data-index=${index}] ${btnDeleteOperator}
    Click Element    ${liDisplayOperator}[data-index=${index}] ${btnDeleteOperator}

Click Delete Jump From Display
    [Arguments]    ${index}
    Mouse Over   ${liDisplayJump}[data-index=${index}]
	Click Element    ${liDisplayJump}[data-index=${index}] ${btnDeleteOperator}
    Wait Progress Bar Closed
    Wait Until Ajax Complete

Click Undo Angle Filters And Jumps
    Click Element    ${divTabContentAngle} ${btnUndo}

Click Undo Display Filters And Jumps   
    Wait Until Element Is Visible    ${divTabContentDisplay} ${btnUndo} 
    Click Element    ${divTabContentDisplay} ${btnUndo}

Info Button On Jump Should Be Visible On Angle
    [Arguments]    ${index}
    Mouse Over   ${liAngleJump}[data-index=${index}]
	Element Should Be Visible    ${liAngleJump}[data-index=${index}] ${btnInfo}		

Info Button On Filter Should Be Visible On Angle
    [Arguments]    ${index}
    Mouse Over   ${liAngleFilter}[data-index=${index}]
	Element Should Be Visible    ${liAngleFilter}[data-index=${index}] ${btnInfo}	
	
Info Button On Jump Should Be Visible On Display
    [Arguments]    ${index}
    Mouse Over   ${liDisplayJump}[data-index=${index}]
	Element Should Be Visible    ${liDisplayJump}[data-index=${index}] ${btnInfo}	

Invalid Jump Message Should Be Show On Angle 
    [Arguments]    ${index}    ${text}
    Element Should Contain    ${liAngleInvalidJump}[data-index=${index}]    ${text}

Invalid Filter Message Should Be Show On Angle 
    [Arguments]    ${index}    ${text}
    Element Should Contain    ${liAngleInvalidFilter}[data-index=${index}]    ${text}	

Delete Jump Button Should Not Be Visible On Display
    [Arguments]    ${index}
    Mouse Over   ${liDisplayJump}[data-index=${index}]
	Element Should Not Be Visible    ${liDisplayJump}[data-index=${index}] ${btnDeleteOperator}

Delete Jump Button Should Not Be Visible On Angle
    [Arguments]    ${index}
    Mouse Over   ${liAngleJump}[data-index=${index}]
	Element Should Not Be Visible    ${liAngleJump}[data-index=${index}] ${btnDeleteOperator}
	
Delete Jump Button Should Be Visible On Angle
    [Arguments]    ${index}
    Mouse Over   ${liAngleJump}[data-index=${index}]
	Element Should Be Visible    ${liAngleJump}[data-index=${index}] ${btnDeleteOperator}	
	
Delete Filter Button Should Not Be Visible On Angle
    [Arguments]    ${index}
    Mouse Over   ${liAngleFilter}[data-index=${index}]
	Element Should Not Be Visible    ${liAngleFilter}[data-index=${index}] ${btnDeleteOperator}

Delete Filter Button Should Not Be Visible On Display
    [Arguments]    ${index}
    Mouse Over   ${liDisplayFilter}[data-index=${index}]
	Element Should Not Be Visible    ${liDisplayFilter}[data-index=${index}] ${btnDeleteOperator}	

Delete Filter Button Should Be Visible On Angle
    [Arguments]    ${index}
    Mouse Over   ${liAngleFilter}[data-index=${index}]
	Element Should Be Visible    ${liAngleFilter}[data-index=${index}] ${btnDeleteOperator}		
	
Delete Filter Button Should Be Visible On Display
    [Arguments]    ${index}
    Mouse Over   ${liDisplayFilter}[data-index=${index}]
	Element Should Be Visible    ${liDisplayFilter}[data-index=${index}] ${btnDeleteOperator}	

Edit Filter Button Should Not Be Visible On Angle
    [Arguments]    ${index}
    Mouse Over   ${liAngleFilter}[data-index=${index}]
	Element Should Not Be Visible    ${liAngleFilter}[data-index=${index}] ${btnEditFilter}

Edit Filter Button Should Not Be Visible On Display
    [Arguments]    ${index}
    Mouse Over   ${liDisplayFilter}[data-index=${index}]
    Element Should Not Be Visible    ${liDisplayFilter}[data-index=${index}] ${btnEditFilter}	

Edit Filter Button Should Be Visible On Angle
    [Arguments]    ${index}
    Mouse Over   ${liAngleFilter}[data-index=${index}]
	Element Should Be Visible    ${liAngleFilter}[data-index=${index}] ${btnEditFilter}			
	
Edit Filter Button Should Be Visible On Display
    [Arguments]    ${index}
    Mouse Over   ${liDisplayFilter}[data-index=${index}]
	Element Should Be Visible    ${liDisplayFilter}[data-index=${index}] ${btnEditFilter}		

Add Angle Filter Before Jump Button Should Not Be Visible On Angle
    [Arguments]    ${index}
    Mouse Over   ${liAngleJump}[data-index=${index}]
	Element Should Not Be Visible    ${liAngleJump}[data-index=${index}] ${btnAddFilterToJump}
	
Add Angle Filter Before Jump Button Should Not Be Visible On Display
    [Arguments]    ${index}
    Mouse Over   ${liDisplayJump}[data-index=${index}]
	Element Should Not Be Visible    ${liDisplayJump}[data-index=${index}] ${btnAddFilterToJump}

Add Angle Filter Button Should Not Be Visible
    Element Should Not Be Visible    ${divTabContentAngle} ${btnAddFilter}

Add Angle Jump Button Should Not Be Visible
    Element Should Not Be Visible    ${divTabContentAngle} ${btnAddJump}	
	
Add Angle Filter Button Should Be Visible
    Element Should Be Visible    ${divTabContentAngle} ${btnAddFilter}

Add Angle Jump Button Should Be Visible
    Element Should Be Visible    ${divTabContentAngle} ${btnAddJump}		

Add Angle Filter Button Is Visible
    Element Should Be Visible    ${divTabContentAngle} ${btnAddFilter}

Add Display Filter Button Is Visible
    Element Should Be Visible    ${divTabContentDisplay} ${btnAddFilter}

Add Display Filter Button Is Not Visible
    Element Should Not Be Visible    ${divTabContentDisplay} ${btnAddFilter}

Add Display Jump Button Is Visible
    Element Should Be Visible    ${divTabContentDisplay} ${btnAddJump}

Add Display Jump Button Is Not Visible
    Element Should Not Be Visible    ${divTabContentDisplay} ${btnAddJump}

Click Execute Parameter On Add Filter Page
    Wait Until Element Is Visible       ${popupListFilter} ${chkExecutionParameter}
    Click Element      ${popupListFilter} ${chkExecutionParameter}

Click Select Field On Angle
    Wait Until Element Is Visible       ${divTabContentAngle} ${btnSelectField}
    Click Element      ${divTabContentAngle} ${btnSelectField}

Click Select Field On Popup Execution Parameter
    Wait Until Element Is Visible       ${popupExecutionParameter} ${btnSelectField}:last
    Click Element      ${popupExecutionParameter} ${btnSelectField}:last

Angle Execution Parameter Icon Should Be Marked As Executed
    [Arguments]   ${index}
    Page Should Contain Element  ${liAngleOperator}[data-index=${index}] .icon-parameterized.active

Angle Execution Parameter Icon Should Not Be Marked As Executed
    [Arguments]   ${index}
    Page Should Contain Element  ${liAngleOperator}[data-index=${index}] .icon-parameterized:not(.active)

Angle Readonly Execution Parameter Icon Should Be Marked As Executed
    [Arguments]   ${index}
    Page Should Contain Element  ${divAngleReadOnlyOperator}[data-index=${index}] .icon-parameterized.active

Angle Readonly Execution Parameter Icon Should Not Be Marked As Executed
    [Arguments]   ${index}
    Page Should Contain Element  ${divAngleReadOnlyOperator}[data-index=${index}] .icon-parameterized:not(.active)

Display Execution Parameter Icon Should Be Marked As Executed
    [Arguments]   ${index}
    Page Should Contain Element  ${liDisplayOperator}[data-index=${index}] .icon-parameterized.active

Display Execution Parameter Icon Should Not Be Marked As Executed
    [Arguments]   ${index}
    Page Should Contain Element  ${liDisplayOperator}[data-index=${index}] .icon-parameterized:not(.active)

Apply Display Filter Button Should Be Visible
    Element Should Be Visible   ${divTabContentDisplay} ${btnApplyFilter}

Apply Display Filter Button Should Be Disable
    Element Should Be Visible   ${divTabContentDisplay} ${btnApplyFilter}.disabled

Apply Display Filter Button Should Not Be Visible
    Element Should Not Be Visible   ${divTabContentDisplay} ${btnApplyFilter}

Select Checkbox Execute On Login
    Select Checkbox      ${chkExecuteOnLogin}

Unselect Checkbox Execute On Login
    Unselect Checkbox      ${chkExecuteOnLogin}

Click Checkbox Angle Default Display
    Select Checkbox      ${chkIsAngleDefault}

Side Panel Should Available
    Wait Until Element Is Visible    ${spnAngleName} 