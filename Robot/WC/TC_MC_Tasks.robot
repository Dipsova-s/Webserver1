*** Settings ***
Resource                  ${EXECDIR}/resources/WCSettings.robot
Resource                  ${EXECDIR}/WC/API/API_Angle.robot
Resource                  ${EXECDIR}/WC/API/API_Task.robot
Suite Setup               Go To Tasks Page With Admin User
Suite Teardown            Logout MC Then Close Browser
Force Tags                MC    acc_mc

*** Test Cases ***
Test Verify Task UI
    Click Button To Add New Task
    Verify Edit Task Page
    Verify Add Task Action Popup
    [Teardown]  Go To All Tasks Page

Verify Copy Task
    [Tags]      TC_C228916
    [Documentation]     Copy a task, make sure it can be copied although its name contains double quotes (")
    @{cleanUpItems}    Create List
    Create Context: Web
    ${angleData}    Create Angle    /models/1    TaskForCopy_Angle.json
    ${angleUri}    Get Uri From Response    ${angleData}
    Append To List   ${cleanUpItems}    ${angleUri}?forced=true

    Create Context: Web
    Create Task    TaskForCopy.json

    Go To All Tasks Page
    Create Task By Copy Action   "TaskForCopy"    "TaskForCopy"_copy

    [Teardown]  Run Keywords  Clean Up Items     Web    ${cleanUpItems}
    ...         AND           Go To All Tasks Page

Verify Delete Task
    [Tags]      TC_C228910
    [Documentation]     Delete a task, make sure it can be deleted although its name contains double quotes (")
    @{cleanUpItems}    Create List
    Create Context: Web
    ${angleData}    Create Angle    /models/1    TaskForDelete_Angle.json
    ${angleUri}    Get Uri From Response    ${angleData}
    Append To List   ${cleanUpItems}    ${angleUri}?forced=true

    Create Context: Web
    Create Task    TaskForDelete.json

    Go To All Tasks Page
    Delete Task By Delete Action    TaskFor"Delete"

    [Teardown]  Run Keywords  Clean Up Items     Web    ${cleanUpItems}
    ...         AND           Go To All Tasks Page

Verify Execute Task Single Action
    [Tags]      TC_C230009
    [Documentation]    Enable users to execute a single action of an Automation Task
    @{cleanUpItems}    Create List
    Create Context: Web
    ${angleData}    Create Angle    /models/1    Angle_For_SingleAction.json
    ${angleUri}    Get Uri From Response    ${angleData}
    Append To List   ${cleanUpItems}    ${angleUri}?forced=true

    Create Context: Web
    Create Task    TaskForSingleAction.json

    Go To All Tasks Page
    Verify Execute Single Action    TaskForSingleAction    Angle for single action

    [Teardown]  Run Keywords  Clean Up Items     Web    ${cleanUpItems}
    ...         AND           Go To All Tasks Page
