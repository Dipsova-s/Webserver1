*** Settings ***
Resource                  ${EXECDIR}/resources/WCSettings.robot
Resource                  ${EXECDIR}/WC/API/API_Angle.robot
Resource                  ${EXECDIR}/WC/API/API_Task.robot
Suite Setup               Go To Tasks Page With Admin User
Suite Teardown            Logout MC Then Close Browser
Test Teardown             Reload Tasks Page
Force Tags                MC    acc_mc

*** Test Cases ***
Test Verify Event type dropdown
    Verify Event type dropdown

Verify Copy Task
    @{cleanUpItems}    Create List
    Create Context: Web
    ${angleData}    Create Angle    /models/1    TaskForCopy_Angle.json
    ${angleUri}    Get Uri From Response    ${angleData}
    Append To List   ${cleanUpItems}    ${angleUri}?forced=true

    Create Context: Web
    Create Task    TaskForCopy.json

    Reload Tasks Page
    Create Task By Copy Action   TaskForCopy    TestCopyTask

    [Teardown]  Run Keyword  Clean Up Items     Web    ${cleanUpItems}