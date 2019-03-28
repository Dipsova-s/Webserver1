*** Settings ***
Resource            ${EXECDIR}/WC/POM/Angle/FieldSettings.ChartTypes.Robot
Resource            ${EXECDIR}/WC/POM/Angle/FieldSettings.ChartOptions.Robot
Resource            ${EXECDIR}/WC/POM/Angle/FieldSettings.PivotOptions.Robot
Resource            ${EXECDIR}/WC/POM/Angle/FieldSettings.FieldFormatsPopup.Robot

*** Variables ***
#General
${pgbFieldSettings}             css=#FieldListArea .k-loading-mask
${btnFieldSettingOptions}       css=#ButtonDisplayOptions
${btnCloseFieldSettingOptions}  css=#PopupChartOptions .k-window-action
${btnAddRowAreaField}           AddRowAreaField
${divFieldRowArea}              jquery=#FieldListRowArea ul
${divFieldListRowArea}          jquery=#FieldListRowArea li
${btnAddColumnAreaField}        AddColumnAreaField
${divFieldColumnArea}           jquery=#FieldListColumnArea ul
${divFieldListColumnArea}       jquery=#FieldListColumnArea li
${btnAddDataAreaField}          AddDataAreaField
${divFieldDataArea}             jquery=#FieldListDataArea ul
${divFieldListDataArea}         jquery=#FieldListDataArea li
${chkFieldCount}                chkCount
${btnFieldSettingApply}         btnFieldSettingApply

#Field options
${btnFieldSettingsSortAscending}    jquery=.HeaderPopup .sortAsc:visible
${btnFieldSettingsSortDecending}    jquery=.HeaderPopup .sortDesc:visible
${btnFieldSettingsFieldFormat}      jquery=.HeaderPopup .fieldFormat:visible
${btnFieldSettingsAddFilter}        jquery=.HeaderPopup .addFilter:visible
${btnFieldSettingsFieldInfo}        jquery=.HeaderPopup .fieldInfo:visible

#Add filter popup
${btnAddFilterFromFieldSetting}     btn-popupListFilter1

#Field Format Popup Field Date type
${chkBucketGrid}                    jquery=#BucketOptionDropDown_listbox
${chkBucketPerDay}                  li:eq(0)
${chkBucketPerWeek}                 li:eq(1)
${chkBucketPerMonth}                li:eq(2)

#Value In Chart
${vlDateType}                       jquery=#chart g:eq(15)

${btnColumnModelDataTimestamp}      jquery=#AngleGrid .k-grid-header-wrap th:eq(2)
${btnCreateChart}                   jquery=#AngleTableWrapper .propertyFunction .createChart

*** Keywords ***
Wait Until Field Settings Loaded
    Wait Until Page Does Not Contain Element    ${pgbFieldSettings}

Is Valid Field Settings
    ${errorCount}   Get Elements Count    jquery=#FieldListArea .validError
    ${isVaid}    Execute JavaScript    return ${errorCount} == 0
    [Return]    ${isVaid}

Click Show Display Option
    Wait Until Field Settings Loaded
    Click Element    ${btnFieldSettingOptions}
    Sleep    ${TIMEOUT_GENERAL}    Wait for rendering

Click Hide Display Option
    Click Element    ${btnCloseFieldSettingOptions}

Click Apply Field Setting
    Sleep    ${TIMEOUT_GENERAL}    Wait for rendering
    Click Element    ${btnFieldSettingApply}
    Wait Progress Bar Closed
    Wait Until Pivot Display Loaded
    Sleep    ${TIMEOUT_LARGEST}    Wait for rendering, a bit delay

Click Show Field Chooser For Row Area
    Click Element    ${btnAddRowAreaField}

Click Show Field Chooser For Column Area
    Click Element    ${btnAddColumnAreaField}

Click Show Field Chooser For Data Area
    Click Element    ${btnAddDataAreaField}

Click Field In Row Area By Field Index
    [Arguments]   ${index}
    Sleep    1s
    Wait Until Field Settings Loaded
    Wait Until Element Is Enabled    ${divFieldListRowArea}:eq(${index})
    Click Element    ${divFieldListRowArea}:eq(${index})

Click Field In Column Area By Field Index
    [Arguments]   ${index}
    Click Element    ${divFieldListColumnArea}:eq(${index})

Click Field In Data Area By Field Index
    [Arguments]   ${index}
    Click Element    ${divFieldListDataArea}:eq(${index})

Remove Field In Row Area By Field Index
    [Arguments]   ${index}
    Sleep    1s
    Mouse Over    ${divFieldListRowArea}:eq(${index})
    Wait Until Element Is Visible  ${divFieldListRowArea}:eq(${index}) .btnDelete
    Click Element    ${divFieldListRowArea}:eq(${index}) .btnDelete

Remove Field In Column Area By Field Index
    [Arguments]   ${index}
    Sleep    1s
    Mouse Over    ${divFieldListColumnArea}:eq(${index})
    Wait Until Element Is Visible   ${divFieldListColumnArea}:eq(${index}) .btnDelete
    Click Element    ${divFieldListColumnArea}:eq(${index}) .btnDelete

Remove Field In Data Area By Field Index
    [Arguments]   ${index}
    Sleep    1s
    Mouse Over    ${divFieldListDataArea}:eq(${index})
    Wait Until Element Is Visible    ${divFieldListDataArea}:eq(${index}) .btnDelete
    Click Element    ${divFieldListDataArea}:eq(${index}) .btnDelete

Click Show Field Format For Field Settings
    Sleep    1s
    Wait Until Page Contains Element    ${btnFieldSettingsFieldFormat}
    Click Element    ${btnFieldSettingsFieldFormat}
    Wait Until Field Formats Popup Loaded

Click Show Count Field Format For Field Settings
    Sleep    1s
    Wait Until Page Contains Element    ${btnFieldSettingsFieldFormat}
    Click Element    ${btnFieldSettingsFieldFormat}
    Wait Until Count Field Formats Popup Loaded

Click Show Add Filter For Field Settings
    Click Element    ${btnFieldSettingsAddFilter}

Click Add Filter To For Field Settings
    Click Element    ${btnAddFilterFromFieldSetting}

Click Show Field Info For Field Settings
    Click Element    ${btnFieldSettingsFieldInfo}

Select Count Checkbox
    Select Checkbox    ${chkCount}

Unselect Count Checkbox
    Unselect Checkbox    ${chkCount}

Move Field To Area
    [Arguments]   ${source}    ${target}
    Drag And Drop    ${source}    ${target}
    Sleep    ${TIMEOUT_GENERAL}

Move Field From Row To Column Area
    Move Field To Area    ${divFieldListRowArea}:eq(0)    ${divFieldColumnArea}

Move Field From Column To Row Area
    Move Field To Area    ${divFieldListColumnArea}:eq(0)    ${divFieldRowArea}

Click Pivot Field Setting Sort Ascending
    Click Element    ${btnFieldSettingsSortAscending}
    Wait Progress Bar Closed
    Wait Until Pivot Display Loaded

Click Pivot Field Setting Sort Decending
    Click Element    ${btnFieldSettingsSortDecending}
    Wait Progress Bar Closed
    Wait Until Pivot Display Loaded

Click Column Header
    Click Element    ${btnColumnModelDataTimestamp}

Select Create Chart
    Wait Until Element Is Enabled    ${btnCreateChart}
    Click Element    ${btnCreateChart}

Click Bucket Options
    Click Element    ${ddlBucketOption}
    Wait Until Page Contains Element    ${chkBucketGrid}
    Wait Until Ajax Complete

Select Bucket Per Day
    Click Element    ${chkBucketGrid} ${chkBucketPerDay}
    Wait Until Ajax Complete

Select Bucket Per Week
    Click Element    ${chkBucketGrid} ${chkBucketPerWeek}
    Wait Until Ajax Complete

Select Bucket Per Month
    Click Element    ${chkBucketGrid} ${chkBucketPerMonth}
    Wait Until Ajax Complete
