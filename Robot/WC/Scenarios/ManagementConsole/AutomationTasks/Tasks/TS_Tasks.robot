*** Settings ***
Resource            ${EXECDIR}/WC/POM/ManagementConsole/AutomationTasks/Tasks/AllTasks.robot
Resource            ${EXECDIR}/WC/POM/ManagementConsole/AutomationTasks/Tasks/EditTasks.robot

*** Keywords ***
Go To Tasks Page With Admin User
    Go to MC Then Login With Admin User
    Go To All Tasks Page

Go To All Tasks Page
    Go To MC Page    /Automation%20tasks/Tasks/
    Wait All Tasks Page Ready

Verify Edit Task Page
    Textfield Value Should Be    ${txtTaskTimeStop}    ${EMPTY}
    Textfield Value Should Be    ${txtTaskStartTime}    ${EMPTY}
    Checkbox Should Be Selected    ${chkTaskIsEnabled}

    Choose Dropdown List Task Trigger Type    Schedule
    Element Should Be Visible    ${divScheduleSection}
    Element Should Not Be Visible    ${divEventSection}

    Choose Dropdown List Task Trigger Type    External
    Element Should Not Be Visible    ${divScheduleSection}
    Element Should Not Be Visible    ${divEventSection}

    Choose Dropdown List Task Trigger Type    Event
    Element Should Not Be Visible    ${divScheduleSection}
    Element Should Be Visible    ${divEventSection}
    Choose Dropdown List Task Event Type    When new model available
    Page Should Contain    When new model available

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

Verify Add Task Action Popup
    Click Add Action Button
    Check Add Datastore Action Popup Elements
    Check Add Script Action Popup Elements
    Close Add Action Popup

Check Add Datastore Action Popup Elements
    Select Action Type Datastore
    Row In Add Action Popup Should Be Visible    Model
    Row In Add Action Popup Should Be Visible    Angle
    Row In Add Action Popup Should Be Visible    Angle name
    Row In Add Action Popup Should Be Visible    Display
    Row In Add Action Popup Should Be Visible    Approval state
    Row In Add Action Popup Should Be Visible    Condition
    Row In Add Action Popup Should Be Visible    Datastore
    Enable Send Email Notification
    Element Should Not Be Visible    ${chkTaskActionAttachResult}
    Click Add Recipient Button
    Element Should Be Visible    ${thRecipientsResult}
    Element Should Be Visible    ${tdRecipientsResult}

Check Add Script Action Popup Elements
    Select Action Type Program/script
    Row In Add Action Popup Should Be Visible    Program/script
    Row In Add Action Popup Should Be Visible    Add arguments
    Row In Add Action Popup Should Be Visible    Username
    Row In Add Action Popup Should Be Visible    Password
    Row In Add Action Popup Should Be Visible    Fail task if this action fails
    Row In Add Action Popup Should Be Visible    Approval state
    Enable Send Email Notification
    Element Should Not Be Visible    ${chkTaskActionAttachResult}
    Click Add Recipient Button
    Element Should Not Be Visible    ${thRecipientsResult}
    Element Should Not Be Visible    ${tdRecipientsResult} 

Delete Task By Delete Action
    [Arguments]    ${taskName}
    Delete Task   ${taskName}
    Verify Task Dose Not Exists      ${taskName}