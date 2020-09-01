*** Settings ***
Resource    		${EXECDIR}/WC/POM/Search/SearchPage.robot
Resource    		${EXECDIR}/WC/POM/Angle/AnglePage.robot

*** Keywords ***
Create List Display From Pivot And Delete It
    [Arguments]   ${displayName}
    Go To Pivot Test Display
    Click Field In Column Area By Field Index  1
    Click Remove Field For Field Settings
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
    [Arguments]    ${fieldId}    ${fieldKeyword}    ${isSelfSource}
    Add Column By Search And Add To List Display If Not Exist    ${fieldId}    ${fieldKeyword}  ${isSelfSource}
    Click Header by Data Field Angle Grid List Display    ${fieldId}
    Click Create Chart From Header Column
    Open All Display Groups

Create Pivot From List Header Column
    [Arguments]    ${fieldId}    ${fieldKeyword}    ${isSelfSource}
    Add Column By Search And Add To List Display If Not Exist    ${fieldId}    ${fieldKeyword}  ${isSelfSource}
    Click Header by Data Field Angle Grid List Display    ${fieldId}
    Click Create Pivot From Header Column
    Open All Display Groups

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
    Press Keys    ${txtFieldName}    BACKSPACE
    Click OK Button On Field Format Popup

Verify Visibility Of Adding Filter And Jump In Side Panel
    [Arguments]    ${isVisible}
    Click Display Tab
    Run Keyword If    ${isVisible}==${True}     Add Display Filter Button Is Visible
    ...    ELSE    Add Display Filter Button Is Not Visible
    Run Keyword If    ${isVisible}==${True}     Add Display Jump Button Is Visible
    ...    ELSE    Add Display Jump Button Is Not Visible

Verify Disable Drilldown In Context Menu
    [Arguments]    ${disabled}  ${fieldId}    ${fieldKeyword}   ${isSelfSource}
    Add Column By Search And Add To List Display If Not Exist    ${fieldId}    ${fieldKeyword}    ${isSelfSource}
    Click First Row Cell By Column index    ${fieldId}
    ${DisableDrilldownButton}    Is Element Has CssClass    ${btnCreateDrilldownToItem}   disabled
    Should Be True    ${DisableDrilldownButton} == ${disabled}

Verify Disable Removing Column And Adding Filter In Column Menu
    [Arguments]    ${disabled}  ${fieldId}
    Click Header by Data Field Angle Grid List Display    ${fieldId}
    ${DisableRemoveColumnButton}    Is Element Has CssClass    ${btnRemoveColumnFromList}   disabled
    Should Be True    ${DisableRemoveColumnButton} == ${disabled}
    ${DisableAddFilterButton}    Is Element Has CssClass    ${btnAddFilterToList}   disabled
    Should Be True    ${DisableAddFilterButton} == ${disabled}

Check Menu In Header Popup In Case Known Field
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

Check Menu In Header Popup In Case Unknown Field
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