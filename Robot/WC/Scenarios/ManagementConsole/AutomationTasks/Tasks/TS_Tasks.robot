*** Settings ***
Resource            ${EXECDIR}/WC/POM/ManagementConsole/AutomationTasks/Tasks/AllTasks.robot
Resource            ${EXECDIR}/WC/POM/ManagementConsole/AutomationTasks/Tasks/EditTasks.robot

*** Keywords ***
Go To Tasks Page With Admin User
    Go to MC Then Login With Admin User
    Go To All Tasks Page

Go To All Tasks Page
    Go To MC Page    /Angle%20exports/Automation%20tasks/
    Wait All Tasks Page Ready

Create Task By Copy Action
    [Arguments]    ${taskName}    ${newTaskName}
    Create Task By Copy Task    ${taskName}    ${newTaskName}
    Page Should Contain      ${newTaskName}

Add Task Action Email Notification
    [Arguments]    ${email}    ${result}    ${success}    ${failure}
    Click Add Recipient Button
    ${emailCount}    Get Number Of Task Action Email Notification
    ${index}    Execute JavaScript    return ${emailCount} - 1;
    Input Task Action Email Recipient    ${index}    ${email}
    Run Keyword    ${result} Task Action Email Result     ${index}
    Run Keyword    ${success} Task Action Email Success    ${index}
    Run Keyword    ${failure} Task Action Email Failure    ${index}

Delete Task By Delete Action
    [Arguments]    ${taskName}
    Delete Task By Name   ${taskName}
    Verify Task Dose Not Exists      ${taskName}

Verify Run as User On Action Popup
    Action Run As User Should be      local\\EAViewer

Verify Approval State On Action Popup
    Approval State Should be     requested
    
Able To Add Action 
    Select Dropdown Datastore      Export to Excel Default
    Click Ok Button On Action Popup

Verify Run As User On Action Grid
    Task Action Should Contain Run As User   1     local\\EAViewer  
    