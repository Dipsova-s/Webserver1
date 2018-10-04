*** Settings ***
Resource            ${EXECDIR}/WC/POM/ManagementConsole/AutomationTasks/Tasks/AllTasks.robot
Resource            ${EXECDIR}/WC/POM/ManagementConsole/AutomationTasks/Tasks/EditTasks.robot

*** Keywords ***
Go To All Tasks Page
    Wait Side Menu Ready
    Click Side Menu Automation Tasks
    Click Side Menu Automation Tasks and Tasks
    Wait All Tasks Page Ready

Verify Event type dropdown
    Click Button To Add New Task
    Wait Edit Tasks Page Ready
    Choose Dropdown List Task Action Type    Event
    Choose Dropdown List Task Event Type    When new model available
    Page Should Contain    Event
    Page Should Contain    When new model available

#Test Copy Task
Verify Popup Copy task UI
    [Arguments]    ${taskName}
    Click Edit Task Action By Task Name    ${taskName}
    Click Copy Task Action By Task Name    ${taskName}
    Page Should Contain    New task name
   
Verify Create Task By Copy Task Name
    [Arguments]    ${taskName}    ${newTaskName}
    Create Task By Copy Task    ${taskName}    ${newTaskName}
    Page Should Contain      New task name

Delete Task By Task Name
    [Arguments]    ${taskName}
    Click Edit Task Action By Task Name    ${taskName}
    Click Delete Task Action By Task Name    ${taskName}
  #  Wait Until Element Does Not Contain    ${divRolesGrid}    ${roleName}

