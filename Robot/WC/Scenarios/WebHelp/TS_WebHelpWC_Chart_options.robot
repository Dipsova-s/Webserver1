*** Keywords ***
Screenshot "WC_Chart_options" page
    ${AngleId}    Set Variable    WEBHELP_WC_Chart_options

    Find Angle By ID Then Execute The First Angle    ${AngleId}
    Click Display Tab
 
    Crop Chart Option Button
    Crop Chart Type
    Crop Checkbox Blue Checked 
    Crop Checkbox Unchecked
    Crop Sort Icons
    Crop Reference line Icon
    Crop Format Icon
    Crop Format Field Popup
    Crop Thousands separator checkbox
    Crop Apply Chart Button
    Crop Undo Button in chart options

    Resize WebHelp Window    1000   700
    Crop Chart Navigator
    Maximize WebHelp Window

Crop Chart Type
    ${left}    ${top}    Get Element Offset  css=.k-widget.chart-type
    ${width}    ${height}    Get Element Size  css=.k-widget.chart-type
    Click Element    css=.k-widget.chart-type
    Crop WebHelp Image With Dimensions   WC_chart_types.png  css=body  ${left}  ${top}  ${width}  ${height*11}
    Click Element    css=.k-widget.chart-type

Crop Chart Option Button
    Crop WebHelp Image  WC_Icon_ChartOptions.png  css=.section-aggregation .action-options  ${False}
    
Crop Checkbox Blue Checked 
    Scroll Element into View  jquery=.query-aggregation-data .count-field-wrapper
    Select Checkbox  jquery=.query-aggregation-data .count-field-wrapper input
    Crop WebHelp Image With Dimensions  WC_checkbox_blue_checked.png  jquery=.query-aggregation-data .count-field-wrapper  0    0   17    17  ${False}

Crop Checkbox Unchecked
    Scroll Element into View  jquery=.query-aggregation-data .count-field-wrapper
    Unselect Checkbox  jquery=.query-aggregation-data .count-field-wrapper input
    Crop WebHelp Image With Dimensions  WC_checkbox_unchecked.png  jquery=.query-aggregation-data .count-field-wrapper  0    0   17    17  ${False}

Crop Sort Icons
    Click Field In Data Area By Field Index  1
    Click Element  jquery=.query-aggregation-data .item-aggregation:eq(1) .action-sorting
    Crop WebHelp Image  WC_Icon_Sort_Descending.png  jquery=.query-aggregation-data .item-aggregation:eq(1) .action-sorting   ${False}

    Click Field In Data Area By Field Index  1
    Click Element  jquery=.query-aggregation-data .item-aggregation:eq(1) .action-sorting
    Crop WebHelp Image  WC_Icon_Sort_Ascending.png  jquery=.query-aggregation-data .item-aggregation:eq(1) .action-sorting   ${False}

    Click Undo field Settings

Crop Format Icon
    Click Field In Data Area By Field Index  1
    Crop WebHelp Image  WC_Icon_FormatField.png  jquery=.query-aggregation-data .item-aggregation:eq(1) .action-format   ${False}

Crop Format Field Popup
    Click Field In Data Area By Field Index  1
    Click Show Field Format For Field Settings
    Update Popup Position  css=.aggregation-format-popup
    Crop WebHelp Image  WC_Format_Field.png  css=.aggregation-format-popup
    Close Field Format

Crop Thousands separator checkbox
    Click Field In Data Area By Field Index  1
    Click Show Field Format For Field Settings
    Update Popup Position  css=.aggregation-format-popup
    Crop WebHelp Image With Dimensions  WC_ThousandsSeparator_checkbox.png  jquery=.aggregation-format-popup .row-thousandseparator .form-col-body .chk-indeterminatable-wrapper .chkIndeterminatable   0    0   16    16    ${False}
    Close Field Format

Crop Reference line Icon
    Click Field In Data Area By Field Index  1
    Crop WebHelp Image  WC_Icon_Reference_Line.png  jquery=.query-aggregation-data .item-aggregation:eq(1) .action-reference-line   ${False}

Crop Apply Chart Button
    Scroll Element into View   jquery=.section-aggregation .btn-save
    Crop WebHelp Image  WC_Button_Apply_Inactive.png  jquery=.section-aggregation .btn-save
    Change Chart To Column Cluster
    Scroll Element into View   jquery=.section-aggregation .btn-save
    Crop WebHelp Image  WC_Button_Apply_Active.png  jquery=.section-aggregation .btn-save
    Click Undo field Settings

Crop Undo Button in chart options
    Change Chart To Column Cluster
    Crop WebHelp Image With Dimensions    WC_Button_Undo.png   jquery=.accordion-toolbar .icon-undo    3   3   14   15    ${False}
    Click Undo field Settings

Crop Chart Navigator
    ${dragWidth}   ${dragHeight}    Get Element Size   css=#ChartWrapper .navigator
    Crop WebHelp Image With Dimensions  WC_zoombar_drag.png  css=#ChartWrapper .navigator  2  2  ${dragWidth - 2}  ${dragHeight - 2}    ${False}

    Close Chart Navigator
    ${buttonWidth}   ${buttonHeight}    Get Element Size   css=#ChartWrapper .toggleButton
    Crop WebHelp Image With Dimensions  WC_zoombar_Icon.png  css=#ChartWrapper .toggleButton  ${buttonWidth / 2 - 5}  0  12  10   ${False}