*** Variables ***
${ddlChartType}                     css=.k-widget.chart-type
${ddlChartTypeAreaCluster}          jquery=.chart-type-dropdown .area
${ddlChartTypeAreaStack}            jquery=.chart-type-dropdown .area_stack
${ddlChartTypeAreaMultiAxis}        jquery=.chart-type-dropdown .area_multi
${ddlChartTypeBarCluster}           jquery=.chart-type-dropdown .bar
${ddlChartTypeBarStack}             jquery=.chart-type-dropdown .bar_stack
${ddlChartTypeBubble}               jquery=.chart-type-dropdown .bubble
${ddlChartTypeColumnCluster}        jquery=.chart-type-dropdown .column
${ddlChartTypeColumnStack}          jquery=.chart-type-dropdown .column_stack
${ddlChartTypeColumnMultiAxis}      jquery=.chart-type-dropdown .column_multi
${ddlChartTypeDonut}                jquery=.chart-type-dropdown .donut
${ddlChartTypeLineCluster}          jquery=.chart-type-dropdown .line
${ddlChartTypeLineStack}            jquery=.chart-type-dropdown .line_stack
${ddlChartTypeLineMultiAxis}        jquery=.chart-type-dropdown .line_multi
${ddlChartTypePie}                  jquery=.chart-type-dropdown .pie
${ddlChartTypeRadarLine}            jquery=.chart-type-dropdown .radarLine
${ddlChartTypeRadarArea}            jquery=.chart-type-dropdown .radarLine_stack
${ddlChartTypeScatter}              jquery=.chart-type-dropdown .scatter
${ddlChartTypeScatterLine}          jquery=.chart-type-dropdown .scatter_stack
${ddlChartTypeScatterMultiAxis}     jquery=.chart-type-dropdown .scatter_multi
${ddlChartTypeGauge}                jquery=.chart-type-dropdown .gauge

${chartTypeAreaCluster}             css=.k-widget.chart-type .area
${chartTypeAreaStack}               css=.k-widget.chart-type .area_stack
${chartTypeAreaMultiAxis}           css=.k-widget.chart-type .area_multi
${chartTypeBarCluster}              css=.k-widget.chart-type .bar
${chartTypeBarStack}                css=.k-widget.chart-type .bar_stack
${chartTypeBubble}                  css=.k-widget.chart-type .bubble
${chartTypeColumnCluster}           css=.k-widget.chart-type .column
${chartTypeColumnStack}             css=.k-widget.chart-type .column_stack
${chartTypeColumnMultiAxis}         css=.k-widget.chart-type .column_multi
${chartTypeDonut}                   css=.k-widget.chart-type .donut
${chartTypeLineCluster}             css=.k-widget.chart-type .line
${chartTypeLineStack}               css=.k-widget.chart-type .line_stack
${chartTypeLineMultiAxis}           css=.k-widget.chart-type .line_multi
${chartTypePie}                     css=.k-widget.chart-type .pie
${chartTypeRadarLine}               css=.k-widget.chart-type .radarLine
${chartTypeRadarArea}               css=.k-widget.chart-type .radarLine_stack
${chartTypeScatter}                 css=.k-widget.chart-type .scatter
${chartTypeScatterLine}             css=.k-widget.chart-type .scatter_stack
${chartTypeScatterMultiAxis}        css=.k-widget.chart-type .scatter_multi
${chartTypeGauge}                   css=.k-widget.chart-type .gauge

*** Keywords ***
Change Chart To Area
    Select Dropdown By Selector    ${ddlChartType}    ${ddlChartTypeAreaCluster}

Change Chart To Bar Cluster
    Select Dropdown By Selector    ${ddlChartType}    ${ddlChartTypeBarCluster}

Change Chart To Column Cluster
    Select Dropdown By Selector    ${ddlChartType}    ${ddlChartTypeColumnCluster}

Change Chart To Column Stack
    Select Dropdown By Selector    ${ddlChartType}    ${ddlChartTypeColumnStack}

Change Chart To Donut
    Select Dropdown By Selector    ${ddlChartType}    ${ddlChartTypeDonut}

Change Chart To Line
    Select Dropdown By Selector    ${ddlChartType}    ${ddlChartTypeLineCluster}

Change Chart To Pie
    Select Dropdown By Selector    ${ddlChartType}    ${ddlChartTypePie}

Change Chart To Radar Line
    Select Dropdown By Selector    ${ddlChartType}    ${ddlChartTypeRadarLine}

Change Chart To Bubble
    Select Dropdown By Selector    ${ddlChartType}    ${ddlChartTypeBubble}

Change Chart To Scatter
    Select Dropdown By Selector    ${ddlChartType}    ${ddlChartTypeScatter}

Change Chart To Scatter Multi Axis
    Select Dropdown By Selector    ${ddlChartType}    ${ddlChartTypeScatterMultiAxis}

Change Chart To Gauge
    Select Dropdown By Selector    ${ddlChartType}    ${ddlChartTypeGauge}

Current Chart Should Be Area
    Page Should Contain Element    ${chartTypeAreaCluster}

Current Chart Should Be Bar Cluster
    Page Should Contain Element    ${chartTypeBarCluster}

Current Chart Should Be Column Cluster
    Page Should Contain Element    ${chartTypeColumnCluster}

Current Chart Should Be Column Stack
    Page Should Contain Element    ${chartTypeColumnStack}

Current Chart Should Be Donut
    Page Should Contain Element    ${chartTypeDonut}

Current Chart Should Be Line
    Page Should Contain Element    ${chartTypeLineCluster}

Current Chart Should Be Pie
    Page Should Contain Element    ${chartTypePie}

Current Chart Should Be Radar Line
    Page Should Contain Element    ${chartTypeRadarLine}

Current Chart Should Be Bubble
    Page Should Contain Element    ${chartTypeBubble}

Current Chart Should Be Scatter
    Page Should Contain Element    ${chartTypeScatter}

Current Chart Should Be Scatter Multi Axis
    Page Should Contain Element    ${chartTypeScatterMultiAxis}

Current Chart Should Be Gauge
    Page Should Contain Element    ${chartTypeGauge}