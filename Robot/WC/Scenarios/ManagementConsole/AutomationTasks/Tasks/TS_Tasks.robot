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