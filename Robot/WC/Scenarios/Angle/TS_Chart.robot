*** Settings ***
Resource    		${EXECDIR}/WC/POM/Search/SearchPage.robot
Resource    		${EXECDIR}/WC/POM/Angle/AnglePage.robot

*** Variables ***
${TEST_VERIFY_CHART_ANGLE_NAME}              Angle For General Test
${TEST_VERIFY_CHART_DISPLAY_NAME}            Test Chart 1

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
    Check First Scale Options Should Available
    Check First Suffix Is "K EUR"
    Check Change Chart Type And Scale Mode Keep As Manual
    Move Field From Row To Column Area And Scale Mode Reset To Automatic
    Check Change Chart Type And Second Scale Mode Available

Drilldown Chart Display
    Go To Chart Test Display
    Setup Field Settings For Chart Drilldown
    ${beforeDrilldownCount}    Get Total Of First Bar In Column Chart
    Click First Bar In Column Chart
    ${afterDrilldownCount}    Get Number Of Object
    Should Be Equal    ${beforeDrilldownCount}    ${afterDrilldownCount}

    Go Back To Chart After Drilldown
    ${expectFilter}    Get Expect Filter Of Second Legend
    Click Second Legend In Chart
    Click Toggle Angle
    Filter Text Should Be In Display Panel    ${expectFilter}

#####################################################################################################

Go To Chart Test Display
    Search Angle From Search Page And Execute Angle    ${TEST_VERIFY_CHART_ANGLE_NAME}
    Change Display By Name    ${TEST_VERIFY_CHART_DISPLAY_NAME}

Setup Field Settings For Chart Drilldown
    Change Chart To Column Stack
    Click Field In Row Area By Field Index    0
    Click Show Field Format For Field Settings
    Select Bucket Option    1,000,000
    Save Field Format
    Remove Field In Data Area By Field Index    1
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

Check Bar Cluster Options Are Presented
    Change Chart To Bar Cluster
    Click Show Display Option
    Chart Option Should Have "Axis titles" Setting
    Chart Option Should Have "Axis values" Setting
    Chart Option Should Have "Axis scale" Setting
    Chart Option Should Have "Data labels" Setting
    Chart Option Should Have "Gridlines" Setting
    Chart Option Should Have "Legend" Setting

Check Bubble Options Are Presented
    Change Chart To Bubble
    Click Show Display Option
    Chart Option Should Have "Axis titles" Setting
    Chart Option Should Have "Axis values" Setting
    Chart Option Should Have "Axis scale" Setting
    Chart Option Should Have "Data labels" Setting
    Chart Option Should Have "Gridlines" Setting
    Chart Option Should Have "Legend" Setting

Check Column Cluster Options Are Presented
    Change Chart To Column Cluster
    Click Show Display Option
    Chart Option Should Have "Axis titles" Setting
    Chart Option Should Have "Axis values" Setting
    Chart Option Should Have "Axis scale" Setting
    Chart Option Should Have "Data labels" Setting
    Chart Option Should Have "Gridlines" Setting
    Chart Option Should Have "Legend" Setting

Check Donut Options Are Presented
    Change Chart To Donut
    Click Show Display Option
    Chart Option Should Have "Data labels" Setting
    Chart Option Should Have "Legend" Setting

Check Line Options Are Presented
    Change Chart To Line
    Click Show Display Option
    Chart Option Should Have "Axis titles" Setting
    Chart Option Should Have "Axis values" Setting
    Chart Option Should Have "Axis scale" Setting
    Chart Option Should Have "Data labels" Setting
    Chart Option Should Have "Gridlines" Setting
    Chart Option Should Have "Legend" Setting

Check Pie Options Are Presented
    Change Chart To Pie
    Click Show Display Option
    Chart Option Should Have "Data labels" Setting
    Chart Option Should Have "Legend" Setting

Check Radar Line Options Are Presented
    Change Chart To Radar Line
    Click Show Display Option
    Chart Option Should Have "Axis values" Setting
    Chart Option Should Have "Data labels" Setting
    Chart Option Should Have "Gridlines" Setting
    Chart Option Should Have "Gridline type" Setting
    Chart Option Should Have "Legend" Setting

Check Scatter Options Are Presented
    Change Chart To Scatter
    Click Show Display Option
    Chart Option Should Have "Axis titles" Setting
    Chart Option Should Have "Axis values" Setting
    Chart Option Should Have "Axis scale" Setting
    Chart Option Should Have "Data labels" Setting
    Chart Option Should Have "Gridlines" Setting
    Chart Option Should Have "Legend" Setting

Check Gauge Options Are Presented
    Change Chart To Gauge
    Click Show Display Option
    Chart Option Should Have "Axis titles" Setting
    Chart Option Should Have "Data labels" Setting
    Chart Option Should Have "Ranges" Setting

Change Axis Scale To Manual
    [Arguments]    ${value1}=0    ${value2}=0    ${value3}=0    ${value4}=0
    Click Show Display Option
    Select Axis Scale Mode    Manual
    Run Keyword If    "${value1}${value2}"!="00"    Input First Chart Scale Lower Bound    ${value1}
    Run Keyword If    "${value1}${value2}"!="00"    Input First Chart Scale Upper Bound    ${value2}
    Run Keyword If    "${value3}${value4}"!="00"    Input Second Chart Scale Lower Bound    ${value3}
    Run Keyword If    "${value3}${value4}"!="00"    Input Second Chart Scale Upper Bound    ${value4}

Check First Scale Options Should Available
    Page Should Contain Element    ${txtFirstScaleLower}
    Page Should Contain Element    ${txtFirstScaleUpper}

Check First Scale Options Should Not Available
    Page Should Not Contain Element    ${txtFirstScaleLower}
    Page Should Not Contain Element    ${txtFirstScaleUpper}

Check Second Scale Options Should Available
    Page Should Contain Element    ${txtSecondScaleLower}
    Page Should Contain Element    ${txtSecondScaleUpper}

Check First Suffix Is "K EUR"
    ${suffix}    Get First Scale Suffix
    Should Be Equal    ${suffix}    K EUR

Check Change Chart Type And Scale Mode Keep As Manual
    Change Chart To Column Cluster
    Click Show Display Option
    Check First Scale Options Should Available

Check Change Chart Type And Second Scale Mode Available
    Change Chart To Scatter Multi Axis
    Click Show Display Option
    Change Axis Scale To Manual
    Check Second Scale Options Should Available

Move Field From Row To Column Area And Scale Mode Reset To Automatic
    Move Field From Row To Column Area
    Click Show Display Option
    Check First Scale Options Should Not Available

Create Chart From Field
    Click Column Header
    Select Create Chart
    Wait Until Chart Display Loaded

Verify Format Field Bucket By Per Day
    [Arguments]    ${Index}
    Click Field In Row Area By Field Index    ${Index}
    Click Show Field Format For Field Settings
    Click Bucket Options
    Select Bucket Per Day
    Save Field Format
    Click Apply Field Setting
    Wait Until Chart Display Loaded

Verify Format Field Bucket By Per Week
    [Arguments]    ${Index}
    Click Field In Row Area By Field Index    ${Index}
    Click Show Field Format For Field Settings
    Click Bucket Options
    Select Bucket Per Week
    Save Field Format
    Click Apply Field Setting
    Wait Until Chart Display Loaded

Verify Format Field Bucket By Per Month
    [Arguments]    ${Index}
    Click Field In Row Area By Field Index    ${Index}
    Click Show Field Format For Field Settings
    Click Bucket Options
    Select Bucket Per Month
    Save Field Format
    Click Apply Field Setting
    Wait Until Chart Display Loaded

