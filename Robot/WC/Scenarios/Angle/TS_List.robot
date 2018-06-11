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
    [Arguments]   ${objectName}    ${angleName}    ${fieldId}    ${fieldKeyword}
    Create Angle From One Object List And Save    ${objectName}    ${angleName}
    Wait Progress Bar Closed
    Change Display By Name    Basic List
    Add Column By Search And Add To List Display If Not Exist    ${fieldId}    ${fieldKeyword}
    Click Header by Data Field Angle Grid List Display    ${fieldId}
    Click Format Field From Header Column
    Select K unit
    Select Two Decimals
    Click Submit List Field Format
    Click First Row Cell By Column index    ${fieldId}
    Select Quick Filter Options
    ${quickFilterOptions}    Collect Quick Filter Options
    Quick Filter Options Should Contain Match    ${quickFilterOptions}    ^Is between
    Quick Filter Options Should Contain Match    ${quickFilterOptions}    ^Is not between
    Quick Filter Options Should Contain Match    ${quickFilterOptions}    ^Is empty
    Quick Filter Options Should Contain Match    ${quickFilterOptions}    ^Is not empty
    Quick Filter Options Should Contain Match    ${quickFilterOptions}    ^Is greater than
    Quick Filter Options Should Contain Match    ${quickFilterOptions}    ^Is smaller than
    Back To Search And Delete Angle Are Created    ${angleName}

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