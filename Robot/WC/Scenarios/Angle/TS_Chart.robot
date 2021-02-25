*** Settings ***
Resource    		${EXECDIR}/WC/POM/Search/SearchPage.robot
Resource    		${EXECDIR}/WC/POM/Angle/AnglePage.robot
Resource            ${EXECDIR}/WC/POM/Shared/UserSettingsPanel.robot

*** Variables ***
${TEST_VERIFY_CHART_ANGLE_NAME}              Angle For General Test
${TEST_VERIFY_CHART_DISPLAY_NAME}            Test Chart 1
${GRID_HEADER_MARGIN}  jquery=#AngleGrid .k-grid-header-wrap th[data-title="Margin"]

*** Keywords ***
Chart Options Are Presented
    Go To Chart Test Display
    Check Area Options Are Presented
    Check Bar Cluster Options Are Presented
    Check Bubble Options Are Presented
    Check Column Cluster Options Are Presented
    Check Donut Options Are Presented
    Check Line Options Are Presented
    Check Pie Options Are Presented
    Check Radar Line Options Are Presented
    Check Scatter Options Are Presented
    Check Gauge Options Are Presented

Chart Options Axis Scale Functionality
    Go To Chart Test Display
    Change Axis Scale To Manual
    First Scale Options Should Available
    Check First Suffix Is "K EUR"
    Click Hide Display Option
    Check Change Chart Type And Scale Mode Keep As Manual
    Move Field From Row To Column Area And Scale Mode Reset To Automatic
    Check Change Chart Type And Second Scale Mode Available

Chart Options Data Labels Functionality
    Click Display Tab
    Change Data Labels      Hide data labels
    Click Apply Field Setting
    Change Data Labels      Show values only
    Click Apply Field Setting
    Change Data Labels      Show data labels
    Click Apply Field Setting
    Change Data Labels      Hover
    Click Apply Field Setting

Drilldown Chart Display
    Go To Chart Test Display
    
    Click Display Tab
    Set Editor Context: Display Tab
    Add Filter On Display    Ordered Value    OrderedValue    ${TRUE}
    Set Editor Index    0  
    Choose Dropdown Filter Operator Via Edit Filter    is greater than
    Click Apply Filter On Display
    
    Setup Field Settings For Chart Drilldown
    ${beforeDrilldownCount}    Get Total Of First Bar In Column Chart
    Click First Bar In Column Chart
    ${afterDrilldownCount}    Get Number Of Object
    Should Be Equal    ${beforeDrilldownCount}    ${afterDrilldownCount}

    Go Back To Chart After Drilldown
    ${expectFilter}    Get Expect Filter Of Second Legend
    Click Second Legend In Chart
    Click Display Tab
    Display Filter Should Contain    ${expectFilter}

Drilldown Chart Display with Null Value Type
    Find Angle By ID Then Execute The First Angle      ROBOT_ANGLE_DrilldownTesting
    ${beforeDrilldownCount}   Get Total Of First Bar In Column Chart
    Click First Bar In Column Chart
    ${afterDrilldownCount}    Get Number Of Object
    Should Be Equal    ${beforeDrilldownCount}    ${afterDrilldownCount}

#####################################################################################################

Go To Chart Test Display
    Search Angle From Search Page And Execute Angle    ${TEST_VERIFY_CHART_ANGLE_NAME}
    Change Display By Name    ${TEST_VERIFY_CHART_DISPLAY_NAME}
    Click Display Tab

Setup Field Settings For Chart Drilldown
    Change Chart To Column Stack
    Click Field In Row Area By Field Index    0
    Click Show Field Format For Field Settings
    Select Bucket Option    1,000,000
    Save Field Format
    Click Field In Data Area By Field Index  1
    Click Remove Field For Field Settings
    Click Apply Field Setting

Add Field Double 
    Set Decimal Places      None

Add Field Double Filter Greater Than Zero
    Set Decimal Places      None

Create Chart At Field Double
    Set Decimal Places      None

Setup Field Settings For Chart Drilldown Floating Number
    Change Chart To Bar Cluster
    Click Field In Row Area By Field Index    0
    Click Show Field Format For Field Settings
    Select Bucket Option    0.001
    Save Field Format
    Click Apply Field Setting

Go Back To Chart After Drilldown
    Go Back
    Wait Progress Bar Closed
    Wait Until Chart Display Loaded

Check Area Options Are Presented
    Change Chart To Area
    Click Show Display Option
    Chart Option Should Have "Axis titles" Setting
    Chart Option Should Have "Axis values" Setting
    Chart Option Should Have "Axis scale" Setting
    Chart Option Should Have "Data labels" Setting
    Chart Option Should Have "Gridlines" Setting
    Chart Option Should Have "Legend" Setting
    Click Hide Display Option

Check Bar Cluster Options Are Presented
    Change Chart To Bar Cluster
    Click Show Display Option
    Chart Option Should Have "Axis titles" Setting
    Chart Option Should Have "Axis values" Setting
    Chart Option Should Have "Axis scale" Setting
    Chart Option Should Have "Data labels" Setting
    Chart Option Should Have "Gridlines" Setting
    Chart Option Should Have "Legend" Setting
    Click Hide Display Option

Check Bubble Options Are Presented
    Change Chart To Bubble
    Click Show Display Option
    Chart Option Should Have "Axis titles" Setting
    Chart Option Should Have "Axis values" Setting
    Chart Option Should Have "Axis scale" Setting
    Chart Option Should Have "Data labels" Setting
    Chart Option Should Have "Gridlines" Setting
    Chart Option Should Have "Legend" Setting
    Click Hide Display Option

Check Column Cluster Options Are Presented
    Change Chart To Column Cluster
    Click Show Display Option
    Chart Option Should Have "Axis titles" Setting
    Chart Option Should Have "Axis values" Setting
    Chart Option Should Have "Axis scale" Setting
    Chart Option Should Have "Data labels" Setting
    Chart Option Should Have "Gridlines" Setting
    Chart Option Should Have "Legend" Setting
    Click Hide Display Option

Check Donut Options Are Presented
    Change Chart To Donut
    Click Show Display Option
    Chart Option Should Have "Data labels" Setting
    Chart Option Should Have "Legend" Setting
    Click Hide Display Option

Check Line Options Are Presented
    Change Chart To Line
    Click Show Display Option
    Chart Option Should Have "Axis titles" Setting
    Chart Option Should Have "Axis values" Setting
    Chart Option Should Have "Axis scale" Setting
    Chart Option Should Have "Data labels" Setting
    Chart Option Should Have "Gridlines" Setting
    Chart Option Should Have "Legend" Setting
    Click Hide Display Option

Check Pie Options Are Presented
    Change Chart To Pie
    Click Show Display Option
    Chart Option Should Have "Data labels" Setting
    Chart Option Should Have "Legend" Setting
    Click Hide Display Option

Check Radar Line Options Are Presented
    Change Chart To Radar Line
    Click Show Display Option
    Chart Option Should Have "Radar Axis values" Setting
    Chart Option Should Have "Data labels" Setting
    Chart Option Should Have "Radar Gridlines" Setting
    Chart Option Should Have "Gridline type" Setting
    Chart Option Should Have "Legend" Setting
    Click Hide Display Option

Check Scatter Options Are Presented
    Change Chart To Scatter
    Click Show Display Option
    Chart Option Should Have "Axis titles" Setting
    Chart Option Should Have "Axis values" Setting
    Chart Option Should Have "Axis scale" Setting
    Chart Option Should Have "Data labels" Setting
    Chart Option Should Have "Gridlines" Setting
    Chart Option Should Have "Legend" Setting
    Click Hide Display Option

Check Gauge Options Are Presented
    Change Chart To Gauge
    Click Show Display Option
    Chart Option Should Have "Gauge Axis titles" Setting
    Chart Option Should Have "Gauge Data labels" Setting
    Chart Option Should Have "Gauge Ranges" Setting
    Click Hide Display Option

Change Axis Scale To Manual
    [Arguments]    ${value1}=0    ${value2}=0    ${value3}=0    ${value4}=0
    Click Show Display Option
    Select Axis Scale Mode    Manual
    Run Keyword If    "${value1}${value2}"!="00"    Input First Chart Scale Lower Bound    ${value1}
    Run Keyword If    "${value1}${value2}"!="00"    Input First Chart Scale Upper Bound    ${value2}
    Run Keyword If    "${value3}${value4}"!="00"    Input Second Chart Scale Lower Bound    ${value3}
    Run Keyword If    "${value3}${value4}"!="00"    Input Second Chart Scale Upper Bound    ${value4}
    Sleep  ${TIMEOUT_GENERAL}

Change Data Labels
    [Arguments]     ${label} 
    Click Show Display Option
    Select Data Labels      ${label}
    Click Hide Display Option

Check First Suffix Is "K EUR"
    First Scale Suffix Should Be  K EUR

Check Change Chart Type And Scale Mode Keep As Manual
    Change Chart To Column Cluster
    Click Show Display Option
    First Scale Options Should Available
    Click Hide Display Option

Check Change Chart Type And Second Scale Mode Available
    Change Chart To Scatter Multi Axis
    Change Axis Scale To Manual
    Second Scale Options Should Available
    Click Hide Display Option

Move Field From Row To Column Area And Scale Mode Reset To Automatic
    Move Field From Row To Column Area
    Click Show Display Option
    First Scale Options Should Not Available
    Click Hide Display Option

Verify Format Field Bucket By Per Day
    [Arguments]    ${Index}
    Click Field In Row Area By Field Index    ${Index}
    Click Show Field Format For Field Settings
    Select Bucket Option  Per day
    Save Field Format
    Click Apply Field Setting
    Wait Until Chart Display Loaded

Verify Format Field Bucket By Per Week
    [Arguments]    ${Index}
    Click Field In Row Area By Field Index    ${Index}
    Click Show Field Format For Field Settings
    Select Bucket Option  Per week
    Save Field Format
    Click Apply Field Setting
    Wait Until Chart Display Loaded

Verify Format Field Bucket By Per Month
    [Arguments]    ${Index}
    Click Field In Row Area By Field Index    ${Index}
    Click Show Field Format For Field Settings
    Select Bucket Option  Per month
    Save Field Format
    Click Apply Field Setting
    Wait Until Chart Display Loaded

