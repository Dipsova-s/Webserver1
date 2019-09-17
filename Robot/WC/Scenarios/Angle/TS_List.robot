*** Settings ***
Resource    		${EXECDIR}/WC/POM/Search/SearchPage.robot
Resource    		${EXECDIR}/WC/POM/Angle/AnglePage.robot

*** Keywords ***
Create List Display From Pivot And Delete It
    [Arguments]   ${displayName}
    Go To Pivot Test Display
    Remove Field In Column Area By Field Index    1
    Click Apply Field Setting
    ${numberOfObject}    Get Number Of Object
    ${grandTotalValue}    Get Grand Total
    Should Be True    ${numberOfObject}==${grandTotalValue}
    Click Angle Dropdown Actions Create List
    Save Adhoc Display From Action Menu    ${displayName}
    ${numberOfObjectInListDisply}    Get Number Of Object
    ${numberOfColumns}    Get List Columns Count
    Should Be Equal As Numbers    ${numberOfObject}    ${numberOfObjectInListDisply}
    Should Be Equal As Numbers    ${numberOfColumns}    5
    Delete Current Display

Quick Filter Options For Number
    [Arguments]   ${angleName}    ${fieldId}
    Search Angle From Search Page And Execute Angle    ${angleName}
    Scroll To Angle Grid Header List Display    ${fieldId}
    Click Header by Data Field Angle Grid List Display    ${fieldId}
    Click Format Field From Header Column
    Select K unit
    Select Two Decimals
    Click Submit List Field Format
    Click First Row Cell By Column index    ${fieldId}
    Select Quick Filter Options
    ${quickFilterOptions}    Get Active Context Menu List Items
    Active Context Menu Should Contain Match    ${quickFilterOptions}    ^Is between
    Active Context Menu Should Contain Match    ${quickFilterOptions}    ^Is not between
    Active Context Menu Should Contain Match    ${quickFilterOptions}    ^Is empty
    Active Context Menu Should Contain Match    ${quickFilterOptions}    ^Is not empty
    Active Context Menu Should Contain Match    ${quickFilterOptions}    ^Is greater than
    Active Context Menu Should Contain Match    ${quickFilterOptions}    ^Is smaller than

Check Goto SAP Transaction With Multiple Rows
    [Arguments]    ${fields}     ${rowNumbers}
    :FOR    ${rowNumber}    IN    @{rowNumbers}
    \    Check Goto SAP Transaction    ${fields}    ${rowNumber}

Check Goto SAP Transaction
    [Arguments]    ${fields}     ${rowNumber}
    :FOR    ${field}    IN    @{fields}
    \    Press Keys    None    ESC
    \    Click Row Cell By Column index    ${field}    ${rowNumber}
    \    Select Goto SAP Option
    \    ${sapTransactions}    Get Active Context Menu List Items
    \    Should Not Be Empty    ${sapTransactions}

Create Chart From List Header Column
    [Arguments]    ${fieldId}    ${fieldKeyword}
    Add Column By Search And Add To List Display If Not Exist    ${fieldId}    ${fieldKeyword}
    Click Header by Data Field Angle Grid List Display    ${fieldId}
    Click Create Chart From Header Column

Create Pivot From List Header Column
    [Arguments]    ${fieldId}    ${fieldKeyword}
    Add Column By Search And Add To List Display If Not Exist    ${fieldId}    ${fieldKeyword}
    Click Header by Data Field Angle Grid List Display    ${fieldId}
    Click Create Pivot From Header Column

Edit Format Field From Field Header
    [Arguments]    ${fieldName}
    Click Header by Data Field Angle Grid List Display    ${fieldName}    
    Click Format Field From Header Column
    Input Field Name     Edit Field
    Click OK Button On Field Format Popup

Verify Field Alias Was Changed
    [Arguments]    ${Expect}   
    Page Should Contain    Edit Field

Edit Format Field With Checking Set As Default From Field Header
    [Arguments]    ${fieldName}
    Click Header by Data Field Angle Grid List Display    ${fieldName}    
    Click Format Field From Header Column
    Input Field Name     Edit Field
    Click CheckBox Set As Default For Field
    Click OK Button On Field Format Popup    

Remove Field Format From Changing
    [Arguments]    ${fieldName}
    Click Header by Data Field Angle Grid List Display    ${fieldName}  
    Click Format Field From Header Column
    Press Key    ${txtFieldName}    \\8
    Click OK Button On Field Format Popup

Verify Disable Add Filter And Jump Button In Display Popup
    [Arguments]    ${disabled}
    Click Edit Display
    Click Display Detail Filter And Jumps Tab
    ${DisableFilterButton}    Is Element Has CssClass    ${btnAddDisplayFilter}   disabled
    Should Be True    ${DisableFilterButton} == ${disabled}
    ${DisableJumpButton}    Is Element Has CssClass    ${btnAddDisplayJump}   disabled
    Should Be True    ${DisableJumpButton} == ${disabled}
    Save Display Detail From Popup

Verify Disable Drilldown
    [Arguments]    ${disabled}  ${fieldId}    ${fieldKeyword}
    Add Column By Search And Add To List Display If Not Exist    ${fieldId}    ${fieldKeyword}
    Click First Row Cell By Column index    ${fieldId}
    Click Angle Dropdown Actions Save Existing Display
    ${DisableDrilldownButton}    Is Element Has CssClass    ${btnCreateDrilldownToItem}   disabled
    Should Be True    ${DisableDrilldownButton} == ${disabled}

Verify Disable Remove Column And Filter Button In Header Popop
    [Arguments]    ${disabled}  ${fieldId}
    Click Header by Data Field Angle Grid List Display    ${fieldId}
    ${DisableRemoveColumnButton}    Is Element Has CssClass    ${btnRemoveColumnFromList}   disabled
    Should Be True    ${DisableRemoveColumnButton} == ${disabled}
    ${DisableAddFilterButton}    Is Element Has CssClass    ${btnAddFilterToList}   disabled
    Should Be True    ${DisableAddFilterButton} == ${disabled}

Check Menu In Header Popup In Case No Execution Display
    [Arguments]  ${fieldId}
    Click Header by Data Field Angle Grid List Display   ${fieldId}
    Page Should contain Element   ${btnSortAscendingToList}.disabled
    Page Should contain Element   ${btnSortDescendingToList}.disabled
    Page Should contain Element   ${btnSortCustomToList}.disabled
    Page Should contain Element   ${btnCreateChartFromList}.disabled
    Page Should contain Element   ${btnCreatePivotFromList}.disabled
    Page Should contain Element   ${btnFormatfield}:not(.disabled)
    Page Should contain Element   ${btnAddColumnFromList}.disabled
    Page Should contain Element   ${btnRemoveColumnFromList}.disabled
    Page Should contain Element   ${btnAddFilterToList}.disabled
    Page Should contain Element   ${btnFieldInfo}:not(.disabled)

Check Menu In Header Popup In Case Field Invalid
    [Arguments]  ${fieldId}
    Click Header by Data Field Angle Grid List Display   ${fieldId}
    Page Should contain Element   ${btnSortAscendingToList}.disabled
    Page Should contain Element   ${btnSortDescendingToList}.disabled
    Page Should contain Element   ${btnSortCustomToList}.disabled
    Page Should contain Element   ${btnCreateChartFromList}.disabled
    Page Should contain Element   ${btnCreatePivotFromList}.disabled
    Page Should contain Element   ${btnFormatfield}.disabled
    Page Should contain Element   ${btnAddColumnFromList}.disabled
    Page Should contain Element   ${btnRemoveColumnFromList}.disabled
    Page Should contain Element   ${btnAddFilterToList}.disabled
    Page Should contain Element   ${btnFieldInfo}:not(.disabled)