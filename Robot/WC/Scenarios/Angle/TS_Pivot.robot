*** Settings ***
Resource    		${EXECDIR}/WC/POM/Search/SearchPage.robot
Resource    		${EXECDIR}/WC/POM/Angle/AnglePage.robot

*** Variables ***
${TEST_VERIFY_PIVOT_ANGLE_NAME}                 Angle For General Test
${TEST_VERIFY_PIVOT_DISPLAY_NAME}               Test Pivot 1
${TEST_VERIFY_PIVOT_PERCENTAGE_DISPLAY_NAME}    Test Pivot Percentage

*** Keywords ***
Pivot Settings Subtotal / Percentages Column / Custom Name / Field Icons / Collapse
    # Setup
    Go To Pivot Test Display
    Pivot Should Have Field Icons
    Change Pivot First Row Field Alias Name
    Change Pivot Second Row Date Bucket
    Change Pivot Settings For Percentages Display
    Click Apply Field Setting

    # Subtotal
    Subtotal Should Be Displayed In Pivot

    # Percentage
    Percentages Should Be Displayed And Correct Result In Pivot

    # Sort by summary
    Set Pivot Sort By Summary
    Pivot Should Sort By Summary Correctly

    # Collapse
    Pivot Should Store A Default Collapse State
    Click Collapse "None" Value
    Pivot Should Update A Collapse State

    # Alias
    #Alias Name Should Be Displayed Correctly In Pivot

    # Check keep collapsed state
    ${layoutBefore}   Get Pivot Layout
    Restore Pivot Settings For Percentages Display
    Click Apply Field Setting
    ${layoutAfter}   Get Pivot Layout
    Should Be Equal    ${layoutBefore}    ${layoutAfter}

Pivot Display Drilldown
    [Arguments]    ${angleJsonFilename}    ${angleName}    ${modelName}
    Upload Item And Check From Search Result    ${angleJsonFilename}    ${modelName}    ${angleName}
    Open Angle From First Angle in Search Page    ${angleName}

    # drilldown null value
    ${drilldownValue1}    Get Pivot Total Cell Value By Row Index    0
    Drilldown Pivot Total Cell Value By Row Index    0
    ${drilldownResult1}    Get Number Of Object
    Should Be True    ${drilldownResult1}==${drilldownValue1}

    # drilldown cell before grand total
    Change Display By Name    pivot2
    ${numberOfDrillDown2}    Get Pivot Cell Value Before Grand Total Cell    0
    Drilldown Pivot Cell Value Before Grand Total Cell   0
    ${drilldownResult2}    Get Number Of Object
    Should Be True    ${drilldownResult2}==${numberOfDrillDown2}

Pivot Percentages
    Go To Pivot Percentage Test Display

    #Row
    Click Show Display Option
    Select Show Total Option    Show for rows and columns
    Select Checkbox Include Subtotal
    Select Show Percentage Option    Row
    Click Apply Field Setting
    ${rowData}    Get Pivot Cell Value By Column Index And Row Index    0    0
    ${rowDataTotal}    Get Pivot Total Cell Value By Row Index    0
    ${rowDataPercentage}     Get Pivot Percentages Summary Cell Value By Row Index And Column Index    0    0
    ${result}    Execute Javascript    return WC.FormatHelper.GetFormattedValue('percentage', ${rowData}/${rowDataTotal}) == '${rowDataPercentage}'
    Should Be True    ${result}

    #Column
    Click Show Display Option
    Select Show Percentage Option    Column
    Click Apply Field Setting
    ${columnData}    Get Pivot Cell Value By Column Index And Row Index    0    0
    ${columnDataTotal}    Get Pivot Total Cell Value By Column Index    0
    ${columnDataPercentage}     Get Pivot Percentages Summary Cell Value By Row Index And Column Index    0    0
    ${result}    Execute Javascript    return WC.FormatHelper.GetFormattedValue('percentage', ${columnData}/${columnDataTotal}) == '${columnDataPercentage}'
    Should Be True    ${result}

    #Total
    Click Show Display Option
    Select Show Percentage Option    Total
    Click Apply Field Setting
    ${data}    Get Pivot Cell Value By Column Index And Row Index    0    0
    ${countGrandTotal}    Get Pivot Count Grand Total Cell Value
    ${dataPercentage}     Get Pivot Percentages Summary Cell Value By Row Index And Column Index    0    0
    ${result}    Execute Javascript    return WC.FormatHelper.GetFormattedValue('percentage', ${data}/${countGrandTotal}) == '${dataPercentage}'
    Should Be True    ${result}


######################################################################################

Go To Pivot Test Display
    Search Angle From Search Page And Execute Angle    ${TEST_VERIFY_PIVOT_ANGLE_NAME}
    Change Display By Name    ${TEST_VERIFY_PIVOT_DISPLAY_NAME}

Go Back To Pivot after Drilldown
    Go Back
    Wait Progress Bar Closed
    Wait Until Pivot Display Loaded

Change Pivot First Row Field Alias Name
    Click Field In Row Area By Field Index    0
    Click Show Field Format For Field Settings
    Input Bucket Alias Name    Robot name
    Save Field Format

Change Pivot First Row Set Bucket
    [Arguments]    ${bucket}
    Click Field In Row Area By Field Index    0
    Click Show Field Format For Field Settings
    Select Bucket Option    First 2 characters
    Save Field Format

Change Pivot Second Row Date Bucket
    Click Field In Row Area By Field Index    1
    Click Show Field Format For Field Settings
    Select Bucket Option    Per year
    Save Field Format

Change Pivot Second Column Number Bucket
    Click Field In Column Area By Field Index    1
    Click Show Field Format For Field Settings
    Select Bucket Option    10,000
    Save Field Format

Change Pivot Settings For Percentages Display
    Click Show Display Option
    Select Show Total Option    Show for columns
    Select Checkbox Include Subtotal
    Select Show Percentage Option    Column

Restore Pivot Settings For Percentages Display
    Click Show Display Option
    Select Show Total Option    Show for rows and columns
    Unselect Checkbox Include Subtotal
    Select Show Percentage Option    None

Percentages Should Be Displayed And Correct Result In Pivot
    Percentages Should Be Displayed In Pivot
    ${grandTotal}    Get Grand Total
    Should Be True    ${grandTotal}==100

Alias Name Should Be Displayed Correctly In Pivot
    First Row Header Should No New Line
    First Column Header Should Have New Line

Pivot Date Bucket Result Should Be Corrected
    ${dateText}    Get Sample Date Bucket Text
    Length Should Be    ${dateText}    4

Pivot Number Bucket Result Should Be Corrected
    ${numberText}    Get Sample Number Bucket Text
    Should Be Equal    ${numberText}    [0..10000>

Pivot Set Bucket Result Should Be Corrected
    ${setText}    Get Sample Set Bucket Text
    Length Should Be    ${setText}    2

Pivot First Row Set Bucket Options Should Not Contain "Last xx characters"
    Click Field In Row Area By Field Index    0
    Click Show Field Format For Field Settings
    ${count}    Get Element Count    jquery=#BucketOptionDropDown_listbox > li > span:contains("Last")
    Should Be True    ${count}==0
    Save Field Format

Go To Pivot Percentage Test Display
    Search Angle From Search Page And Execute Angle    ${TEST_VERIFY_PIVOT_ANGLE_NAME}
    Change Display By Name    ${TEST_VERIFY_PIVOT_PERCENTAGE_DISPLAY_NAME}

Set Pivot Sort By Summary
    Click Sort By Summary Test Cell
    Select Sort By Summary Test Option
    Submit Sort By Summary

Pivot Should Sort By Summary Correctly
    @{data}    Get Sort Summary Test Data
    ${dataCount}    Get Length    ${data}
    ${previousValue}    Convert To Integer    10000000
    : FOR    ${value}    IN    @{data}
    \    Should Be True    ${previousValue} >= ${value}
    \    ${previousValue}    Convert To Integer    ${value}
