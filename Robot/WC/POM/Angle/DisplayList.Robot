*** Variables ***
${gridAngleListDisplay}             AngleGrid
${tblAngleHeaderListDisplay}        AngleGrid .k-grid-header-wrap table
${tblAngleContentListDisplay}       AngleGrid .k-virtual-scrollable-wrap table
${btnAddColumnToListDisplay}        AddNewColumn
${pgbListDisplay}                   css=#AngleGrid .k-loading-mask
${btnSortAscendingToList}           jquery=.HeaderPopup .sortAsc:visible
${btnSortDescendingToList}          jquery=.HeaderPopup .sortDesc:visible
${btnAddFilterToList}               jquery=.HeaderPopup .addFilter:visible
${btnCreateChartFromList}           jquery=.HeaderPopup .createChart:visible
${btnCreatePivotFromList}           jquery=.HeaderPopup .createPivot:visible
${btnRemoveColumnFromList}          jquery=.HeaderPopup .removeColumn:visible

${headerLastColumn}                 jquery=#AngleGrid .k-grid-header-wrap table th.k-header:last

${tdCellInListDisplay}              jquery=td
${btnCreateDrilldownToItem}         css=li[name=drilldown]

# format field
${btnFormatfield}                   jquery=.HeaderPopup .fieldFormat:visible
${formatPopup}                      jquery=.listFormatSettingPopup
${displayUnitsDropDown}             jquery=#FormatDisplayUnitSelect_ddlWrapper > span
${ddlDisplayUnitsList}              jquery=#FormatDisplayUnitSelect_listbox >li
${ddlDecimalsList}                  jquery=#FormatDecimalSelect_listbox >li
${decimalsDropDown}                 jquery=#FormatDecimalSelect_ddlWrapper > span
${twoDecimalsOption}                :nth-child(3)
${formatOKButton}                   jquery=#btn-PopupListFormatSetting1
${K Unit}                           :nth-child(2)
${M Unit}                           :nth-child(3)

# angle context menu [Drilldown to item, Quick Filter, Copy]
${angleContextMenu}                 jquery=#angleContextMenu
${drillDownToItem}                  jquery=#angleContextMenu > li[name=drilldown]
${quickFilter}                      jquery=#angleContextMenu > li[name=filter]
${copy}                             jquery=#angleContextMenu > li[name=copy]
${quickFilterList}                  jquery=ul.context-menu-list.hover
${quickFilterOptionList}            jquery=ul.context-menu-list.hover > li

*** Keywords ***
Wait Until List Display Loaded
    Wait Until Page Does Not Contain Element    ${pgbListDisplay}
    Wait Until Ajax Complete

Click Add New Column To List
    Wait Until List Display Loaded
    Click Element    ${btnAddColumnToListDisplay}
    Wait Until Ajax Complete

Click Header by Data Field Angle Grid List Display
    [Arguments]   ${datafield}
    Sleep    ${TIMEOUT_GENERAL}    Make sure it work
    Click Element   jquery=#${tblAngleHeaderListDisplay} th.k-header[data-field="${datafield}"] .handler
    Sleep    ${TIMEOUT_GENERAL}    Make sure it work

Click Sort Ascending From Head Column to List
    Click Element   ${btnSortAscendingToList}
    Wait Progress Bar Closed
    Wait Until List Display Loaded
    Sleep    ${TIMEOUT_GENERAL}

Click Sort Descending From Head Column to List
    Click Element   ${btnSortDescendingToList}
    Wait Progress Bar Closed
    Wait Until List Display Loaded
    Sleep    ${TIMEOUT_GENERAL}

Click Show Add Filter Popup From List Header Column
    Wait Until Element Is Visible    ${btnAddFilterToList}
    Click Element   ${btnAddFilterToList}

Click Create Chart From Header Column
    Click Element   ${btnCreateChartFromList}
    Wait Progress Bar Closed
    Wait Until Chart Display Loaded

Click Create Pivot From Header Column
    Click Element   ${btnCreatePivotFromList}
    Wait Progress Bar Closed
    Wait Until Pivot Display Loaded

Click Format Field From Header Column
    Click Element   ${btnFormatfield}
    Wait Until Element Is visible  ${formatPopup}

Open Display Units Drop Down
    Click Element   ${displayUnitsDropDown}

Select Display Unit From Display Units Dropdown
    [Arguments]  ${displayUnitItem}
    Select Dropdown By Selector    ${displayUnitsDropDown}  ${displayUnitItem}

Select K Unit
    Select Display Unit From Display Units Dropdown    ${ddlDisplayUnitsList}${K Unit}

Select M Unit
    Select Display Unit From Display Units Dropdown    ${ddlDisplayUnitsList}${M Unit}

Open Decimals Drop Down
    Click Element   ${decimalsDropDown}

Select Decimals From Decimals Dropdown
    [Arguments]  ${selectedDecimals}
    Select Dropdown By Selector    ${decimalsDropDown}    ${selectedDecimals}

Select Two Decimals
    Select Decimals From Decimals Dropdown    ${ddlDecimalsList}${twoDecimalsOption}

Click Submit List Field Format
    Click Element   ${formatOKButton}
    Sleep    ${TIMEOUT_LARGEST}    Wait format to be applied

Find Column Index By Field Name
    [Arguments]    ${fieldId}
    ${index}    Execute Javascript    return $('#AngleGrid > div.k-grid-header > div.k-grid-header-wrap > table > thead > tr > th[data-field="${fieldId}"]').index()
    [Return]    ${index}

Click First Row Cell By Column index
    [Arguments]    ${fieldId}
    ${index}    Find Column Index By Field Name   ${fieldId}
    Click Element    jquery=#AngleGrid > div.k-grid-content > div.k-virtual-scrollable-wrap > table > tbody > tr:nth-child(1) > td:eq(${index})


Select Quick Filter Options
    Wait Until Element Is Visible   ${angleContextMenu}
    Click Element   ${quickFilter}

Collect Quick Filter Options
    Wait Until Element Is Visible   ${quickFilterList}
    ${count}    Get Elements Count    ${quickFilterOptionList}
    ${quickFilterOptions}   Create List
    : FOR    ${index}    IN RANGE    0    ${count}
    \   ${txt}    Execute Javascript    return $("ul.context-menu-list.hover > li:eq(${index})").text()
    \   Append To List    ${quickFilterOptions}   ${txt}
    \   Log    ${quickFilterOptions}
    [Return]    ${quickFilterOptions}

Quick Filter Options Should Contain Match
    [Arguments]    ${list}    ${match}
    Should Contain Match    ${list}    regexp=${match}    msg=None


Scroll To Angle Grid Header List Display
    [Arguments]   ${fieldId}
    Scroll Grid Horizontal By Field Id    ${gridAngleListDisplay}    ${fieldId}
    Wait Until Element Is Visible    jquery=#${tblAngleHeaderListDisplay} th.k-header[data-field="${fieldId}"]
    Wait Until List Display Loaded
    Sleep    ${TIMEOUT_LARGEST}

Get Cell Value From List Display
    [Arguments]    ${fieldId}    ${fieldType}=text
    ${lengthexpect} =     Get Element Index     jquery=#${tblAngleHeaderListDisplay} th.k-header[data-field="${fieldId}"]
    ${text} =    Get Table Cell    css=#${tblAngleContentListDisplay}     1     ${lengthexpect + 1}
    ${cellSelector} =    Get JQuery Selector    jquery=#${tblAngleContentListDisplay} tr:eq(0) td:eq(${lengthexpect})
    ${value} =    Execute Javascript    return $.inArray('${fieldType}', ['number', 'currency', 'period', 'percentage']) != -1 ? parseFloat($.trim('${text}') || 0) : ('${fieldType}' == 'boolean' && $('${cellSelector} :checkbox').length ? $('${cellSelector} :checkbox').is(':checked') : '${text}')
    [Return]    ${value}

Get List Columns Count
    ${columns}    Get Elements Count    jquery=#${tblAngleHeaderListDisplay} th.k-header
    [Return]    ${columns}

Get List Columns Count With No Warning
    ${columns}    Get Elements Count    jquery=#${tblAngleHeaderListDisplay} th.k-header:not(.validError,.deny,.denyPartial)
    [Return]    ${columns}

Move List Column By Index
    [Arguments]    ${sourceColumnIndex}    ${targetColumnIndex}
    Drag And Drop    jquery=#${tblAngleHeaderListDisplay} th.k-header:eq(${sourceColumnIndex})    jquery=#${tblAngleHeaderListDisplay} th.k-header:eq(${targetColumnIndex})
    Wait Until List Display Loaded

Get List First Column Name
    ${name}    Get Text    jquery=#${tblAngleHeaderListDisplay} th.k-header:eq(0) .property
    [return]    ${name}

List Columns Should Be Equal To
    [Arguments]    ${count}
    ${columnCount}    Get List Columns Count With No Warning
    Should Be True    ${columnCount}==${count}

First List Column Should Be
    [Arguments]    ${fieldName}
    ${firstColumnName}    Get List First Column Name
    Should Contain    ${firstColumnName}    ${fieldName}

Click Drildown To Item In Menu
    Wait Until Element Is Visible   ${btnCreateDrilldownToItem}
    Click Element   ${btnCreateDrilldownToItem}
    Wait Progress Bar Closed
    Wait Until Ajax Complete

Click Show Menu In List Display Cell By Name
    [Arguments]    ${name}
    Sleep    ${TIMEOUT_LARGEST}
    Click Element    ${tdCellInListDisplay}:contains("${name}")
    Sleep    ${TIMEOUT_LARGEST}
    Execute Javascript    $('.k-grid-tooltip').hide()

Click Drilldown To Item By Name
    [Arguments]    ${name}
    Click Show Menu In List Display Cell By Name    ${name}
    Click Drildown To Item In Menu
