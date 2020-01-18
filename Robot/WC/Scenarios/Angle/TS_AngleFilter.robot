*** Settings ***
Resource    		${EXECDIR}/WC/POM/Search/SearchPage.robot
Resource    		${EXECDIR}/WC/POM/Angle/AnglePage.robot

*** Variables ***
@{ANGLE_FILTER_CURRENCY_INFO}       OrderedValue                    Order Value
@{ANGLE_FILTER_DATE_INFO}           OrderDueDate                    Order Due Date
@{ANGLE_FILTER_NUMBER_INFO}         ExpectedDelayInWorkDays         Calc.
@{ANGLE_FILTER_PERCENTAGE_INFO}     StockAvailabilityPct            Stock Availability %
@{ANGLE_FILTER_PERIOD_INFO}         ExpectedDelay                   Calc.
@{ANGLE_FILTER_TEXT_INFO}           OrderNumber                     Order Number
@{ANGLE_FILTER_TIME_INFO}           FirstShipmentHeader__UPABF      Pl. processing time
@{ANGLE_FILTER_BOOLEAN_INFO}        RelevantForLogistics            MRP Relevant
@{ANGLE_FILTER_SET_INFO}            DeliveryStatus                  Delivery

*** Keywords ***
Verify Angle Filter On List Display
    [Arguments]    ${angleName}    ${fieldType}    ${operator}
    Search Angle From Search Page And Execute Angle    ${angleName}
    Verify Filter To List Display    ${fieldType}    ${operator}

Verify Filter To List Display
    [Arguments]    ${fieldType}    ${operator}

    ${fieldId}    ${fieldKeyword} =    Get Filter Info For List Display Filter    ${fieldType}

    Wait Until Page Contains Element    ${btnAddColumnToListDisplay}
    Wait Until List Display Loaded
    Add Column By Search And Add To List Display If Not Exist    ${fieldId}    ${fieldKeyword}
    Run Keyword If    '${operator}' != 'is empty'    Add Filter Is Not Empty To Column    ${fieldId}
    Click Header by Data Field Angle Grid List Display    ${fieldId}
    Click Show Add Filter Popup From List Header Column

    ${chooseoption} =    Convert Operator Symbol To Dropdown Option    ${operator}    ${fieldType}
    Choose Dropdown Filter Operator Via Add Filter Popup    ${chooseoption}

    ${expect} =    Get Cell Value From List Display    ${fieldId}    ${fieldType}

    Run Keyword If    '${fieldType}' == 'currency'      Verify Filter Currency To List Display      ${fieldId}    ${operator}    ${expect}
    ...    ELSE IF    '${fieldType}' == 'date'          Verify Filter Date To List Display          ${fieldId}    ${operator}    ${expect}
    ...    ELSE IF    '${fieldType}' == 'number'        Verify Filter Number To List Display        ${fieldId}    ${operator}    ${expect}
    ...    ELSE IF    '${fieldType}' == 'percentage'    Verify Filter Percentage To List Display    ${fieldId}    ${operator}    ${expect}
    ...    ELSE IF    '${fieldType}' == 'period'        Verify Filter Period To List Display        ${fieldId}    ${operator}    ${expect}
    ...    ELSE IF    '${fieldType}' == 'text'          Verify Filter Text To List Display          ${fieldId}    ${operator}    ${expect}
    ...    ELSE IF    '${fieldType}' == 'time'          Verify Filter Time To List Display          ${fieldId}    ${operator}    ${expect}
    ...    ELSE IF    '${fieldType}' == 'boolean'       Verify Filter Yes/No To List Display        ${fieldId}    ${operator}    ${expect}
    ...    ELSE IF    '${fieldType}' == 'set'           Verify Filter Set To List Display           ${fieldId}    ${operator}    ${expect}
       ...    ELSE IF    '${fieldType}' == 'datetime'           Verify Filter Set To Datetime Display           ${fieldId}    ${operator}    ${expect}

    Click Toggle Angle
    Click Remove Last Adhoc Filter

Add Column By Search And Add To List Display
    [Arguments]   ${fieldKeyword}    ${fieldId}    ${isSelfSource}=${FALSE}
    Click Add New Column To List
    Add Field By Search From Field Chooser    ${fieldKeyword}    ${fieldId}    ${isSelfSource}
    Wait Until Element Is Visible    jquery=#${tblAngleHeaderListDisplay} th.k-header[data-field="${fieldId}"]
    Wait Until List Display Loaded
    Sleep    ${TIMEOUT_LARGEST}

Add Column By Search And Add To List Display If Not Exist
    [Arguments]    ${fieldId}    ${fieldKeyword}    ${isSelfSource}=${FALSE}
    ${fieldIndex} =    Get Element Index    jquery=#${tblAngleHeaderListDisplay} th.k-header[data-field="${fieldId}"]
    Run Keyword If    ${fieldIndex} == -1    Add Column By Search And Add To List Display    ${fieldKeyword}     ${fieldId}    ${isSelfSource}
    ...    ELSE   Scroll To Angle Grid Header List Display    ${fieldId}

#Currency
Verify Operators Currency Field
    [Arguments]    ${fieldId}    ${fieldKeyword}
    Add Column By Search And Add To List Display If Not Exist      ${fieldId}    ${fieldKeyword}
    Click Header by Data Field Angle Grid List Display    ${fieldId}
    Click Show Add Filter Popup From List Header Column
    Verify All Operators Of Currency
    Click Cancel Add Filter to list

Add Or Change Currency Filter
    [Arguments]    ${fieldId}    ${fieldKeyword}
    Add Column By Search And Add To List Display If Not Exist      ${fieldId}    ${fieldKeyword}
    Click Header by Data Field Angle Grid List Display    ${fieldId}
    Click Show Add Filter Popup From List Header Column
    Choose Dropdown Filter Operator Via Add Filter Popup    is not empty
    Click OK Add Filter to List
    Click Angle Dropdown Actions Edit Display
    Click Display Detail Filter And Jumps Tab
    Expand Filter Panel    0
    Close Display Detail Popup

#Date
Verify Operators Date Field
    [Arguments]    ${fieldId}    ${fieldKeyword}
    Add Column By Search And Add To List Display If Not Exist      ${fieldId}    ${fieldKeyword}
    Click Header by Data Field Angle Grid List Display    ${fieldId}
    Click Show Add Filter Popup From List Header Column
    Verify All Operators Of Date
    Click Cancel Add Filter to list

#Enumerated
Verify Operators Enumerated Field
    [Arguments]    ${fieldId}    ${fieldKeyword}
    Add Column By Search And Add To List Display If Not Exist      ${fieldId}    ${fieldKeyword}
    Click Header by Data Field Angle Grid List Display    ${fieldId}
    Click Show Add Filter Popup From List Header Column
    Verify All Operators Of Enumerated
    Click Cancel Add Filter to list

#Text
Verify Operators Text Field
    [Arguments]    ${fieldId}    ${fieldKeyword}
    Add Column By Search And Add To List Display If Not Exist      ${fieldId}    ${fieldKeyword}
    Click Header by Data Field Angle Grid List Display    ${fieldId}
    Click Show Add Filter Popup From List Header Column
    Verify All Operators Of Text
    Click Cancel Add Filter to list

#Boolean
Verify Operators Boolean Field
    [Arguments]    ${fieldId}    ${fieldKeyword}
    Add Column By Search And Add To List Display If Not Exist      ${fieldId}    ${fieldKeyword}
    Click Header by Data Field Angle Grid List Display    ${fieldId}
    Click Show Add Filter Popup From List Header Column
    Verify All Operators Of Boolean
    Click Cancel Add Filter to list

#Percentage
Verify Operators Percentage Field
    [Arguments]    ${fieldId}    ${fieldKeyword}
    Add Column By Search And Add To List Display If Not Exist      ${fieldId}    ${fieldKeyword}
    Click Header by Data Field Angle Grid List Display    ${fieldId}
    Click Show Add Filter Popup From List Header Column
    Verify All Operators Of Percentage
    Click Cancel Add Filter to list

#Number
Verify Operators Number Field
    [Arguments]    ${fieldId}    ${fieldKeyword}
    Add Column By Search And Add To List Display If Not Exist      ${fieldId}    ${fieldKeyword}
    Click Header by Data Field Angle Grid List Display    ${fieldId}
    Click Show Add Filter Popup From List Header Column
    Verify All Operators Of Number
    Click Cancel Add Filter to list

#DateTime
Verify Operators DateTime Field
    [Arguments]    ${fieldId}    ${fieldKeyword}
    Add Column By Search And Add To List Display If Not Exist      ${fieldId}    ${fieldKeyword}
    Click Header by Data Field Angle Grid List Display    ${fieldId}
    Click Show Add Filter Popup From List Header Column
    Verify All Operators Of DateTime
    Click Cancel Add Filter to list

#Time
Verify Operators Time Field
    [Arguments]    ${fieldId}    ${fieldKeyword}
    Add Column By Search And Add To List Display If Not Exist      ${fieldId}    ${fieldKeyword}
    Click Header by Data Field Angle Grid List Display    ${fieldId}
    Click Show Add Filter Popup From List Header Column
    Verify All Operators Of Time
    Click Cancel Add Filter to list
Add Filter Is Not Empty To Column
    [Arguments]    ${fieldId}
    Click Header by Data Field Angle Grid List Display    ${fieldId}
    Click Show Add Filter Popup From List Header Column
    Choose Dropdown Filter Operator Via Add Filter Popup    is not empty
    Click OK Add Filter to List

Get Filter Info For List Display Filter
    [Arguments]      ${fieldType}
    ${fieldId}    ${fieldKeyword} =    Set Variable If
    ...    '${fieldType}' == 'currency'    ${ANGLE_FILTER_CURRENCY_INFO}
    ...    '${fieldType}' == 'date'        ${ANGLE_FILTER_DATE_INFO}
    ...    '${fieldType}' == 'number'      ${ANGLE_FILTER_NUMBER_INFO}
    ...    '${fieldType}' == 'percentage'  ${ANGLE_FILTER_PERCENTAGE_INFO}
    ...    '${fieldType}' == 'period'      ${ANGLE_FILTER_PERIOD_INFO}
    ...    '${fieldType}' == 'text'        ${ANGLE_FILTER_TEXT_INFO}
    ...    '${fieldType}' == 'time'        ${ANGLE_FILTER_TIME_INFO}
    ...    '${fieldType}' == 'boolean'     ${ANGLE_FILTER_BOOLEAN_INFO}
    ...    '${fieldType}' == 'set'         ${ANGLE_FILTER_SET_INFO}
    [Return]    ${fieldId}    ${fieldKeyword}

List Filter Result Should Be Empty
    [Arguments]  ${datafield}    ${fieldType}=text
    ${compareValue} =    Get Cell Value From List Display    ${datafield}    ${fieldType}
    Should Be True    '${compareValue}' == ''

List Filter Result Should Not Be Empty
    [Arguments]  ${datafield}    ${fieldType}=text
    ${compareValue} =    Get Cell Value From List Display    ${datafield}    ${fieldType}
    Should Be True    '${compareValue}' != ''

List Filter Percentage Result Between Should Be True
    [Arguments]  ${datafield}    ${expect}
    ${comparevalue} =     Get Cell Value From List Display    ${datafield}    percentage
    ${expectValue} =    Execute Javascript     return parseFloat('${expect}')
    Should Be True    ${compareValue} - 1 <= ${expectValue} <= ${compareValue} + 1

List Filter Percentage Result Should Be True
    [Arguments]  ${datafield}    ${compareoption}    ${expect}
    ${compareValue} =     Get Cell Value From List Display    ${datafield}    percentage
    ${expectValue} =    Execute Javascript     return parseFloat('${expect}')
    Should Be True    ${compareValue}${compareoption}${expectValue}

List Filter Text Result Should Be True
    [Arguments]  ${datafield}    ${compareoption}    ${expect}
    ${compareValue} =     Get Cell Value From List Display    ${datafield}
    Should Be True    '${comparevalue}'${compareoption}'${expect}'

List Filter Number Result Should Be True
    [Arguments]  ${datafield}    ${compareoption}    ${expect}
    ${compareValue} =     Get Cell Value From List Display    ${datafield}
    Should Be True    ${compareValue}${compareoption}${expect}

List Filter Date Result Should Be True
    [Arguments]  ${datafield}    ${compareoption}    ${expect}
    ${compareoption} =    Set Variable If    '${compareoption}' == 'is in list'    ==    ${compareoption}
    ${compareValue} =    Get Cell Value From List Display    ${datafield}    date
    ${compareDate} =    Execute Javascript    return kendo.parseDate("${comparevalue}", WC.FormatHelper.GetFormatter('date')).getTime()
    ${expectDate} =    Execute Javascript    return kendo.parseDate("${expect}", WC.FormatHelper.GetFormatter('date')).getTime()
    Should Be True    ${compareDate}${compareoption}${expectDate}

List Filter Datetime Result Should Be True
    [Arguments]  ${datafield}    ${compareoption}    ${expect}
    ${compareValue} =    Get Cell Value From List Display    ${datafield}    datetime
    ${compareDate} =    Execute Javascript    return kendo.parseDate("${comparevalue}", WC.FormatHelper.GetFormatter('datetime')).getTime()
    ${expectDate} =    Execute Javascript    return kendo.parseDate("${expect}", WC.FormatHelper.GetFormatter('datetime')).getTime()
    Should Be True    ${compareDate}${compareoption}${expectDate}

List Filter Currency Result Between Should Be True
    [Arguments]  ${datafield}    ${expect}
    ${compareValue} =    Get Cell Value From List Display    ${datafield}    currency
    ${expectValue} =    Execute Javascript     return parseFloat('${expect}')
    Should Be True    ${compareValue} - 1 <= ${expectValue} <= ${compareValue} + 1

List Filter Currency Result Is Greater Then Or Equal To Should Be True
    [Arguments]  ${datafield}    ${expect}
    ${compareValue} =    Get Cell Value From List Display    ${datafield}    currency
    ${expectValue} =    Execute Javascript     return parseFloat('${expect}')
    Should Be True    ${compareValue} >= ${expectValue} - 1

List Filter Currency Result Is Smaller Than Or Equal To Should Be True
    [Arguments]  ${datafield}    ${expect}
    ${compareValue} =    Get Cell Value From List Display    ${datafield}    currency
    ${expectValue} =    Execute Javascript     return parseFloat('${expect}')
    Should Be True    ${compareValue} <= ${expectValue} + 1

List Filter Time Result Should Be True
    [Arguments]  ${datafield}    ${compareoption}    ${expect}
    ${compareValue} =    Get Cell Value From List Display    ${datafield}
    ${expectTime} =    Execute Javascript     return kendo.parseDate("${expect}", WC.FormatHelper.GetFormatter('time')).getTime()
    ${compareTime} =    Execute Javascript     return kendo.parseDate("${compareValue}", WC.FormatHelper.GetFormatter('time')).getTime()
    Should Be True    ${compareTime}${compareoption}${expectTime}

List Filter Period Result Not Between Should Be True
    [Arguments]  ${datafield}    ${expect}
    ${compareValue} =    Get Cell Value From List Display    ${datafield}    period
    ${expectValue} =    Execute Javascript     return parseFloat('${expect}')
    Should Be True    ${compareValue}!=${expectValue}

List Filter Yes/No Result Should Be Yes
    [Arguments]  ${datafield}
    ${compareValue} =    Get Cell Value From List Display    ${datafield}    boolean
    Should Be True    ${compareValue}

List Filter Set Result Should Be True
    [Arguments]  ${datafield}    ${compareoption}    ${expect}
    ${compareValue} =    Get Cell Value From List Display    ${datafield}
    Should Be True    '${compareValue}'${compareoption}'${expect}'

List Filter First Charactor Result Should Be True
    [Arguments]  ${datafield}    ${compareoption}    ${expect}
    ${compareValue} =    Get Cell Value From List Display    ${datafield}
    ${compareValueFirstCharactor} =    Execute Javascript    return '${compareValue}'.charAt(0)
    ${expectFirstCharactor} =    Execute Javascript    return '${expect}'.charAt(0)
    Should Be True    '${compareValueFirstCharactor}'${compareoption}'${expectFirstCharactor}'

Verify Filter Currency To List Display
    [Arguments]     ${fieldId}    ${operator}    ${expect}

    Run Keyword If    '${operator}' == 'is between'     Input Filter Input Currency Between Via Add Filter Popup     ${expect}
    ...    ELSE IF    '${operator}' ==  'is not between'    Input Filter Input Currency Between Via Add Filter Popup     ${expect}

    Click OK Add Filter to List

    Run Keyword If    '${operator}' == 'is between'     List Filter Currency Result Between Should Be True                ${fieldId}    ${expect}

Verify Filter Date To List Display
    [Arguments]     ${fieldId}    ${operator}    ${expect}

    Run Keyword If    '${operator}' == 'is in list'    Remove And Add Filter Angle Type Date Via Add Filter Popup    ${expect}
    ...    ELSE       Input First Input Date Picker Via Add Filter Popup    ${expect}

    Click OK Add Filter to List

    List Filter Date Result Should Be True    ${fieldId}    ${operator}    ${expect}

Verify Filter Number To List Display
    [Arguments]    ${fieldId}    ${operator}    ${expect}

    Input Filter Input Number Via Add Filter Popup    ${expect}

    Click OK Add Filter to List

    List Filter Number Result Should Be True    ${fieldId}    ${operator}    ${expect}

Verify Filter Percentage To List Display
    [Arguments]    ${fieldId}    ${operator}    ${expect}

    Run Keyword If    '${operator}' == 'is between'    Input Filter Input Percentage Between Via Add Filter Popup    ${expect}
    ...    ELSE IF    '${operator}' != 'is empty'      Input Filter Input Percentage Via Add Filter Popup    ${expect}

    Click OK Add Filter to List

    Run Keyword If    '${operator}' == 'is empty'       List Filter Result Should Be Empty    ${fieldId}
    ...    ELSE IF    '${operator}' == 'is between'     List Filter Percentage Result Between Should Be True    ${fieldId}    ${expect}
    ...    ELSE       List Filter Percentage Result Should Be True    ${fieldId}    ${operator}    ${expect}

Verify Filter Period To List Display
    [Arguments]     ${fieldId}    ${operator}    ${expect}

    Run Keyword If    '${operator}' == 'is not between'     Input Filter Input Period Not Between Via Add Filter Popup    ${expect}
    ...    ELSE                                             Input First Input Number Via Add Filter Popup    ${expect}

    Click OK Add Filter to List

    Run Keyword If    '${operator}' == 'is not between'     List Filter Period Result Not Between Should Be True       ${fieldId}    ${expect}
    ...    ELSE                                             List Filter Number Result Should Be True    ${fieldId}    ${operator}    ${expect}

Verify Filter Text To List Display
    [Arguments]     ${fieldId}    ${operator}    ${expect}

    Run Keyword If    '${operator}' == 'matches pattern(s)'                  Input Filter Input Text In List Via Add Filter Popup    ${expect}
    ...    ELSE IF    '${operator}' == 'does not end on substring(s)'        Input Filter Input Text In List Via Add Filter Popup    ${expect}
    ...    ELSE IF    '${operator}' == 'does not start with substring(s)'    Input Filter Input Text In List Via Add Filter Popup    ${expect}
    ...    ELSE IF    '${operator}' == '<='                                  Input Filter Input Text Via Add Filter Popup    ${expect}
    ...    ELSE IF    '${operator}' == 'is equal to'                         Input Filter Input Text Via Add Filter Popup    ${expect}

    Click OK Add Filter to List

    Run Keyword If    '${operator}' == 'matches pattern(s)'                  List Filter Text Result Should Be True    ${fieldId}     ==    ${expect}
    ...    ELSE IF    '${operator}' == 'does not end on substring(s)'        List Filter Text Result Should Be True    ${fieldId}     !=    ${expect}
    ...    ELSE IF    '${operator}' == 'does not start with substring(s)'    List Filter Text Result Should Be True    ${fieldId}     !=    ${expect}
    ...    ELSE IF    '${operator}' == '<='                                  List Filter Text Result Should Be True    ${fieldId}     <=    ${expect}
    ...    ELSE IF    '${operator}' == 'is equal to'                         List Filter Text Result Should Be True    ${fieldId}     ==    ${expect}

Verify Filter Time To List Display
    [Arguments]     ${fieldId}    ${operator}    ${expect}

    ${expect} =    Set Variable    13

    Run Keyword If    '${operator}' == '<'         Input First Input Time Picker Via Add Filter Popup    ${expect}:00:00
    ...    ELSE IF    '${operator}' == '<='        Input First Input Time Picker Via Add Filter Popup    ${expect}:59:00

    Click OK Add Filter to List

    Run Keyword If    '${operator}' == '<'         List Filter Time Result Should Be True    ${fieldId}    <     ${expect}:00
    ...    ELSE IF    '${operator}' == '<='        List Filter Time Result Should Be True    ${fieldId}    <=    ${expect}:59

Verify Filter Yes/No To List Display
    [Arguments]     ${fieldId}    ${operator}    ${expect}

    Run Keyword If    '${operator}' == '=='      Click Filter Choice Yes Via Add Filter Popup

    Click OK Add Filter to List

    Run Keyword If    '${operator}' == '=='                 List Filter Yes/No Result Should Be Yes    ${fieldId}
    ...    ELSE IF    '${operator}' == 'is not empty'       List Filter Result Should Not Be Empty    ${fieldId}    boolean

Verify Filter Set To List Display
    [Arguments]     ${fieldId}    ${operator}    ${expect}

    Run Keyword If    '${operator}' == 'is in list'      Input Filter Set Is In List Via Add Filter Popup    ${expect}
    Run Keyword If    '${operator}' == 'is not equal to'      Input Filter Set Select Value Via Add Filter Popup    ${expect}
    Run Keyword If    '${operator}' == 'short name starts with substring(s)'      Input Filter Input Short Name In List Via Add Filter Popup    ${expect}
    Run Keyword If    '${operator}' == 'short name contains substring(s)'         Input Filter Input Short Name In List Via Add Filter Popup    ${expect}

    Click OK Add Filter to List

    Run Keyword If    '${operator}' == 'is in list'      List Filter Set Result Should Be True    ${fieldId}    ==    ${expect}
    Run Keyword If    '${operator}' == 'is not equal to'      List Filter Set Result Should Be True    ${fieldId}    !=    ${expect}
    Run Keyword If    '${operator}' == 'short name starts with substring(s)'      List Filter First Charactor Result Should Be True    ${fieldId}    ==    ${expect}
    Run Keyword If    '${operator}' == 'short name contains substring(s)'      List Filter First Charactor Result Should Be True    ${fieldId}    ==    ${expect}


Verify Filter With Execute Parameter To List Display
    [Arguments]    ${fieldType}    ${operator}    ${fieldId}    ${fieldKeyword}
    Wait Until Page Contains Element    ${btnAddColumnToListDisplay}
    Wait Until List Display Loaded
    Click Toggle Angle
    Add Column By Search And Add To List Display If Not Exist    ${fieldId}    ${fieldKeyword}
    Run Keyword If    '${operator}' != 'is empty'    Add Filter Is Not Empty To Column    ${fieldId}
    Click Header by Data Field Angle Grid List Display    ${fieldId}
    Click Show Add Filter Popup From List Header Column
    ${chooseoption} =    Convert Operator Symbol To Dropdown Option    ${operator}    ${fieldType}
    Choose Dropdown Filter Operator Via Add Filter Popup    ${chooseoption}
    Click Execute Parameter To Filter
    ${expect} =    Get Cell Value From List Display    ${fieldId}    ${fieldType}
    Run Keyword If    '${fieldType}' == 'text'          Verify Filter Text To List Display          ${fieldId}    ${operator}    ${expect}

Click Execute Parameter To Filter
    Select Radio Button    ${rdoExecuteParemeter}    true


