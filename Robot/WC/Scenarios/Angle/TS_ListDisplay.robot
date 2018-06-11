*** Settings ***
Resource    		${EXECDIR}/WC/POM/Search/SearchPage.robot
Resource    		${EXECDIR}/WC/POM/Angle/AnglePage.robot

*** Keywords ***
Create New Angle And Create List Display From Pivot
    [Arguments]   ${objectName}    ${angleName}    ${fieldId}    ${fieldKeyword}    ${fieldTypePeriodId}    ${fieldTypePeriodKeyword}    ${fieldTypeCurrencyId}    ${fieldTypeCurrencyKeyword}
    Login To WC By Power User
    Create Angle From Object List And Save    ${objectName}    ${angleName}
    Wait Progress Bar Closed
    Wait Until List Display Loaded
    Add Column By Search And Add To List Display If Not Exist    ${fieldId}    ${fieldKeyword}
    Click Header by Data Field Angle Grid List Display    ${fieldId}
    Click Create Pivot From Head Column
    ${numberOfObject}    Get Number Of Object
    ${grandTotalValue}    Get Grand Total
    Should Be True    ${numberOfObject}==${grandTotalValue}
    Click Toggle Angle
    Click Show Field Chooser For Data Area
    Add Field By Search From Field Chooser    ${fieldTypePeriodKeyword}    ${fieldTypePeriodId}
    Click Apply Field Setting
    Save Adhoc Display From Action Menu    Test pivot display
    Click Angle Dropdown Actions Create List
    Wait Until List Display Loaded
    ${numberOfObjectInListDisply}=    Get Number Of Object
    Should Be True    ${numberOfObject}==${numberOfObjectInListDisply}
    Change Display By Name    Test pivot display
    Click Show Field Chooser For Data Area
    Add Field By Search From Field Chooser    ${fieldTypeCurrencyKeyword}    ${fieldTypeCurrencyId}
    Click Apply Field Setting
    Click Angle Dropdown Actions Save Existing Display
    Click Angle Dropdown Actions Create List
    Wait Until List Display Loaded
    ${numberOfObjectInListDisply}=    Get Number Of Object
    Should Be True    ${numberOfObject}==${numberOfObjectInListDisply}
    Change Display By Name    Test pivot display
    Click Field In Data Area By Field Index    2
    Click Show Field Format For Field Settings
    Select Dropdown By Text    ${ddlDisplayUnitOption}    Thousands (K)
    Select Dropdown By Text    ${ddlDecimalOption}    2 decimals
    Click Use Bucket Thousand Seperate
    Save Field Format
    Click Apply Field Setting
    Click Angle Dropdown Actions Save Existing Display
    Click Angle Dropdown Actions Create List
    Wait Until List Display Loaded
    ${numberOfObjectInListDisply}=    Get Number Of Object
    Should Be True    ${numberOfObject}==${numberOfObjectInListDisply}
    Back To Search And Delete Angle Are Created    ${angleName}
