*** Variables ***
${pgbEditTaskPage}       css=#formTask .k-loading-mask

${btnSaveEditTasks}      css=.btnSave
${btnCancelEditTasks}    css=.btnBack

${txtTaskName}    TaskName
${ddlActionType}    css=.k-dropdown[aria-owns=action_type_listbox]
${ddlEventType}    css=.k-dropdown[aria-owns=event_type_listbox]

*** Keywords ***
Wait Edit Tasks Page Ready
      Wait Until Page Contains    Create task
      Wait Until Page Contains    Maximum run time
      Wait Until Page Contains Element    ${ddlActionType}
      Wait MC Progress Bar Closed
      Sleep    ${TIMEOUT_GENERAL}
      Wait Until Page Does Not Contain Element    ${pgbEditTaskPage}

Fill in Task Name
    [Arguments]    ${taskName}
    Wait Until Page Contains Element    ${txtTaskName}
    Input Text    ${txtTaskName}    ${taskName}

Click Save and Edit Tasks
    Click Element    ${btnSaveEditTasks}

Choose Dropdown List Task Action Type
    [Arguments]    ${taskActionType}
    Wait Until Page Contains Element    ${ddlActionType}
    Select Dropdown By InnerText    ${ddlActionType}    ${taskActionType}

Choose Dropdown List Task Event Type
    [Arguments]    ${taskEventType}
    Wait Until Page Contains Element    ${ddlEventType}
    Select Dropdown By InnerText    ${ddlEventType}    ${taskEventType}