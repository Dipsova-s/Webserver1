*** Variables ***
${gridAngleListDisplay}             AngleGrid
${tblAngleHeaderListDisplay}        AngleGrid .k-grid-header-wrap table
${tblAngleContentListDisplay}       AngleGrid .k-virtual-scrollable-wrap table
${btnAddColumnToListDisplay}        AddNewColumn
${pgbListDisplay}                   css=#AngleGrid .k-loading-mask
${btnSortAscendingToList}           jquery=.HeaderPopup .sortAsc:visible
${btnSortDescendingToList}          jquery=.HeaderPopup .sortDesc:visible
${btnSortCustomToList}              jquery=.HeaderPopup .sortCustom:visible
${btnCreateChartFromList}           jquery=.HeaderPopup .createChart:visible
${btnCreatePivotFromList}           jquery=.HeaderPopup .createPivot:visible
${btnAddColumnFromList}             jquery=.HeaderPopup .addColumn:visible
${btnRemoveColumnFromList}          jquery=.HeaderPopup .removeColumn:visible
${btnAddFilterToList}               jquery=.HeaderPopup .addFilter:visible
${btnFieldInfo}                     jquery=.HeaderPopup .fieldInfo:visible

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
${txtFieldName}                     jquery=#AliasName
${K Unit}                           :nth-child(2)
${M Unit}                           :nth-child(3)
${chkUseAsDefaultFormate}           css=#UseAsDefaultFormat

# angle context menu [Drilldown to item, Quick Filter, Copy]
${angleContextMenu}                 jquery=#angleContextMenu
${drillDownToItem}                  jquery=#angleContextMenu > li[name=drilldown]
${quickFilter}                      jquery=#angleContextMenu > li[name=filter]
${gotoSAP}                          jquery=#angleContextMenu > li[name=gotosap]
${copy}                             jquery=#angleContextMenu > li[name=copy]
${activeContextMenuList}            jquery=ul.context-menu.hover
${activeContextMenuListItems}       jquery=ul.context-menu.hover > li

*** Keywords ***
Wait Until List Display Loaded
    Wait Until Page Does Not Contain Element    ${pgbListDisplay}
    Wait Until Ajax Complete

Click Add New Column To List
    Wait Until List Display Loaded
    Click Element    ${btnAddColumnToListDisplay}
    Wait Until Field Chooser Loaded

Add New Column Should Be Visible
    Element Should Be Visible    ${btnAddColumnToListDisplay}

Add New Column Should Not Be Visible
    Element Should Not Be Visible    ${btnAddColumnToListDisplay}

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

Click Sort Custom From List Header Column
    Click Element    ${btnSortCustomToList}

Click Show Add Filter Popup From List Header Column
    Wait Until Element Is Visible    ${btnAddFilterToList}
    Click Element   ${btnAddFilterToList}

Click Show Field Info From List Header
    Click Element    ${btnFieldInfo}
    Wait Until Help Text Popup Loaded

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

Click OK Button On Field Format Popup
    Click Element    ${formatOKButton} 
    Sleep    ${TIMEOUT_LARGEST}    Wait format field applied

Click Remove Column From Header Column
    Click Element   ${btnRemoveColumnFromList}
    Wait Until List Display Loaded

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
    Open Context Menu    jquery=#AngleGrid > div.k-grid-content > div.k-virtual-scrollable-wrap > table > tbody > tr:nth-child(1) > td:eq(${index})

Click Row Cell By Column index
    [Arguments]    ${fieldId}    ${rowNumber}
    ${columnIndex}    Find Column Index By Field Name   ${fieldId}
    Open Context Menu    jquery=#AngleGrid > div.k-grid-content > div.k-virtual-scrollable-wrap > table > tbody > tr:nth-child(${rowNumber}) > td:eq(${columnIndex})

Select Quick Filter Options
    Wait Until Element Is Visible   ${angleContextMenu}
    Click Element   ${quickFilter}

Select Goto SAP Option
    Wait Until Element Is Visible   ${angleContextMenu}
    Click Element   ${gotoSAP}
    Wait Until Element Is Visible    ${activeContextMenuList}
    Wait Until Ajax Complete

Get Active Context Menu List Items
    Wait Until Element Is Visible   ${activeContextMenuList}
    ${totalElements}    Get Element Count    ${activeContextMenuListItems}
    ${list}   Create List
    : FOR    ${index}    IN RANGE    0    ${totalElements}
    \   ${selector}    Get JQuery Selector    ${activeContextMenuListItems}
    \   ${menuLabel}    Execute Javascript    return $("${selector}:eq(${index})").text()
    \   Append To List    ${list}   ${menuLabel}
    \   Log    ${list}
    [Return]    ${list}

Active Context Menu Should Contain Match
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
    ${columns}    Get Element Count    jquery=#${tblAngleHeaderListDisplay} th.k-header
    [Return]    ${columns}

Get List Columns Count With No Warning
    ${columns}    Get Element Count    jquery=#${tblAngleHeaderListDisplay} th.k-header:not(.validError,.deny,.denyPartial)
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
    Wait Until Drilldown Item Loaded

Wait Until Drilldown Item Loaded
    Wait Progress Bar Closed
    Wait Until Ajax Complete

Click Show Menu In List Display Cell By Name
    [Arguments]    ${name}
    Sleep    ${TIMEOUT_LARGEST}
    Open Context Menu    ${tdCellInListDisplay}:contains("${name}")
    Sleep    ${TIMEOUT_LARGEST}
    Execute Javascript    $('.k-grid-tooltip').hide()

Click Drilldown To Item By Name
    [Arguments]    ${name}
    Click Show Menu In List Display Cell By Name    ${name}
    Click Drildown To Item In Menu

Select Filter "${CheckboxId}" On Drilldown To Item
    Select Checkbox   ${CheckboxId}
    Wait Until Drilldown Item Loaded

Unselect Filter "${CheckboxId}" On Drilldown To Item
    Unselect Checkbox   ${CheckboxId}
    Wait Until Drilldown Item Loaded

Input Field Name
    [Arguments]    ${fieldName}
    Wait Until Element Is Visible    ${txtFieldName}
    Input Text    ${txtFieldName}    ${fieldName}

Click CheckBox Set As Default For Field 
    Select Checkbox    ${chkUseAsDefaultFormate}