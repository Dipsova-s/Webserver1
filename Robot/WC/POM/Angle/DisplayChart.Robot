*** Variables ***
${divChartWrapper}              jquery=#ChartWrapper
${pgbChartDisplay}              jquery=#ChartWrapper .k-loading-mask
${svgChart}                     jquery=#ChartWrapper svg
${svgFirstBarColumnChart}       jquery=#chart > svg > g > g:nth-child(3) > g:nth-child(5) > g > g:nth-child(1)
${divChartTooltip}              .k-chart-tooltip
${liSecondLegend}               jquery=.k-legend-custom li[data-index="1"]

*** Keywords ***
Wait Until Chart Display Loaded
    Wait Until Page Contains Element    ${divChartWrapper}
    ${isExecute}  Is Angle Executed
    Run Keyword If    ${isExecute} == True    Wait Until Page Contains Element    ${svgChart}
    Wait Until Page Does Not Contain Element    ${pgbChartDisplay}
    Wait Until Field Settings Loaded
    Wait Until Ajax Complete

Click First Bar In Column Chart
    Click Element    ${svgFirstBarColumnChart}
    Wait Progress Bar Closed
    Wait Until List Display Loaded

Get Total Of First Bar In Column Chart
    Mouse Over    ${svgFirstBarColumnChart}
    Wait Until Page Contains Element    css=${divChartTooltip}
    ${tooltipText} =    Execute Javascript    return $('${divChartTooltip}').text()
    ${total} =    Execute Javascript    return parseInt('${tooltipText}'.substr('${tooltipText}'.lastIndexOf(': ')+2))
    [Return]    ${total}

Click Second Legend In Chart
    Click Element    ${liSecondLegend}
    Wait Progress Bar Closed
    Wait Until List Display Loaded

Get Expect Filter Of Second Legend
    ${filterValue}    Get Element Attribute    ${liSecondLegend}  title
    ${expectFilter}    Execute Javascript    return "is equal to ${filterValue}"
    [Return]    ${expectFilter}