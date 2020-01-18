*** Settings ***
Resource            ${EXECDIR}/WC/POM/Shared/FieldChooserPopup.robot

*** Keywords ***
Add Field By Search From Field Chooser
    [Arguments]   ${fieldKeyword}    ${fieldId}    ${isSelfSource}=${FALSE}
    Wait Until Element Is Visible    ${popupFieldChooser}
	Run Keyword If    ${isSelfSource}    Select Field Source(Self)
    Fill In Search Field Chooser    ${fieldKeyword}
    Choose Field Chooser From Search Result    field-${fieldId}
    Click Insert Field From Field Chooser
    Sleep    ${TIMEOUT_LARGEST}