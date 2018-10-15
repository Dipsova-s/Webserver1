*** Settings ***
Resource            ${EXECDIR}/WC/POM/ManagementConsole/AutomationTasks/Tasks/AllTasks.robot
Resource            ${EXECDIR}/WC/POM/ManagementConsole/AutomationTasks/Tasks/EditTasks.robot

*** Keywords ***
Go To Tasks Page With Admin User
    Go to MC Then Login With Admin User
    Wait Until Overview Page Loaded
    Go To All Tasks Page

Go To All Tasks Page
    Wait Side Menu Ready
    Click Side Menu Automation Tasks
    Click Side Menu Automation Tasks and Tasks
    Wait All Tasks Page Ready

Reload Tasks Page
    Click Side Menu Automation Tasks and Tasks
    Wait All Tasks Page Ready

Verify Event type dropdown
    Click Button To Add New Task
    Wait Edit Tasks Page Ready
    Choose Dropdown List Task Action Type    Event
    Choose Dropdown List Task Event Type    When new model available
    Page Should Contain    Event
    Page Should Contain    When new model available
    Click Cancel Create Task

Create Task By Copy Action
    [Arguments]    ${taskName}    ${newTaskName}
    Create Task By Copy Task    ${taskName}    ${newTaskName}
    Page Should Contain      ${newTaskName}
