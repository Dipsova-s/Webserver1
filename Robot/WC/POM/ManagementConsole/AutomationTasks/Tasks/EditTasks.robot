*** Variables ***
${pgbEditTaskPage}       css=#formTask .k-loading-mask

${btnSaveEditTasks}      css=.btnSave
${btnCancelEditTasks}    css=.btnBack

${txtTaskName}           TaskName
${ddlTaskTriggerType}        css=.k-dropdown[aria-owns=trigger_type_listbox]
${ddlTaskEventType}          css=.k-dropdown[aria-owns=event_type_listbox]
${txtTaskTimeStop}           css=[name="TimeStop"]
${txtTaskStartTime}          css=[name="StartTime"]
${chkTaskIsEnabled}          css=#IsEnabled
${divScheduleSection}        css=#ScheduleSection
${divEventSection}           css=#EventSection

${btnTaskAddAction}            css=#AddActionButton
${btnCloseAddActionPopup}      css=#AddActionPopup .btnClose
${ddlTaskActionType}           css=.k-dropdown[aria-owns="action_type_listbox"]
${chkTaskEnableEmail}          css=#email_enable
${btnTaskAddRecipient}         css=.btnAddRecipient
${thRecipientsResult}          jquery=#RecipientsGrid .k-header[data-field="result"]
${tdRecipientsResult}          jquery=#RecipientsGrid .columnEmailResult
${chkTaskActionAttachResult}   css=#email_attach_result
${lblTaskActionModelName}      css=#model_name
${txtTaskActionAngleId}        css=#angle_id
${btnTaskActionFindAngle}      css=.btnFindAngle
${lblTaskActionAngleName}      css=#angle_name
${ddlTaskActionDisplayId}      css=#display_id
${ddlTaskActionApproval}       css=#approvalddl
${ddlTaskActionConditionOperator}   css=#condition_operator
${txtTaskActionConditionValue}      css=#condition_value
${ddlTaskActionDatastore}      css=.k-dropdown[aria-owns="datastore_listbox"]
${ddlTaskActionScript}         css=#script
${txtTaskActionParameters}     css=#parameters
${txtTaskActionUsername}       css=#run_as_user
${txtTaskActionPassword}       css=#password
${chkTaskActionAbortError}     css=#abort_task_when_error
${txtEmailRecipient}           jquery=[name^=email_address]
${chkEmailResult}              jquery=[name^=is_result]
${chkEmailSuccess}             jquery=[name^=is_success]
${chkEmailFailure}             jquery=[name^=is_failed]
${txtEmailDescription}         jquery=#email_body

${txtDatastoreFileName}        css=#file_name
${chkDatastoreAppendResult}    css=#append

${trGridTaskAction}            jquery=#TaskActionsGrid tbody tr
${btnExecutetAction}           .btnGroupInner .btnExecute

${addActionPopup}               AddActionPopup
${txtRusAsUser}                 css=#action_run_as_user
${btnAddAction}                 css=#AddActionPopup .btnAddAction
${txtApprovalState}             css=.k-dropdown[aria-owns="approvalddl_listbox"]
${pgbTaskActionDatastore}       css=.k-loading-mask
                   

*** Keywords ***
Wait Edit Tasks Page Ready
      [Arguments]    ${pagename}
      Wait Until Page Contains    ${pagename}
      Wait Until Page Contains    Maximum run time  60s
      Wait Until Page Contains Element    ${ddlTaskTriggerType}
      Wait MC Progress Bar Closed
      Sleep    ${TIMEOUT_GENERAL}
      Wait Until Page Does Not Contain Element    ${pgbEditTaskPage}

Fill in Task Name
    [Arguments]    ${taskName}
    Input Text    ${txtTaskName}    ${taskName}

Click Save and Edit Tasks
    Click Element    ${btnSaveEditTasks}

Choose Dropdown List Task Trigger Type
    [Arguments]    ${taskTriggerType}
    Select Dropdown By InnerText    ${ddlTaskTriggerType}    ${taskTriggerType}

Choose Dropdown List Task Event Type
    [Arguments]    ${taskEventType}
    Select Dropdown By InnerText    ${ddlTaskEventType}    ${taskEventType}

Click Edit Task Action By Task Name
    [Arguments]    ${taskName}
    Click Show Action Dropdown In Grid By Name    ${taskName}    ${trRowTaskGrid}

Click Copy Task Action By Task Name
    [Arguments]    ${taskName}
    Click Action In Grid By Name    ${taskName}    ${trRowTaskGrid}    ${btnActionCopyRole}
    Wait Until Page Contains   Copy task
    Wait Until Page Contains   New task name
    Wait Until Ajax Complete

Click Cancel Create Task
    Click Element    ${btnCancelEditTasks}
    Wait Until Ajax Complete

Click Add Action Button
    Click Element    ${btnTaskAddAction}
    Wait Add Action Popup Ready

Wait Add Action Popup Ready
    Wait Until Page Contains Element     ${addActionPopup}
    Page Should Contain Element         ${addActionPopup}
    Sleep    ${TIMEOUT_GENERAL}
    Wait Until Ajax Complete

Click Ok Button On Action Popup
    Click Element     ${btnAddAction}

Action Run As User Should be
    [Arguments]   ${name}
    Textfield Value Should Be   ${txtRusAsUser}     ${name}

Approval State Should be
    [Arguments]    ${state}
    Element Text Should Be    ${txtApprovalState} .k-dropdown-wrap     ${state}

Input Task Action Angle Url
    [Arguments]    ${url}
    Input Text  ${txtTaskActionAngleId}  ${url}
    Click Element  ${btnTaskActionFindAngle}
    Sleep   ${TIMEOUT_DROPDOWN}
    Wait Until Ajax Complete

Close Add Action Popup
    Click Element    ${btnCloseAddActionPopup}

Row In Add Action Popup Should Be Visible
    [Arguments]    ${label}
    Element Should Be Visible    jquery=#AddActionPopup .contentSectionInfoItem:contains(${label})

Select Action Type Datastore
    Select Dropdown By InnerText    ${ddlTaskActionType}  Datastore

Select Action Type Program/script
    Select Dropdown By InnerText    ${ddlTaskActionType}  Program/script

Select Dropdown Datastore
    [Arguments]    ${text}
    Select Dropdown By InnerText    ${ddlTaskActionDatastore}  ${text}
    Wait Until Page Does Not Contain Element    ${pgbTaskActionDatastore}
    Wait Until Ajax Complete

Enable Send Email Notification
    Select Checkbox      ${chkTaskEnableEmail}

Disable Send Email Notification
    Unselect Checkbox    ${chkTaskEnableEmail}

Enable Send Email Attach result
    Select Checkbox      ${chkTaskActionAttachResult}

Disable Send Email Attach result
    Unselect Checkbox    ${chkTaskActionAttachResult}

Click Add Recipient Button
    Click Element    ${btnTaskAddRecipient}

Input Task Action Email Recipient
    [Arguments]    ${index}    ${email}
    Input Text    ${txtEmailRecipient}:eq(${index})     ${email}

Select Task Action Email Result
    [Arguments]    ${index}
    Select Checkbox      ${chkEmailResult}:eq(${index})

Unselect Task Action Email Result
    [Arguments]    ${index}
    Unselect Checkbox      ${chkEmailResult}:eq(${index})

Select Task Action Email Success
    [Arguments]    ${index}
    Select Checkbox      ${chkEmailSuccess}:eq(${index})

Unselect Task Action Email Success
    [Arguments]    ${index}
    Unselect Checkbox      ${chkEmailSuccess}:eq(${index})

Select Task Action Email Failure
    [Arguments]    ${index}
    Select Checkbox      ${chkEmailFailure}:eq(${index})

Unselect Task Action Email Failure
    [Arguments]    ${index}
    Unselect Checkbox      ${chkEmailFailure}:eq(${index})

Input Task Action Email Description
    [Arguments]    ${text}
    Input kendo Text Editor    ${txtEmailDescription}    ${text}

Get Number Of Task Action Email Notification
    ${count}    Get Element Count    ${chkEmailResult}
    [Return]    ${count}

Select Datastore Append Result
    Select Checkbox      ${chkDatastoreAppendResult}

Unselect Datastore Append Result
    Unselect Checkbox      ${chkDatastoreAppendResult}

Input Datastore Filename
    [Arguments]    ${value}
    Input Text    ${txtDatastoreFileName}    ${value}

Task Action Should Contain Execute Button
    [Arguments]     ${actionName}
    Page Should Contain Element     ${trGridTaskAction} td:contains('${actionName}') 
    Click Show Action Dropdown In Grid By Name    ${actionName}    ${trGridTaskAction}
    Wait Until Page Contains Element    ${trGridTaskAction}:contains(${actionName}) ${btnExecutetAction}

Task Action Should Contain Run As User
    [Arguments]     ${index}     ${name}
    Element Should Contain    ${trGridTaskAction}:eq(${index})  ${name}
