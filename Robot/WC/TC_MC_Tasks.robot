*** Settings ***
Resource                  ${EXECDIR}/resources/WCSettings.robot
Resource                  ${EXECDIR}/WC/API/API_Angle.robot
Resource                  ${EXECDIR}/WC/API/API_Task.robot
Suite Setup               Go To Tasks Page With Admin User
Suite Teardown      Close Browser
Force Tags                MC    acc_mc

*** Test Cases ***
Test Verify Task UI
    [Documentation]    This test is to verify the automation task UI after clicking on Add new Task button
    Click Button To Add New Task
    Verify Edit Task Page
    Verify Add Task Action Popup
    [Teardown]  Go To All Tasks Page

Verify Copy Task
    [Tags]      TC_C228916
    [Documentation]     Copy a task, make sure it can be copied although its name contains double quotes (")
    [Setup]  Run Keywords  Import Angle By API  /models/1    TaskForCopy_Angle.json
    ...         AND        Create Task    TaskForCopy.json

    Go To All Tasks Page
    Create Task By Copy Action   "TaskForCopy"    "TaskForCopy"_copy

    [Teardown]  Run Keywords  Clean Up All Items
    ...         AND           Go To All Tasks Page

Verify Delete Task
    [Tags]      TC_C228910
    [Documentation]     Delete a task, make sure it can be deleted although its name contains double quotes (")
    [Setup]  Run Keywords  Import Angle By API  /models/1    TaskForDelete_Angle.json
    ...         AND        Create Task    TaskForDelete.json

    Go To All Tasks Page
    Delete Task By Delete Action    TaskFor"Delete"

    [Teardown]  Run Keywords  Clean Up All Items
    ...         AND           Go To All Tasks Page

Verify Execute Task Single Action
    [Tags]      TC_C230009
    [Documentation]    Enable users to execute a single action of an Automation Task
    [Setup]  Run Keywords  Import Angle By API    /models/1    Angle_For_SingleAction.json
    ...         AND        Create Task    TaskForSingleAction.json

    Go To All Tasks Page
    Verify Execute Single Action    TaskForSingleAction    Angle for single action

    [Teardown]  Run Keywords  Clean Up All Items
    ...         AND           Go To All Tasks Page
