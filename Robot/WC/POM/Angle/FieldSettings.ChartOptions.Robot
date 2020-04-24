*** Variables ***
${ddlChartAxisTitle}                css=.row-axistitle
${ddlChartGaugeAxisTitle}           css=.row-axistitlegauge
${ddlChartAxisValue}                css=.row-axisvalue
${ddlChartRadarAxisValue}           css=.row-axisvalueradar
${ddlChartAxisScale}                css=.row-axisscale
${ddlChartDataLabel}                css=.row-datalabel
${ddlChartGaugeDataLabel}           css=.row-datalabelgauge
${ddlChartGridline}                 css=.row-gridline
${ddlChartRadarGridline}            css=.row-gridlineradar
${ddlChartGridlineType}             css=.row-gridlinetype
${ddlChartLegend}                   css=.row-legend
${ddlChartGaugeRanges}              css=.row-rangesgauge
${txtFirstScaleLower}               css=input[name="axisscale_ranges-0-lower"]
${txtFirstScaleUpper}               css=input[name="axisscale_ranges-0-upper"]
${txtSecondScaleLower}              css=input[name="axisscale_ranges-1-lower"]
${txtSecondScaleUpper}              css=input[name="axisscale_ranges-1-upper"]
${lblFirstScaleSuffix}              jquery=.row-axisscale_ranges:eq(0) .suffix
${lblSecondScaleSuffix}             jquery=.row-axisscale_ranges:eq(1) .suffix

*** Keywords ***
Chart Option Should Have "Axis titles" Setting
    Page Should Contain Element   ${ddlChartAxisTitle}

Chart Option Should Have "Gauge Axis titles" Setting
    Page Should Contain Element   ${ddlChartGaugeAxisTitle}

Chart Option Should Have "Axis values" Setting
    Page Should Contain Element   ${ddlChartAxisValue}

Chart Option Should Have "Radar Axis values" Setting
    Page Should Contain Element   ${ddlChartRadarAxisValue}

Chart Option Should Have "Axis scale" Setting
    Page Should Contain Element   ${ddlChartAxisScale}

Chart Option Should Have "Data labels" Setting
    Page Should Contain Element   ${ddlChartDataLabel}

Chart Option Should Have "Gauge Data labels" Setting
    Page Should Contain Element   ${ddlChartGaugeDataLabel}

Chart Option Should Have "Gridlines" Setting
    Page Should Contain Element   ${ddlChartGridline}

Chart Option Should Have "Radar Gridlines" Setting
    Page Should Contain Element   ${ddlChartRadarGridline}

Chart Option Should Have "Gridline type" Setting
    Page Should Contain Element   ${ddlChartGridlineType}

Chart Option Should Have "Legend" Setting
    Page Should Contain Element   ${ddlChartLegend}

Chart Option Should Have "Gauge Ranges" Setting
    Page Should Contain Element   ${ddlChartGaugeRanges}

Select Axis Scale Mode
    [Arguments]    ${mode}
    Select Dropdown By Text    ${ddlChartAxisScale}    ${mode}

Select Data Labels
    [Arguments]     ${label}
    Select Dropdown By Text    ${ddlChartDataLabel}    ${label}

First Scale Options Should Available
    Page Should Contain Element  ${txtFirstScaleLower}
    Page Should Contain Element  ${txtFirstScaleUpper}

First Scale Options Should Not Available
    Page Should Not Contain Element  ${txtFirstScaleLower}
    Page Should Not Contain Element  ${txtFirstScaleUpper}

Second Scale Options Should Available
    Page Should Contain Element  ${txtSecondScaleLower}
    Page Should Contain Element  ${txtSecondScaleUpper}

First Scale Suffix Should Be
    [Arguments]  ${expected}
    Element Text Should Be  ${lblFirstScaleSuffix}  ${expected}

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