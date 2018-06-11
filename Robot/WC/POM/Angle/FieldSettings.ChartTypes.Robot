*** Variables ***
${ddlChartType}                     ChartType_ddlWrapper
${ddlChartTypeAreaCluster}          jquery=#ChartType_listbox .area
${ddlChartTypeAreaStack}            jquery=#ChartType_listbox .area_stack
${ddlChartTypeAreaMultiAxis}        jquery=#ChartType_listbox .area_multi
${ddlChartTypeBarCluster}           jquery=#ChartType_listbox .bar
${ddlChartTypeBarStack}             jquery=#ChartType_listbox .bar_stack
${ddlChartTypeBubble}               jquery=#ChartType_listbox .bubble
${ddlChartTypeColumnCluster}        jquery=#ChartType_listbox .column
${ddlChartTypeColumnStack}          jquery=#ChartType_listbox .column_stack
${ddlChartTypeColumnMultiAxis}      jquery=#ChartType_listbox .column_multi
${ddlChartTypeDonut}                jquery=#ChartType_listbox .donut
${ddlChartTypeLineCluster}          jquery=#ChartType_listbox .line
${ddlChartTypeLineStack}            jquery=#ChartType_listbox .line_stack
${ddlChartTypeLineMultiAxis}        jquery=#ChartType_listbox .line_multi
${ddlChartTypePie}                  jquery=#ChartType_listbox .pie
${ddlChartTypeRadarLine}            jquery=#ChartType_listbox .radarLine
${ddlChartTypeRadarArea}            jquery=#ChartType_listbox .radarLine_stack
${ddlChartTypeScatter}              jquery=#ChartType_listbox .scatter
${ddlChartTypeScatterLine}          jquery=#ChartType_listbox .scatter_stack
${ddlChartTypeScatterMultiAxis}     jquery=#ChartType_listbox .scatter_multi
${ddlChartTypeGauge}                jquery=#ChartType_listbox .gauge

*** Keywords ***
Change Chart To Area
    Select Dropdown By Selector    ${ddlChartType}    ${ddlChartTypeAreaCluster}

Change Chart To Bar Cluster
    Select Dropdown By Selector    ${ddlChartType}    ${ddlChartTypeBarCluster}

Change Chart To Bubble
    Select Dropdown By Selector    ${ddlChartType}    ${ddlChartTypeBubble}

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

Change Chart To Scatter
    Select Dropdown By Selector    ${ddlChartType}    ${ddlChartTypeScatter}

Change Chart To Scatter Multi Axis
    Select Dropdown By Selector    ${ddlChartType}    ${ddlChartTypeScatterMultiAxis}

Change Chart To Gauge
    Select Dropdown By Selector    ${ddlChartType}    ${ddlChartTypeGauge}
