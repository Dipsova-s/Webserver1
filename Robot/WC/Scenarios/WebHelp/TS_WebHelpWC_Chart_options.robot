*** Keywords ***
Screenshot "WC_Chart_options" page
    ${AngleId}    Set Variable    WEBHELP_WC_Chart_options

    Find Angle By ID Then Execute The First Angle    ${AngleId}

    Crop Chart Type

    Click Show Display Option
    Crop Chart Options
    Click Hide Display Option

    Crop Chart Data Field Area
    Crop Chart Sort Icon

    Set Window Size    1000   700
    Sleep    ${TIMEOUT_LARGEST}
    
    Crop Chart Display
    Crop Chart Navigator

    Maximize Browser window
    Sleep    ${TIMEOUT_LARGEST}

Crop Chart Type
    ${left}    ${top}    Get Element Offset  css=#ChartType_ddlWrapper
    Click Element    css=#ChartType_ddlWrapper
    Crop WebHelp Image With Dimensions   WC_chart_types.png  css=body  ${left}  ${top}  195  425
    Click Element    css=#ChartType_ddlWrapper

Crop Chart Options
    ${width}    ${height}    Get Element Size    css=#PopupChartOptions
    Crop WebHelp Image With Dimensions  WC_ChartBucket.png  css=#ChartMainWrapper  0  0  725  570

Crop Chart Data Field Area
    Mouse Over   jquery=#FieldListDataArea .fieldListAreaBody li:eq(1)
    Crop WebHelp Image With Dimensions  WC_y_axis.png  css=#FieldListDataArea  0  0  385  95

Crop Chart Display
    ${width}   ${height}    Get Element Size   css=#chart
    Crop WebHelp Image With Dimensions  WC_chart_dr.png  css=#chart   0  5   ${width}   ${height - 5}

Crop Chart Sort Icon
    Mouse Over   jquery=#FieldListDataArea .fieldListAreaBody li:eq(1)
    Crop WebHelp Image  WC_Icon_Sort.png  jquery=#FieldListDataArea .fieldListAreaBody li:eq(1) .btnSort   ${False}

Crop Chart Navigator
    ${dragWidth}   ${dragHeight}    Get Element Size   css=#ChartWrapper .navigator
    Crop WebHelp Image With Dimensions  WC_zoombar_drag.png  css=#ChartWrapper .navigator  2  2  ${dragWidth - 2}  ${dragHeight - 2}    ${False}

    Close Chart Navigator
    ${buttonWidth}   ${buttonHeight}    Get Element Size   css=#ChartWrapper .toggleButton
    Crop WebHelp Image With Dimensions  WC_zoombar_Icon.png  css=#ChartWrapper .toggleButton  ${buttonWidth / 2 - 5}  0  12  10   ${False}