*** Keywords ***
Screenshot "WC_Pivot_options" page
    ${AngleId}    Set Variable    WEBHELP_WC_Pivot_options

    Find Angle By ID Then Execute The First Angle    ${AngleId}

    Crop Pivot Display    WC_pivot_example_2.png

    Click Expand Pivot Cell   css=#pivotGrid_R3 .dxpgCollapsedButton
    Crop Pivot Display    WC_pivot_example.png

    Click Show Display Option
    Crop Pivot Options

    Click Field In Row Area By Field Index   0
    Crop Pivot Field Options

Crop Pivot Display
    [Arguments]   ${filename}
    ${widthDataField}     ${heightDataField}     Get Element Size    css=#pivotGrid_ACCDataArea
    ${widthColumnHeader}  ${heightColumnHeader}  Get Element size    css=#pivotGrid_CVSCell_SCDTable
    ${widthDataArea}      ${heightDataArea}      Get Element Size    css=#pivotGrid_DCSCell_SCDTable
    ${width}    Evaluate   ${widthDataField}+${widthDataArea}
    ${height}   Evaluate   ${heightDataField}+${heightColumnHeader}+${heightDataArea}
    Crop WebHelp Image With Dimensions  ${filename}  css=#pivotGrid  0  5  ${width + 10}  ${height + 10}

Crop Pivot Options
    ${popupWidth}  ${popupHeight}   Get Element Size   css=#PopupChartOptions
    Crop WebHelp Image With Dimensions  WC_pivot_options.png  css=#AngleTableWrapper  290  5  ${popupWidth + 115}  ${popupHeight + 10}

Crop Pivot Field Options
    Crop WebHelp Image  WC_pivot_display_options.png  jquery=.HeaderPopupField:visible