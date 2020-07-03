*** Settings ***
Resource            ${EXECDIR}/WC/API/API_Utility.robot

*** Keywords ***
Create Task
    [Arguments]  ${data}
    ${body}  Send POST  /tasks?redirect=no  ${data}
    [Return]  ${body}

Get Task
    [Arguments]  ${uri}
    ${body}  Send GET  ${uri}
    [Return]  ${body}

Delete Task
    [Arguments]  ${uri}
    ${body}  Send DELETE  ${uri}

Execute Task
    [Arguments]  ${data}
    Restore Created Context
    ${task}  Create Task  ${data}
    ${taskUri}  Get Uri From Response  ${task}
    Wait Until Task Finished  ${taskUri}

    Restore Created Context
    Delete Task  ${taskUri}

Check Task Finished
    [Arguments]  ${uri}
    Restore Created Context
    ${data}  Get Task  ${uri}
    ${status}  Get From Dictionary  ${data}  status
    Should Be True  "${status}"=="finished"

Wait Until Task Finished
    [Arguments]  ${uri}
    Sleep  2s
    Wait Until Keyword Succeeds  5 min  5 sec  Check Task Finished  ${uri}