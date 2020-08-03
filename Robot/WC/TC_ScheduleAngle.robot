*** Settings ***
Resource                  ${EXECDIR}/resources/WCSettings.robot
Resource                  ${EXECDIR}/WC/API/API_Angle.robot
Resource                  ${EXECDIR}/WC/API/API_Task.robot
Force Tags                acc_wc

*** Test Cases ***
Verify Schedule Angle To Export Angle To Excel
    [Tags]      TC_C230198
    [Documentation]     Scheduling angle using existing task from webclient should redirect to Edit Action popup in ITMC.
    Go to WC Then Login With Admin User
    @{cleanUpItems}    Create List
    Create Context: Web
    ${angleData}    Create Angle    /models/1    Angle_For_ScheduleAngle.json
    ${angleUri}     Get Uri From Response    ${angleData}
    Append To List   ${cleanUpItems}    ${angleUri}?forced=true

    Create Context: Web
    Create Task    TaskForScheduleAngle.json

    Find Angle By ID Then Execute The First Angle       AngleForScheduleAngle
    Schedule Angle From Existing Task In Angle AnglePage       TaskForScheduleAngle
    Switch Window     IT Management Console
    Verify Wheather User Redirects To Add Action Page

    [Teardown]  Run Keywords  Clean Up Items     Web    ${cleanUpItems}
    ...         AND           Logout MC Then Close Browser