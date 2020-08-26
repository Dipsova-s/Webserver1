*** Settings ***
Resource            ${EXECDIR}/WC/API/API_Utility.robot
Resource            ${EXECDIR}/resources/WCSettings.robot
Resource            ${EXECDIR}/WC/API/API_Angle.robot
Resource            ${EXECDIR}/WC/API/API_Role.robot
Resource            ${EXECDIR}/WC/API/API_Task.robot
Resource            ${EXECDIR}/WC/API/API_User.robot
Resource    		${EXECDIR}/WC/POM/Angle/AnglePage.robot
Resource    		${EXECDIR}/WC/POM/Angle/ScheduleAngle.robot
Resource            ${EXECDIR}/WC/POM/ManagementConsole/AutomationTasks/Tasks/AllTasks.robot
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

Preparing Schedule Angle
    Import Angle By API    /models/1    Angle_For_ScheduleAngle.json
    Create Task     TaskForScheduleAngle.json
    ${roleData}    Create Role    SYSTEMROLE_Scheduler.json
    ${roleUri}     Get Uri From Response    ${roleData}
    Add Clean Up Item     ${roleUri}?forced=true
    ${user}  Get User By Name  EAViewer
    ${uri}  Get Uri From Response  ${user}
    Update User Roles  ${uri}  [{"role_id":"EA2_800_VIEWER","model_id":"EA2_800"},{"role_id":"Scheduleonly"}]}]