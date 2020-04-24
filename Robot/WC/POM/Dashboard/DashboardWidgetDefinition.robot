*** Variables ***
${divWidgetDefinition}          jquery=.section-widgets
${divWidgetDefinitionItems}     ${divWidgetDefinition} .item
${btnEditWidgetDefinition}      .btn-definition
${divEditWidgetDefinition}      jquery=.dashboard-widget-popup
${btnCloseEditWidgetPopup}      ${divEditWidgetDefinition} .k-window-action[aria-label="Close"]
${btnApplyEditingWidget}        ${divEditWidgetDefinition} .btn-apply
${inputEditWidgetName}          ${divEditWidgetDefinition} input.name
${divEditWidgetDisplayItems}    ${divEditWidgetDefinition} .listview-item
${rdoEditWidgetDisplay}         input[name="display"]
${btnOpenWidgetDisplay}         .btn-link

*** Keywords ***
Widget Count Should Be
    [Arguments]  ${expected}
    ${count}  Get Element Count  ${divWidgetDefinitionItems}
    Should Be True  ${count} == ${expected}

Editing Widget Name Should Be
    [Arguments]  ${index}  ${name}
    Element Text Should Be  ${divWidgetDefinitionItems}:eq(${index})  ${name}

Show Edit Widget Popup
    [Arguments]  ${name}
    Click Element  ${divWidgetDefinitionItems}:contains(${name}) ${btnEditWidgetDefinition}

Close Edit Widget Popup
    Click Element  ${btnCloseEditWidgetPopup}

Input Widget Name
    [Arguments]  ${name}
    Input Text By JQuery  ${inputEditWidgetName}  ${EMPTY}
    Input Text  ${inputEditWidgetName}  ${name}
    Press Keys  ${inputEditWidgetName}  RETURN

Select Widget Display
    [Arguments]  ${name}
    Click Element  ${divEditWidgetDisplayItems}:contains(${name}) ${rdoEditWidgetDisplay}

Click Link Widget Display
    [Arguments]  ${name}
    Mouse Over  ${divEditWidgetDisplayItems}:contains(${name})
    Click Element  ${divEditWidgetDisplayItems}:contains(${name}) ${btnOpenWidgetDisplay}
    Select Window  NEW
    Wait Angle Page Document Loaded

Click Apply Editing Widget
    Click Element  ${btnApplyEditingWidget}
    Wait Dashboard Widgets Loaded