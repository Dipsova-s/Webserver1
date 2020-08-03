*** Settings ***
Resource    		${EXECDIR}/WC/POM/Angle/AnglePage.robot
Resource    		${EXECDIR}/WC/POM/Angle/ScheduleAngle.robot
Resource            ${EXECDIR}/WC/POM/ManagementConsole/AutomationTasks/Tasks/EditTasks.robot

*** Keywords ***
Schedule Angle From Existing Task In Angle AnglePage
    [Arguments]     ${taskName}
    Click On Schedule Angle
    Select Task To Schedule     ${taskName}
    Click Schedule Angle
    
Verify Wheather User Redirects To Add Action Page
    Wait Edit Tasks Page Ready      Edit task
    Wait Add Action Popup Ready
    Close Add Action Popup

    