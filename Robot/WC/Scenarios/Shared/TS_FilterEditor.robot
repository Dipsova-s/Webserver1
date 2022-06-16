*** Settings ***
Resource            ${EXECDIR}/WC/POM/Shared/FilterEditor.robot

*** Variables ***
${defaultCurrencyFilterDisplayName}     (Self) - Material Value is greater than 0 EUR    
${defaultOperatorCurrencyFilter}        is greater than
${defaultArgumentCurrencyFilter}        0 EUR

${defaultDateFilterDisplayName}         (Self) - Planned Date is after
${defaultOperatorDateFilter}            is after
${defaultArgumentDateFilter}            Date

${defaultNumberFilterDisplayName}       (Self) - Ordered Quantity is greater than
${defaultOperatorNumberFilter}          is greater than
${defaultArgumentNumberFilter}          

${defaultPercentageFilterDisplayName}   (Self) - Margin Percentage is greater than 0 %
${defaultOperatorPercentageFilter}      is greater than
${defaultArgumentPercentageFilter}      0 %

${defaultSetFilterDisplayName}          (Self) - Delivery Reliability is in list
${defaultOperatorSetFilter}             is in list

${defaultTextFilterDisplayName}         (Self) - ID contains substring(s)
${defaultOperatorTextFilter}            contains substring(s)

${defaultTimeFilterDisplayName}         (Self) - TIME is after
${defaultOperatorTimeFilter}            is after
${defaultArgumentTimeFilter}            

${defaultTimeSpanFilterDisplayName}     (Self) - Calculated Delay is greater than
${defaultOperatorTimeSpanFilter}        is greater than
${defaultArgumentTimeSpanFilter}       
   
${defaultTimeStampFilterDisplayName}    (Self) - DATETIME is after
${defaultOperatorTimeStampFilter}       is after
${defaultArgumentTimeStampFilter}       Date

${defaultBooleanFilterDisplayName}      (Self) - Is Fixed is equal to Yes
${defaultOperatorBooleanFilter}         is equal to

${txtInputFilterValue}    input-argument-value:eq(0)  

${txtBooleanAfterEditValue}             (Self) - Special Advice for Early Shipping is equal to Yes
${txtCurrencyAfterEditValue}            (Self) - Ordered Value is greater than 2 EUR 
${txtDateAfterEditValue}                (Self) - Order Due Date is after this day(s)
${txtDateTimeAfterEditValue}            (Self) - DATETIME is after this day(s)  
${txtDoubleAfterEditValue}              (Self) - Quantity is greater than 1
${txtEnumerateAfterEditValue}           (Self) - Delivery Reliability is in list
${txtIntAfterEditValue}                 (Self) - Number of Material Plant Data is greater than 1
${txtPercentageAfterEditValue}          (Self) - Delivery Reliability As Percentage is greater than 1 %
${txtPeriodAfterEditValue}              (Self) - Calculated Delay is greater than 1 day(s)
${txtTextAfterEditValue}                (Self) - Area of the Country contains substring(s) (AA, ABC)
${txtTimeAfterEditValue}                (Self) - TIME is after 00:00:01
${txtTimespanAfterEditValue}            (Self) - Description is greater than 2 days 00:00:00

*** Keywords ***
# Currency
Verify Add Filter Currency Editor
    Add Filter      "Material Value"           MaterialValue       ${TRUE}
    Set Editor Index    0  
    Filter Display Name Should Contains         ${defaultCurrencyFilterDisplayName}
    Query Operator Should Be    ${defaultOperatorCurrencyFilter}
    Argument Value Should Be    ${defaultArgumentCurrencyFilter}
    Check Apply Button

# Date
Verify Add Filter Date Editor
    Add Filter       "Planned Date"             PlannedDate         ${TRUE}
    Set Editor Index    0  
    Filter Display Name Should Contains         ${defaultDateFilterDisplayName}
    Query Operator Should Be    ${defaultOperatorDateFilter}
    Argument Type Should Be     ${defaultArgumentDateFilter}
    Check Apply Button

# Number
Verify Add Filter Number Editor
    Add Filter       "Ordered Quantity"         OrderedQuantity     ${TRUE}
    Set Editor Index    0  
    Filter Display Name Should Contains         ${defaultNumberFilterDisplayName}
    Query Operator Should Be    ${defaultOperatorNumberFilter}
    Argument Value Should Be    ${defaultArgumentNumberFilter}
    Check Apply Button

# Percentage
Verify Add Filter Percentage Editor
    Add Filter       "Margin %"                 MarginPercentage    ${TRUE}
    Set Editor Index    0  
    Filter Display Name Should Contains         ${defaultPercentageFilterDisplayName}
    Query Operator Should Be    ${defaultOperatorPercentageFilter}
    Argument Value Should Be    ${defaultArgumentPercentageFilter}
    Check Apply Button

# Set
Verify Add Filter Set Editor
    Add Filter      "Delivery Reliability"     DeliveryStatus      ${TRUE}
    Set Editor Index    0  
    Filter Display Name Should Contains         ${defaultSetFilterDisplayName}
    Query Operator Should Be    ${defaultOperatorSetFilter}
    Check Apply Button

# Text
Verify Add Filter Text Editor
    Add Filter      "ID"                       ID                   ${TRUE}
    Set Editor Index    0  
    Filter Display Name Should Contains         ${defaultTextFilterDisplayName}
    Query Operator Should Be    ${defaultOperatorTextFilter}
    Check Apply Button

# Time
Verify Add Filter Time Editor
    Add Filter      "TheTime"                  TheTime             ${TRUE}
    Set Editor Index    0  
    Filter Display Name Should Contains         ${defaultTimeFilterDisplayName}
    Query Operator Should Be    ${defaultOperatorTimeFilter}
    Argument Value Should Be    ${defaultArgumentTimeFilter}
    Check Apply Button

# TimeSpan
Verify Add Filter TimeSpan Editor
    Add Filter       "Calculated Delay"              ExpectedDelay       ${TRUE}
    Set Editor Index    0  
    Filter Display Name Should Contains         ${defaultTimeSpanFilterDisplayName}
    Query Operator Should Be    ${defaultOperatorTimeSpanFilter}
    Argument Period Value Should Be    ${defaultArgumentTimeSpanFilter}
    Check Apply Button

# TimeStamp
Verify Add Filter TimeStamp Editor
    Add Filter       "TheDateTime"              TheDateTime         ${TRUE}
    Set Editor Index    0  
    Filter Display Name Should Contains         ${defaultTimeStampFilterDisplayName}
    Query Operator Should Be    ${defaultOperatorTimeStampFilter}
    Argument Type Should Be     ${defaultArgumentTimeStampFilter}
    Check Apply Button

# Boolean
Verify Add Filter Boolean Editor
    Add Filter       "Is Fixed"                 IsFixed             ${TRUE}
    Set Editor Index    0  
    Filter Display Name Should Contains         ${defaultBooleanFilterDisplayName}
    Query Operator Should Be    ${defaultOperatorBooleanFilter}
    Check Apply Button

Verify Edit Filter Boolean Operator
    Verify Edit Filter Operator    0    is not empty          (Self) - Special Advice for Early Shipping is not empty
    Verify Edit Filter Operator    0    is empty              (Self) - Special Advice for Early Shipping is empty

Verify Edit Filter Currency Operator
    Verify Edit Filter Operator    1    is not empty          (Self) - Ordered Value is not empty   
    Verify Edit Filter Operator    1    is equal to           (Self) - Ordered Value is equal to
    Verify Edit Filter Operator    1    is smaller than       (Self) - Ordered Value is smaller than
    Verify Edit Filter Operator    1    is between            (Self) - Ordered Value is between

Verify Edit Filter Date Operator
    Verify Edit Filter Operator    2    is equal to            (Self) - Order Due Date is equal to Jan/30/2020  
    Verify Edit Filter Operator    2    is before              (Self) - Order Due Date is before Jan/30/2020
    Verify Edit Filter Operator    2    is between             (Self) - Order Due Date is between Jan/30/2020

Verify Edit Filter DateTime Operator
    Verify Edit Filter Operator    3    is equal to            (Self) - DATETIME is equal to  
    Verify Edit Filter Operator    3    is before              (Self) - DATETIME is before
    Verify Edit Filter Operator    3    is between             (Self) - DATETIME is between

Verify Edit Filter Double Operator
    Verify Edit Filter Operator    4    is not empty           (Self) - Quantity is not empty   
    Verify Edit Filter Operator    4    is equal to            (Self) - Quantity is equal to
    Verify Edit Filter Operator    4    is smaller than        (Self) - Quantity is smaller than
    Verify Edit Filter Operator    4    is between             (Self) - Quantity is between

Verify Edit Filter Enumerated Operator
    Verify Edit Filter Operator    5    is not empty           (Self) - Delivery Reliability is not empty   
    Verify Edit Filter Operator    5    is equal to            (Self) - Delivery Reliability is equal to 
    Verify Edit Filter Operator    5    short name contains substring(s)    (Self) - Delivery Reliability short name contains substring(s)
    Verify Edit Filter Operator    5    matches pattern(s)     (Self) - Delivery Reliability matches pattern(s)

Verify Edit Filter Int Operator 
    Verify Edit Filter Operator    6    is not empty           (Self) - Number of Material Plant Data is not empty   
    Verify Edit Filter Operator    6    is equal to            (Self) - Number of Material Plant Data is equal to
    Verify Edit Filter Operator    6    is smaller than        (Self) - Number of Material Plant Data is smaller than
    Verify Edit Filter Operator    6    is between             (Self) - Number of Material Plant Data is between

Verify Edit Filter Percentage Operator
    Verify Edit Filter Operator    7    is not empty           (Self) - Delivery Reliability As Percentage is not empty   
    Verify Edit Filter Operator    7    is equal to            (Self) - Delivery Reliability As Percentage is equal to
    Verify Edit Filter Operator    7    is smaller than        (Self) - Delivery Reliability As Percentage is smaller than
    Verify Edit Filter Operator    7    is between             (Self) - Delivery Reliability As Percentage is between

Verify Edit Filter Period Operator
    Verify Edit Filter Operator    8    is not empty           (Self) - Calculated Delay is not empty   
    Verify Edit Filter Operator    8    is equal to            (Self) - Calculated Delay is equal to
    Verify Edit Filter Operator    8    is smaller than        (Self) - Calculated Delay is smaller than
    Verify Edit Filter Operator    8    is between             (Self) - Calculated Delay is between

Verify Edit Filter Text Operator
    Verify Edit Filter Operator    9    is not empty           (Self) - Area of the Country is not empty   
    Verify Edit Filter Operator    9    is equal to            (Self) - Area of the Country is equal to
    Verify Edit Filter Operator    9    is smaller than        (Self) - Area of the Country is smaller than
    Verify Edit Filter Operator    9    is between             (Self) - Area of the Country is between
    Verify Edit Filter Operator    9    matches pattern(s)     (Self) - Area of the Country matches pattern(s)

Verify Edit Filter Time Operator
    Verify Edit Filter Operator    10    is not empty          (Self) - TIME is not empty   
    Verify Edit Filter Operator    10    is equal to           (Self) - TIME is equal to
    Verify Edit Filter Operator    10    is before             (Self) - TIME is before
    Verify Edit Filter Operator    10    is between            (Self) - TIME is between

Verify Edit Filter Timespan Operator
    Verify Edit Filter Operator    11    is not empty          (Self) - Description is not empty   
    Verify Edit Filter Operator    11    is equal to           (Self) - Description is equal to
    Verify Edit Filter Operator    11    is smaller than       (Self) - Description is smaller than
    Verify Edit Filter Operator    11    is between          (Self) - Description is between

Verify Edit Filter Operator
    [Arguments]    ${index}    ${operator}    ${filterName} 
    Click Edit Filter    ${index}   
    Set Editor Index    ${index}
    Choose Dropdown Filter Operator Via Edit Filter    ${operator}
    Filter Display Name Should Contains     ${filterName}         
    Check Apply Button On Edit Filter

Verify Edit Execution Parameter
    Click Edit Filter    0
    Set Editor Index    0  
    Click Execute Parameter To Edit Filter
    Filter Display Execution Parameter Icon Should Be Visible
    Check Apply Button On Edit Filter

Check Apply Button On Edit Filter  
    Scroll Display Tab To Vertical    500  
    Apply Filter Button Should Be Visible
    Scroll Display Tab To Vertical    0  
    Click Undo Filters And Jumps
    Apply Filter Button Should Be Disable

Verify Edit Boolean Filter Value 
    Click Edit Filter    0
    Set Editor Index    0 
    Click Boolean Radio Button "Yes"
    Filter Display Name Should Contains    ${txtBooleanAfterEditValue}     
    Check Apply Button On Edit Filter

Verify Edit Currency Filter Value
    Click Edit Filter    1
    Set Editor Index    1 
    Click Increase Number Filter Value
    Filter Display Name Should Contains     ${txtCurrencyAfterEditValue}     
    Check Apply Button On Edit Filter

Verify Edit Date Filter Value
    Click Edit Filter    2
    Set Editor Index    2
    Choose Dropdown Edit Filter Value    Period
    Filter Display Name Should Contains     ${txtDateAfterEditValue}     
    Check Apply Button On Edit Filter

Verify Edit DateTime Filter Value
    Click Edit Filter    3
    Set Editor Index    3 
    Choose Dropdown Edit Filter Value    Period
    Filter Display Name Should Contains     ${txtDateTimeAfterEditValue}     
    Check Apply Button On Edit Filter

Verify Edit Double Filter Value
    Click Edit Filter       4
    Set Editor Index    4 
    Click Increase Number Filter Value
    Filter Display Name Should Contains     ${txtDoubleAfterEditValue}
    Check Apply Button On Edit Filter

Verify Edit Enumerate Filter Value
    Click Edit Filter    5
    Set Editor Index    5 
    Select Checkbox Enum List   3
    Filter Display Name Should Contains     ${txtEnumerateAfterEditValue}     
    # Wait Until Page Contains    ${txtEnumerateAfterEditValue}    60s
    Check Apply Button On Edit Filter

Verify Edit Int Filter Value
    Click Edit Filter       6
    Set Editor Index    6 
    Click Increase Number Filter Value
    Filter Display Name Should Contains     ${txtIntAfterEditValue}
    Check Apply Button On Edit Filter

Verify Edit Percentage Filter Value
    Click Edit Filter       7
    Set Editor Index    7 
    Click Increase Number Filter Value
    Filter Display Name Should Contains     ${txtPercentageAfterEditValue}
    Check Apply Button On Edit Filter

Verify Edit Period Filter Value
    Click Edit Filter       8
    Set Editor Index    8 
    Click Increase Timespan,Period Filter Value
    Filter Display Name Should Contains     ${txtPeriodAfterEditValue}
    Check Apply Button On Edit Filter

Verify Edit Text Filter Value
    Click Edit Filter       9
    Set Editor Index    9 
    Input Text Filter Value          ABC
    Filter Display Name Should Contains     ${txtTextAfterEditValue}
    Check Apply Button On Edit Filter

Verify Edit Time Filter Value
    Click Edit Filter       10
    Set Editor Index    10 
    Input Time Filter Value          00:00:01
    Filter Display Name Should Contains     ${txtTimeAfterEditValue}
    Check Apply Button On Edit Filter

Verify Edit Timespan Filter Value
    Click Edit Filter       11
    Set Editor Index    11 
    Click Increase Timespan,Period Filter Value
    Filter Display Name Should Contains     ${txtTimespanAfterEditValue}
    Check Apply Button On Edit Filter
