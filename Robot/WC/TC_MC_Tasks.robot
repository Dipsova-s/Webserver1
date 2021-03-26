*** Settings ***
Resource                  ${EXECDIR}/resources/WCSettings.robot
Resource                  ${EXECDIR}/WC/API/API_Angle.robot
Resource                  ${EXECDIR}/WC/API/API_Task.robot
Suite Setup               Go To Tasks Page With Admin User
Suite Teardown            Close Browser
Force Tags                MC    acc_mc

*** Test Cases ***
Verify Copy Task
    [Tags]      TC_C228916
    [Documentation]     Copy a task, make sure it can be copied although its name contains double quotes (")
    [Setup]  Run Keywords  Import Angle By API  /models/1    TaskForCopy_Angle.json
    ...         AND        Create Task    TaskForCopy.json

    Go To All Tasks Page
    Create Task By Copy Action   "TaskForCopy"    "TaskForCopy"_copy

    [Teardown]  Run Keywords  Clean Up All Items
    ...         AND           Go To All Tasks Page

