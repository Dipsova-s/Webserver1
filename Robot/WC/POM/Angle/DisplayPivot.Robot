*** Variables ***
${divPivotScollBarVertical}         pivotGrid_VSBCCell_SCVPDiv
${divPivotScollBarHorizontal}       pivotGrid_HSBCCell_SCVPDiv
${grandTotal}                       pivotGrid_DCSCell_SCDTable .lastHorzCell.lastVertCell.dxpgGrandTotalCell
${divPivotScollBarVerticalSize}     pivotGrid_VSBCCell_SCSDiv
${divPivotScollBarHorizontalSize}   pivotGrid_HSBCCell_SCSDiv
${pgbPivotLoading}                  pivotGrid_LPV
${pgbPivotDisplay}                  jquery=#PivotMainWrapper .pivotAreaContainer .k-loading-mask
${tdPivotHeaderRow}                 jquery=#pivotGrid_ACCRowArea .dxpgHeaderText
${tdPivotHeaderColumn}              jquery=#pivotGrid_ColumnArea .dxpgHeaderText
${tdPivotHeaderData}                jquery=#pivotGrid_ACCDataArea .dxpgHeaderText
${tdPivotDateSampleCell}            pivotGrid_R4
${tdPivotNumberSampleCell}          pivotGrid_C1
${tdPivotSetSampleCell}             pivotGrid_R0
${iconOpenElement}                  css=.domainIcon.icon-executionstatuses0ToBeExecuted
${cssOpenElement}                   css=#css-icon-executionstatuses0ToBeExecuted
${tdSubtotal}                       css=#pivotGrid_DCSCell_SCDTable .dxpgTotalCell
${tdPercentage}                     css=#pivotGrid_DCSCell_SCDTable .PercentageSummaryCell
${tdPivotSortSummaryCell}           pivotGrid_C2
${ddlPivotSortField}                PivotCustomSortField1_ddlWrapper
${btnSubmitSortBySummary}           btn-PivotCustomSortPopup1

${pivotResultTable}                     pivotGrid_DCSCell_SCDTable
${pivotGrandTotalCell}                  .dxpgGrandTotalCell
${pivotTotalCellPercentageSummary}      .PercentageSummaryCell
${pivotLastVeticalCell}                 .lastVertCell
${tdNoneValue}                      jquery=.dxpgRowFieldValue:contains(None (None)) .dxpgCollapsedButton

${defaultLayout}                    {\"collapse\":\"+////wAAAAABAAAAAAAAABppbmRpdmlkdWFsX2V4ZWN1dGlvbnN0YXR1c1pTeXN0ZW0uT2JqZWN0LCBtc2NvcmxpYiwgVmVyc2lvbj00LjAuMC4wLCBDdWx0dXJlPW5ldXRyYWwsIFB1YmxpY0tleVRva2VuPWI3N2E1YzU2MTkzNGUwODlaU3lzdGVtLk9iamVjdCwgbXNjb3JsaWIsIFZlcnNpb249NC4wLjAuMCwgQ3VsdHVyZT1uZXV0cmFsLCBQdWJsaWNLZXlUb2tlbj1iNzdhNWM1NjE5MzRlMDg5Afv///8AAAAAAQAAAAAAAAAZaW5kaXZpZHVhbF9ib3R0bGVuZWNrdHlwZVpTeXN0ZW0uT2JqZWN0LCBtc2NvcmxpYiwgVmVyc2lvbj00LjAuMC4wLCBDdWx0dXJlPW5ldXRyYWwsIFB1YmxpY0tleVRva2VuPWI3N2E1YzU2MTkzNGUwODlaU3lzdGVtLk9iamVjdCwgbXNjb3JsaWIsIFZlcnNpb249NC4wLjAuMCwgQ3VsdHVyZT1uZXV0cmFsLCBQdWJsaWNLZXlUb2tlbj1iNzdhNWM1NjE5MzRlMDg5AQ==\"}

*** Keywords ***
Wait Until Pivot Display Loaded
    Wait Until Field Settings Loaded
    Wait Until Ajax Complete
    Sleep  ${TIMEOUT_LARGEST}
    Wait Until Ajax Complete
    Wait Until Page Does Not Contain Element     ${pgbPivotLoading}
    Wait Until Page Does Not Contain Element     ${pgbPivotDisplay}

Pivot Scroll Vertical
    [Arguments]    ${scrollTop}
    Scroll Vertical    ${divPivotScollBarVertical}    ${scrollTop}
    Wait Until Ajax Complete

Pivot Scroll Horizontal
    [Arguments]    ${scrollLeft}
    Scroll Horizontal    ${divPivotScollBarHorizontal}    ${scrollLeft}
    Wait Until Ajax Complete

Pivot Scroll To Grand Total
    ${tableHeight}     Execute Javascript    return $('#${divPivotScollBarVerticalSize}').height();
    Pivot Scroll Vertical    ${tableHeight}
    ${tableWidth}     Execute Javascript    return $('#${divPivotScollBarHorizontalSize}').width();
    Pivot Scroll Horizontal    ${tableWidth}
    Wait Until Pivot Display Loaded
    Wait Until Page Contains Element    jquery=#${grandTotal}
    Wait Until Element Is Visible    jquery=#${grandTotal}

Get Grand Total
    Pivot Scroll To Grand Total
    ${groundTotalValue}    Execute Javascript    return parseFloat($('#${grandTotal}').text())
    Pivot Scroll Vertical    0
    Pivot Scroll Horizontal    0
    [return]    ${groundTotalValue}

Get Pivot Cell Value Before Grand Total Cell
    [Arguments]    ${index}
    Pivot Scroll To Grand Total
    ${cellValue}    Execute Javascript    return parseFloat($('#${grandTotal}').prevAll().eq(${index}).text())
    [return]    ${cellValue}

Get Pivot Above Grand Total Cell Value By Index
    [Arguments]    ${negativeIndex}
    ${cellValue}    Execute Javascript    return parseFloat($('#${grandTotal}').parent().siblings().eq(${negativeIndex}).children().last().text())
    [return]    ${cellValue}

Drilldown Pivot Cell Value Before Grand Total Cell
    [Arguments]    ${index}
    Pivot Scroll To Grand Total
    Execute Javascript    $('#${grandTotal}').prevAll().eq(${index}).click()
    Wait Progress Bar Closed

Drilldown Pivot Above Grand Total Cell
    [Arguments]    ${negativeIndex}
    Pivot Scroll To Grand Total
    Execute Javascript    $('#${grandTotal}').parent().siblings().eq(${negativeIndex}).children().last().click()
    Wait Progress Bar Closed

Drilldown Pivot Total Cell Value By Row Index
    [Arguments]    ${row}
    Click Element   jquery=#${pivotResultTable} tr:eq(${row}) ${pivotGrandTotalCell}:eq(0)
    Wait Progress Bar Closed

First Column Header Should Have New Line
    Page Should Contain Element    ${tdPivotHeaderColumn}:eq(0) br

First Column Header Should No New Line
    Page Should Not Contain Element    ${tdPivotHeaderColumn}:eq(0) br

First Row Header Should Have New Line
    Page Should Contain Element    ${tdPivotHeaderRow}:eq(0) br

First Row Header Should No New Line
    Page Should Not Contain Element    ${tdPivotHeaderRow}:eq(0) br

First Data Header Should Have New Line
    Page Should Contain Element    ${tdPivotHeaderData}:eq(0) br

Second Data Header Should Have New Line
    Page Should Contain Element    ${tdPivotHeaderData}:eq(1) br

Subtotal Should Be Displayed In Pivot
    Page Should Contain Element    ${tdSubtotal}

Percentages Should Be Displayed In Pivot
    Page Should Contain Element    ${tdPercentage}

Get Sample Date Bucket Text
    ${text}    Get Text    ${tdPivotDateSampleCell}
    [Return]    ${text}

Get Sample Number Bucket Text
    ${text}    Get Text    ${tdPivotNumberSampleCell}
    [Return]    ${text}

Get Sample Set Bucket Text
    ${text}    Get Text    ${tdPivotSetSampleCell}
    [Return]    ${text}

Get Pivot Cell Value By Column Index And Row Index
    [Arguments]    ${row}    ${column}
    ${cellValue}    Execute Javascript    return parseFloat($('#${pivotResultTable} tr:eq(${row}) td:eq(${column})').text()).toFixed(2)
    [return]    ${cellValue}

Get Pivot Total Cell Value By Row Index
    [Arguments]    ${row}
    ${cellValue}    Execute Javascript    return parseFloat($('#${pivotResultTable} tr:eq(${row}) ${pivotGrandTotalCell}:eq(0)').text()).toFixed(2)
    [return]    ${cellValue}

Get Pivot Total Cell Value By Column Index
    [Arguments]    ${column}
    ${cellValue}    Execute Javascript    return parseFloat($('#${pivotResultTable} ${pivotLastVeticalCell}:eq(${column})').text()).toFixed(2)
    [return]    ${cellValue}

Get Pivot Count Grand Total Cell Value
    Pivot Scroll To Grand Total
    ${cellValue}    Execute Javascript    return parseFloat($('#${grandTotal}').prev().text()).toFixed(2)
    [return]    ${cellValue}

Get Pivot Percentages Summary Cell Value By Row Index And Column Index
    [Arguments]    ${row}    ${column}
    ${cellValue}    Execute Javascript    return $.trim($('#${pivotResultTable} tr:eq(${row}) ${pivotTotalCellPercentageSummary}:eq(${column})').text())
    [return]    ${cellValue}

Pivot Should Have Field Icons
    Wait Until Page Contains Element    ${iconOpenElement}
    Wait Until Page Contains Element    ${cssOpenElement}

Get Pivot Layout
    ${layout}    Execute Javascript    return pivotPageHandler.FieldSettings.Layout
    [return]    ${layout}

Pivot Should Store A Default Collapse State
    ${layout}    Get Pivot Layout
    Should Be Equal    ${layout}    ${defaultLayout}

Click Collapse/Expand Pivot Cell
    [Arguments]   ${cell}
    Click Element    ${cell}
    Sleep    ${TIMEOUT_GENERAL}
    Wait Until Pivot Display Loaded

Click Collapse Pivot Cell
    [Arguments]   ${cell}
    ${isExpanded}    Is Element Has CssClass   ${cell}    dxPivotGrid_pgExpandedButton
    Run Keyword If   ${isExpanded}   Click Collapse/Expand Pivot Cell  ${cell}

Click Expand Pivot Cell
    [Arguments]   ${cell}
    ${isCollapsed}    Is Element Has CssClass   ${cell}    dxPivotGrid_pgCollapsedButton
    Run Keyword If   ${isCollapsed}   Click Collapse/Expand Pivot Cell  ${cell}

Click Collapse "None" Value
    Click Collapse Pivot Cell    ${tdNoneValue}

Pivot Should Update A Collapse State
    ${layout}    Get Pivot Layout
    Should Not Be Equal    ${layout}    ${defaultLayout}

Click Sort By Summary Test Cell
    Click Element    ${tdPivotSortSummaryCell}

Select Sort By Summary Test Option
    Select Dropdown By Text    ${ddlPivotSortField}    Descending

Submit Sort By Summary
    Click Element    ${btnSubmitSortBySummary}
    Sleep    ${TIMEOUT_GENERAL}
    Wait Until Pivot Display Loaded

Get Sort Summary Test Data
    ${data}   Execute JavaScript    return $.map($('#${pivotResultTable} tr:lt(5)').find('td:first'), function(element) { return parseInt($(element).text()); });
    [return]    ${data}
    