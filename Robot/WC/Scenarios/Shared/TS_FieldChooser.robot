*** Settings ***
Resource            ${EXECDIR}/WC/POM/Shared/FieldChooserPopup.robot

*** Keywords ***
Add Field By Search From Field Chooser
    [Arguments]   ${fieldKeyword}    ${fieldId}    ${isSelfSource}
    Wait Until Element Is Visible    ${popupFieldChooser}
    Wait Until Element Is Not Visible    ${pgbpopupFieldChooser}
	Run Keyword If    ${isSelfSource}    Select Field Source(Self)
    Fill In Search Field Chooser    ${fieldKeyword}
    Choose Field Chooser From Search Result    field-${fieldId}
    Click Insert Field From Field Chooser
    Wait Until Element Is Not Visible    ${popupFieldChooser}