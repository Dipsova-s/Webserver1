*** Variables ***
${ddlChartAxisTitle}                ChartOptionDropDownAxisTitle_ddlWrapper
${ddlChartAxisValue}                ChartOptionDropDownAxisValue_ddlWrapper
${ddlChartAxisScale}                ChartOptionDropDownAxisScale_ddlWrapper
${ddlChartDataLabel}                ChartOptionDropDownDataLabel_ddlWrapper
${ddlChartGridline}                 ChartOptionDropDownGridline_ddlWrapper
${ddlChartGridlineType}             ChartOptionDropDownGridlineType_ddlWrapper
${ddlChartLegend}                   ChartOptionDropDownLegend_ddlWrapper
${ddlChartRanges}                   ChartOptionDropDownRanges_listbox
${txtFirstScaleLower}               input0-1
${txtFirstScaleUpper}               input0-2
${txtSecondScaleLower}              input1-1
${txtSecondScaleUpper}              input1-2
${lblFirstScaleSuffix}              jquery=.labelScale2:eq(0)
${lblSecondScaleSuffix}             jquery=.labelScale2:eq(1)

*** Keywords ***
Chart Option Should Have "Axis titles" Setting
    Page Should Contain Element   ${ddlChartAxisTitle}

Chart Option Should Have "Axis values" Setting
    Page Should Contain Element   ${ddlChartAxisValue}

Chart Option Should Have "Axis scale" Setting
    Page Should Contain Element   ${ddlChartAxisScale}

Chart Option Should Have "Data labels" Setting
    Page Should Contain Element   ${ddlChartDataLabel}

Chart Option Should Have "Gridlines" Setting
    Page Should Contain Element   ${ddlChartGridline}

Chart Option Should Have "Gridline type" Setting
    Page Should Contain Element   ${ddlChartGridlineType}

Chart Option Should Have "Legend" Setting
    Page Should Contain Element   ${ddlChartLegend}

Chart Option Should Have "Ranges" Setting
    Page Should Contain Element   ${ddlChartRanges}

Select Axis Scale Mode
    [Arguments]    ${mode}
    Select Dropdown By Text    ${ddlChartAxisScale}    ${mode}

Get First Scale Suffix
    ${suffix}    Get Text    ${lblFirstScaleSuffix}
    [Return]    ${suffix}

Input First Chart Scale Lower Bound
    [Arguments]    ${value}
    Input kendo Numeric TextBox    ${txtFirstScaleLower}    ${value}

Input First Chart Scale Upper Bound
    [Arguments]    ${value}
    Input kendo Numeric TextBox    ${txtFirstScaleUpper}    ${value}

Input Second Chart Scale Lower Bound
    [Arguments]    ${value}
    Input kendo Numeric TextBox    ${txtSecondScaleLower}    ${value}

Input Second Chart Scale Upper Bound
    [Arguments]    ${value}
    Input kendo Numeric TextBox    ${txtSecondScaleUpper}    ${value}