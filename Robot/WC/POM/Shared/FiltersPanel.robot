*** Variables ***
${divFilterPanel}                       jquery=.FilterHeader
${ddlFilterOperator}                    Operator-
${ddlFilterSelectValue}                 InputValue-
${txtFirstInput}                        FirstInput-
${txtSecondInput}                       SecondInput-
${txtInputNumber}                       InputValue-
${txtFirstInputDatePicker}              InputValue-
${txtFirstInputDatetimePicker}          InputValue-
${txtFirstInputTimePicker}              InputValue-

${listSelectedValue}                    css=.FilterDetail  .k-selectable:visible tr
${btnRemoveSelectedValue}               RemoveSelectedValue-
${btnAddSelectedValue}                  AddSelectedValue-
${txtSelectedValue}                     SelectedValue-
${btnRemoveAllSelectedValue}            RemoveAllSelectedValue-
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

Expand Filter Panel
    [Arguments]   ${index}
    ${isCollapse}    Is Element Has CssClass    ${divFilterPanel}:eq(${index})    Collapse
    Run Keyword If    "${isCollapse}"=="True"    Click Element    ${divFilterPanel}:eq(${index})

Collapse Filter Panel
    [Arguments]   ${index}
    ${isExpand}    Is Element Has CssClass    ${divFilterPanel}:eq(${index})    Expand
    Run Keyword If    ${isExpand} == True    Click Element    ${divFilterPanel}:eq(${index})

Choose Dropdown Filter Operator
    [Arguments]   ${index}    ${selectText}
    Sleep    ${TIMEOUT_GENERAL}
    Select Dropdown By Text   ${ddlFilterOperator}${index}-DropdownList_ddlWrapper    ${selectText}

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
    Wait Until Element Is Enabled    ${btnRemoveSelectedValue}${index}
    Click Element    ${btnRemoveSelectedValue}${index}
    Input kendo Numeric TextBox    ${txtSelectedValue}${index}    ${currencyValue}
    Click Element    ${btnAddSelectedValue}${index}

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
    Click Remove All Selected Value Date Picker    ${index}
    Input Selected Value Date Picker    ${index}    ${expect}
    Click Add Selected Value Date Picker    ${index}

Input First Input Datetime Picker
    [Arguments]   ${index}    ${expect}
    Input kendo Datetime Picker    ${txtFirstInputDatetimePicker}${index}    ${expect}

Input First Input Time Picker
    [Arguments]   ${index}    ${expect}
    Input kendo Time Picker    ${txtFirstInputTimePicker}${index}    ${expect}

Click Remove All Selected Value Date Picker
    [Arguments]    ${index}
    Click Element    ${btnRemoveAllSelectedValue}${index}
    Sleep    ${TIMEOUT_DROPDOWN}

Click Add Selected Value Date Picker
    [Arguments]    ${index}
    Click Element    ${btnAddSelectedValue}${index}
    Sleep    ${TIMEOUT_DROPDOWN}

Input Filter Input Text In List
    [Arguments]   ${index}    ${expect}
    Input Text    ${txtSelectedValue}${index}    ${expect}
    Click Element    ${btnAddSelectedValue}${index}

Input Filter Input Short Name In List
    [Arguments]   ${index}    ${expect}
    ${shortName}    Execute Javascript    return '${expect}'.charAt(0)
    Input Text    ${txtSelectedValue}${index}    ${shortName}
    Click Element    ${btnAddSelectedValue}${index}

Input Filter Input Text
    [Arguments]   ${index}    ${expect}
    Input Text    ${txtInputNumber}${index}    ${expect}

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
    Wait Until Element Is Visible    jquery=[aria-owns="${ddlFilterSelectValue}${index}_listbox"]
    Input Text    jquery=[aria-owns="${ddlFilterSelectValue}${index}_listbox"]    ${expect}
    Press Key     jquery=[aria-owns="${ddlFilterSelectValue}${index}_listbox"]    \\13
    Sleep    ${TIMEOUT_DROPDOWN}
