*** Keywords ***
Screenshot "WC_Pivot_options" page
    ${AngleId}    Set Variable    WEBHELP_WC_Pivot_options

    Find Angle By ID Then Execute The First Angle    ${AngleId}
    Click Display Tab

    Crop Pivot Display    WC_pivot_example_2.png

    Click Expand Pivot Cell   css=#pivotGrid_R3 .dxpgCollapsedButton
    Crop Pivot Display    WC_pivot_example.png

    Crop Pivot Options

Crop Pivot Display
    [Arguments]   ${filename}
    ${widthDataField}     ${heightDataField}     Get Element Size    css=#pivotGrid_ACCDataArea
    ${widthColumnHeader}  ${heightColumnHeader}  Get Element size    css=#pivotGrid_CVSCell_SCDTable
    ${widthDataArea1}     ${heightDataArea1}     Get Element Size    css=#pivotGrid_DCSCell_SCDTable
    ${widthDataArea2}     ${heightDataArea2}     Get Element Size    css=#pivotGrid_DCSCell_SCVPDiv
    ${widthDataArea}  Evaluate  min(${widthDataArea1},${widthDataArea2})
    ${heightDataArea}  Evaluate  min(${heightDataArea1},${heightDataArea2})
    ${width}    Evaluate   ${widthDataField}+${widthDataArea}
    ${height}   Evaluate   ${heightDataField}+${heightColumnHeader}+${heightDataArea}
    Crop WebHelp Image With Dimensions  ${filename}  css=#pivotGrid  0  5  ${width + 10}  ${height + 10}

Crop Pivot Options
    Click Show Display Option
    ${left}  ${top}   Get Element OffSet   css=.section-aggregation .action-options
    ${width}  ${height}   Get Element Size   css=.aggregation-options-popup
    Crop WebHelp Image With Dimensions  WC_pivot_options.png  css=body  ${left - 5}  ${top - 10}  ${width + 35}  ${height + 5}