*** Variables ***
${divFilterPanel}                       jquery=.query-definition .item:visible
${divAngleFilterPanel}                  jquery=.section-angle .query-definition .editmode
${divDisplayFilterPanel}                jquery=.section-display .query-definition .editmode
${ddlFilterOperator}                    .k-widget.query-operator
${iconEdit}                             .action-edit
${ddlFilterSelectValue}                 .k-widget.input-argument-value
${txtInputNumber}                       .input-argument-value
${btnRemoveSelectedValue}               .action-remove
${btnAddSelectedValue}                  .action-add
${txtSelectedValue}                     .input-argument-typing
${btnRemoveAllSelectedValue}            .action-clear

${divDashboardFilterItem}               jquery=.filterItem
${txtFirstInput}                        FirstInput-
${txtSecondInput}                       SecondInput-
${txtFirstInputDatePicker}              InputValue-
${txtFirstInputDatetimePicker}          InputValue-
${txtFirstInputTimePicker}              InputValue-
${btnAddFilterBeforeJump}               .btnAddFilterFromJump

${listSelectedValue}                    css=.FilterDetail  .k-selectable:visible tr
${gridValueList}                        jquery=#ValueList-

# Boolean
${rdoYesChoice}                         YesChoice-
${rdoNoChoice}                          NoChoice-

*** Keywords ***
Convert Operator Symbol To Dropdown Option
    [Arguments]  ${operator}    ${fieldType}=''
    ${operatorText} =    Set Variable If
    ...     '${operator}' == '=='       is equal to
    ...     '${operator}' == '>'        is greater than
    ...     '${operator}' == '<' and '${fieldType}' == 'time'     is before
    ...     '${operator}' == '<'        is smaller than
    ...     '${operator}' == '>=' and '${fieldType}' == 'date'    is after or on
    ...     '${operator}' == '>='       is greater than or equal to
    ...     '${operator}' == '<=' and '${fieldType}' == 'date'    is before or on
    ...     '${operator}' == '<=' and '${fieldType}' == 'time'    is before or on
    ...     '${operator}' == '<='       is smaller than or equal to             ${operator}
    [Return]    ${operatorText}


Click Edit Filter
    [Arguments]   ${index}
    Mouse Over      ${divFilterPanel}[data-index=${index}]
    Wait Until Element Is Enabled    ${divFilterPanel}[data-index=${index}] ${iconEdit}
    Click Element   ${divFilterPanel}[data-index=${index}] ${iconEdit}

Expand Filter Panel
    [Arguments]   ${index}
    ${isEditMode}    Is Element Has CssClass        ${divFilterPanel}[data-index=${index}]    editmode
    Run Keyword If    ${isEditMode} == ${False}     Click Edit Filter    ${index}

Collapse Filter Panel
    [Arguments]   ${index}
    ${isEditMode}    Is Element Has CssClass        ${divFilterPanel}[data-index=${index}]    editmode
    Run Keyword If    ${isEditMode} == ${True}      Click Edit Filter    ${index}

Choose Dropdown Filter Operator
    [Arguments]   ${index}    ${selectText}
    ${TIMEOUT_DROPDOWN}
    Select Dropdown By Text   ${divFilterPanel}[data-index=${index}] ${ddlFilterOperator}    ${selectText}

Choose Dropdown Dashboard Filter Operator
    [Arguments]   ${index}    ${selectText}
    Sleep    ${TIMEOUT_GENERAL}
    Select Dropdown By Text   ${divDashboardFilterItem}[index=${index}] #Operator-${index}-DropdownList_ddlWrapper    ${selectText}

Input Filter Input Percentage
    [Arguments]   ${index}    ${expect}
    ${value}    Execute Javascript     return parseFloat('${expect}') / 100;
    Input kendo Percentage TextBox    ${txtInputNumber}${index}    ${value}

Input Filter Input Percentage Between
    [Arguments]   ${index}    ${expect}
    ${value1}    Execute Javascript     return (parseFloat('${expect}') - 1) / 100;
    ${value2}    Execute Javascript     return (parseFloat('${expect}') + 1) / 100;
    Input kendo Percentage TextBox    ${txtFirstInput}${index}    ${value1}
    Input kendo Percentage TextBox    ${txtSecondInput}${index}    ${value2}

Input Filter Input Period Not Between
    [Arguments]   ${index}    ${expect}
    Input First Input Number    ${index}    ${expect}
    Input Second Input Number    ${index}    ${expect}

Input Filter Input Number
    [Arguments]   ${index}    ${expect}
    Input kendo Numeric TextBox    ${txtInputNumber}${index}    ${expect}

Input Filter Input Currency
    [Arguments]   ${index}    ${expect}
    ${currencyValue}    Execute Javascript     return parseInt('${expect}');
    Input kendo Numeric TextBox    ${txtInputNumber}${index}    ${currencyValue}

Input Filter Input Currency Between
    [Arguments]   ${index}    ${expect}
    ${currencyValue}    Execute Javascript     return parseFloat('${expect}');
    Input kendo Numeric TextBox    ${txtFirstInput}${index}    ${currencyValue}
    Input kendo Numeric TextBox    ${txtSecondInput}${index}    ${currencyValue + 1}

Input Filter Input Is In List Currency
    [Arguments]   ${index}    ${expect}
    ${currencyValue}    Execute Javascript     return parseFloat('${expect}');
    Click Element    ${listSelectedValue}
    Wait Until Element Is Enabled    ${divFilterPanel}[data-index=${index}] ${btnRemoveSelectedValue}
    Click Element    ${divFilterPanel}[data-index=${index}] ${btnRemoveSelectedValue}
    Input kendo Numeric TextBox    ${divFilterPanel}[data-index=${index}] ${txtSelectedValue}    ${currencyValue}
    Click Element    ${divFilterPanel}[data-index=${index}] ${btnRemoveSelectedValue}

Input First Input Number
    [Arguments]   ${index}    ${expect}
    Input kendo Numeric TextBox    ${txtFirstInput}${index}    ${expect}

Input Second Input Number
    [Arguments]   ${index}    ${expect}
    Input kendo Numeric TextBox    ${txtSecondInput}${index}    ${expect}

Input First Input Date Picker
    [Arguments]   ${index}    ${expect}
    Input kendo Date Picker    ${txtFirstInputDatePicker}${index}    ${expect}

Input Selected Value Date Picker
    [Arguments]   ${index}    ${expect}
    Input kendo Date Picker    ${txtSelectedValue}${index}    ${expect}

Remove And Add Filter Angle Type Date
    [Arguments]  ${index}    ${expect}
    Click Remove All Selected Values    ${index}
    Input Selected Value Date Picker    ${index}    ${expect}
    Click Add Selected Value Date Picker    ${index}

Input First Input Datetime Picker
    [Arguments]   ${index}    ${expect}
    Input kendo Datetime Picker    ${txtFirstInputDatetimePicker}${index}    ${expect}

Input First Input Time Picker
    [Arguments]   ${index}    ${expect}
    Input kendo Time Picker    ${txtFirstInputTimePicker}${index}    ${expect}

Click Remove All Selected Values
    [Arguments]    ${index}
    Click Element    ${divFilterPanel}[data-index=${index}] ${btnRemoveAllSelectedValue}
    Sleep    ${TIMEOUT_DROPDOWN}

Click Add Selected Value Date Picker
    [Arguments]    ${index}
    Click Element    ${btnAddSelectedValue}${index}
    Sleep    ${TIMEOUT_DROPDOWN}

Input Filter Input Text In List
    [Arguments]   ${index}    ${expect}
    Input Text    ${divFilterPanel}[data-index=${index}] ${txtSelectedValue}   ${expect}
    Click Element    ${divFilterPanel}[data-index=${index}] ${btnAddSelectedValue}
    
Input Angle Section Filter Text In List
    [Arguments]   ${index}    ${expect}
    Input Text    ${divAngleFilterPanel}[data-index=${index}] ${txtSelectedValue}   ${expect}
    Click Element    ${divAngleFilterPanel}[data-index=${index}] ${btnAddSelectedValue}

Input Display Section Filter Text In List
    [Arguments]   ${index}    ${expect}
    scroll element into view    ${divDisplayFilterPanel}
    Input Text    ${divDisplayFilterPanel}[data-index=${index}] ${txtSelectedValue}   ${expect}
    Click Element    ${divDisplayFilterPanel}[data-index=${index}] ${btnAddSelectedValue}

Input Filter Input Short Name In List
    [Arguments]   ${index}    ${expect}
    ${shortName}    Execute Javascript    return '${expect}'.charAt(0)
    Input Text    ${divFilterPanel}[data-index=${index}] ${txtSelectedValue}    ${shortName}
    Click Element    ${divFilterPanel}[data-index=${index}] ${btnAddSelectedValue}

Input Filter Input Text
    [Arguments]   ${index}    ${expect}
    Input Text    ${divFilterPanel}[data-index=${index}] ${txtInputNumber}    ${expect}

Click Filter Choice Yes
    [Arguments]   ${index}
    Click Element    ${rdoYesChoice}${index}

Click Filter Choice No
    [Arguments]   ${index}
    Click Element    ${rdoNoChoice}${index}

Input Filter Set Is In List
    [Arguments]   ${index}    ${expect}
    ${expect} =    Execute Javascript    return '${expect}'.split(' (')[0]
    Scroll Vertical To Element    ${gridValueList}${index} .k-scrollbar-vertical    ${gridValueList}${index} .k-virtual-scrollable-wrap tr:contains("${expect}")
    Select Checkbox     ${gridValueList}${index} .k-virtual-scrollable-wrap tr:contains("${expect}") input

Input Filter Set Select Value
    [Arguments]   ${index}    ${expect}
    ${expect} =    Execute Javascript    return '${expect}'.split(' (')[0]
    Sleep    ${TIMEOUT_GENERAL}
    Select Dropdown By InnerText   ${divFilterPanel}[data-index=${index}] ${ddlFilterSelectValue}    ${expect}

Click Add Filter From Jump
    [Arguments]   ${index}
    Click Element    ${divFilterPanel}:eq(${index}) + ${btnAddFilterBeforeJump}
	