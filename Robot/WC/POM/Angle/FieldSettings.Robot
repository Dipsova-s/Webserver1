*** Settings ***
Resource            ${EXECDIR}/WC/POM/Angle/FieldSettings.ChartTypes.Robot
Resource            ${EXECDIR}/WC/POM/Angle/FieldSettings.ChartOptions.Robot
Resource            ${EXECDIR}/WC/POM/Angle/FieldSettings.PivotOptions.Robot
Resource            ${EXECDIR}/WC/POM/Angle/FieldSettings.FieldFormatsPopup.Robot

*** Variables ***
#General
${pgbFieldSettings}             css=.section-aggregation .k-loading-mask
${btnFieldSettingUndo}          css=.section-aggregation .action-cancel
${btnFieldSettingOptions}       css=.section-aggregation .action-options
${btnCloseFieldSettingOptions}  css=.k-overlay
${btnAddRowAreaField}           jquery=.query-aggregation-row .action-add-aggregation
${divFieldRowArea}              jquery=.query-aggregation-row ul
${divFieldListRowArea}          jquery=.query-aggregation-row li
${btnAddColumnAreaField}        jquery=.query-aggregation-column .action-add-aggregation
${divFieldColumnArea}           jquery=.query-aggregation-column ul
${divFieldListColumnArea}       jquery=.query-aggregation-column li
${btnAddDataAreaField}          jquery=.query-aggregation-data .action-add-aggregation
${divFieldDataArea}             jquery=.query-aggregation-data ul
${divFieldListDataArea}         jquery=.query-aggregation-data li
${chkFieldCount}                css=.count-field-wrapper input
${btnFieldSettingApply}         css=.query-aggregation-buttons .btn-save

#Field options
${btnFieldSettingsSort}             jquery=.action-sorting:visible
${btnFieldSettingsSortAscending}    jquery=.action-sorting.icon-sort-asc:visible
${btnFieldSettingsSortDecending}    jquery=.action-sorting.icon-sort-desc:visible
${btnFieldSettingsFieldFormat}      jquery=.action-format:visible
${btnFieldSettingsAddFilter}        jquery=.action-filter:visible
${btnFieldSettingsFieldInfo}        jquery=.action-info:visible
${btnFieldSettingsDelete}           jquery=.action-delete:visible
${btnFieldSettingsError}            jquery=.validError:visible

# reference line
${divFieldSettingsReferenceLinePopup}   jquery=.popupReferenceLine
${btnFieldSettingsReferenceLine}        jquery=.action-reference-line:visible
*** Keywords ***
Wait Until Field Settings Loaded
    Wait Until Page Does Not Contain Element    ${pgbFieldSettings}

Click Undo field Settings
    Click Element  ${btnFieldSettingUndo}

Click Show Display Option
    Wait Until Field Settings Loaded
    Click Element    ${btnFieldSettingOptions}
    Sleep    ${TIMEOUT_GENERAL}    Wait for rendering

Click Hide Display Option
    Click Element    ${btnCloseFieldSettingOptions}

Click Apply Field Setting
    Sleep    ${TIMEOUT_GENERAL}    Wait for rendering
    Click Element    ${btnFieldSettingApply}
    Wait Display Executed
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
    Mouse Over    ${divFieldListRowArea}:eq(${index})

Click Field In Column Area By Field Index
    [Arguments]   ${index}
    Sleep    1s
    Wait Until Field Settings Loaded
    Mouse Over    ${divFieldListColumnArea}:eq(${index})

Click Field In Data Area By Field Index
    [Arguments]   ${index}
    Sleep    1s
    Wait Until Field Settings Loaded
    Mouse Over    ${divFieldListDataArea}:eq(${index})

Click Remove Field For Field Settings
    Click Element    ${btnFieldSettingsDelete}

Click Show Field Format For Field Settings
    Click Element    ${btnFieldSettingsFieldFormat}
    Wait Until Field Formats Popup Loaded

Click Add Filter To For Field Settings
    Click Element    ${btnFieldSettingsAddFilter}

Click Show Field Info For Field Settings
    Click Element    ${btnFieldSettingsFieldInfo}
    Wait Until Help Text Popup Loaded

Select Count Checkbox
    Select Checkbox    ${chkCount}

Unselect Count Checkbox
    Unselect Checkbox    ${chkCount}

Move Field To Area
    [Arguments]   ${source}  ${target}  ${delta}
    ${y1}  Get Vertical Position   ${source}
    ${y2}  Get Vertical Position   ${target}
    ${y}  Execute JavaScript  return ${y2}-${y1}+(1*${delta});
    Drag And Drop By Offset    ${source}  10  ${y}
    Sleep    ${TIMEOUT_GENERAL}

Move Field From Row To Column Area
    Move Field To Area    ${divFieldListRowArea}:eq(0)    ${divFieldColumnArea}  5

Move Field From Column To Row Area
    Move Field To Area    ${divFieldListColumnArea}:eq(0)    ${divFieldRowArea}  -5

Click Field Setting Sort Ascending
    Click Element    ${btnFieldSettingsSortAscending}
    Click Apply Field Setting

Click Field Setting Sort Decending
    Click Element    ${btnFieldSettingsSortDecending}
    Click Apply Field Setting

Wait Until Reference Line Popup Loaded
    Wait Until Element Is Visible    ${divFieldSettingsReferenceLinePopup}
    Sleep    ${TIMEOUT_GENERAL}

Click Field Setting Reference Line
    Click Element   ${btnFieldSettingsReferenceLine}  
    Wait Until Reference Line Popup Loaded