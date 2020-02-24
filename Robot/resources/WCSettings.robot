*** Settings ***
Library             OperatingSystem
Library             SeleniumLibrary    	timeout=${Timeout}
Library             HttpLibrary.HTTP
Library             DateTime
Library             String
Library             Collections
Library             OperatingSystem
Library             HeadlessDownload.py
Library             ${EXECDIR}/python/PythonUtility.py
Resource            ${EXECDIR}/WC/POM/Shared/Utility.robot
Resource            ${EXECDIR}/WC/POM/ManagementConsole/Shared/MC_Utility.robot
Resource            ${EXECDIR}/WC/Scenarios/Shared/TS_Login.robot
Resource            ${EXECDIR}/WC/Scenarios/Shared/TS_FieldChooser.robot
Resource            ${EXECDIR}/WC/Scenarios/Shared/TS_UserPassword.robot
Resource            ${EXECDIR}/WC/Scenarios/Shared/TS_UserSettingsPanel.robot
Resource            ${EXECDIR}/WC/Scenarios/Shared/TS_ImportItem.robot
Resource            ${EXECDIR}/WC/Scenarios/Search/TS_Search.robot
Resource            ${EXECDIR}/WC/Scenarios/Search/TS_SearchFilter.robot
Resource            ${EXECDIR}/WC/Scenarios/Search/TS_SearchBusinessProcess.robot
Resource            ${EXECDIR}/WC/Scenarios/Search/TS_MassChange.robot
Resource            ${EXECDIR}/WC/Scenarios/Search/TS_UploadAngle.robot
Resource            ${EXECDIR}/WC/Scenarios/Angle/TS_Angle.robot
Resource            ${EXECDIR}/WC/Scenarios/Angle/TS_AngleDetail.robot
Resource            ${EXECDIR}/WC/Scenarios/Angle/TS_AngleFilter.robot
Resource            ${EXECDIR}/WC/Scenarios/Angle/TS_DisplayDetail.robot
Resource            ${EXECDIR}/WC/Scenarios/Angle/TS_List.robot
Resource            ${EXECDIR}/WC/Scenarios/Angle/TS_Pivot.robot
Resource            ${EXECDIR}/WC/Scenarios/Angle/TS_Chart.robot
Resource            ${EXECDIR}/WC/Scenarios/Angle/TS_FieldSettings.robot
Resource            ${EXECDIR}/WC/Scenarios/Dashboard/TS_Dashboard.robot
Resource            ${EXECDIR}/WC/Scenarios/Dashboard/TS_DashboardDetail.robot
Resource            ${EXECDIR}/WC/Scenarios/ManagementConsole/GlobalSettings/TS_BusinessProcess.robot
Resource            ${EXECDIR}/WC/Scenarios/ManagementConsole/GlobalSettings/TS_Authentication.robot
Resource            ${EXECDIR}/WC/Scenarios/ManagementConsole/GlobalSettings/TS_EditAuthentication.robot
Resource            ${EXECDIR}/WC/Scenarios/ManagementConsole/GlobalSettings/TS_CustomIcons.robot
Resource            ${EXECDIR}/WC/Scenarios/ManagementConsole/GlobalSettings/TS_SystemRole.robot
Resource            ${EXECDIR}/WC/Scenarios/ManagementConsole/GlobalSettings/TS_SystemSettings.robot
Resource            ${EXECDIR}/WC/Scenarios/ManagementConsole/GlobalSettings/TS_WebServerSettings.robot
Resource            ${EXECDIR}/WC/Scenarios/ManagementConsole/GlobalSettings/TS_Packages.robot
Resource            ${EXECDIR}/WC/Scenarios/ManagementConsole/GlobalSettings/TS_WelcomePage.robot
Resource            ${EXECDIR}/WC/Scenarios/ManagementConsole/GlobalSettings/TS_LabelCategory.robot
Resource            ${EXECDIR}/WC/Scenarios/ManagementConsole/GlobalSettings/TS_Languages.robot
Resource            ${EXECDIR}/WC/Scenarios/ManagementConsole/GlobalSettings/TS_SystemLog.robot
Resource            ${EXECDIR}/WC/Scenarios/ManagementConsole/Models/Roles/TS_Roles.robot
Resource            ${EXECDIR}/WC/Scenarios/ManagementConsole/Models/Users/TS_Users.robot
Resource            ${EXECDIR}/WC/Scenarios/ManagementConsole/Models/Users/TS_UserDefaults.robot
Resource            ${EXECDIR}/WC/Scenarios/ManagementConsole/Models/TS_AllModels.robot
Resource            ${EXECDIR}/WC/Scenarios/ManagementConsole/Models/TS_ModelOverview.robot
Resource            ${EXECDIR}/WC/Scenarios/ManagementConsole/Models/TS_SetupNewModel.robot
Resource            ${EXECDIR}/WC/Scenarios/ManagementConsole/Models/TS_ModelServer.robot
Resource            ${EXECDIR}/WC/Scenarios/ManagementConsole/Models/TS_SuggestedFields.robot
Resource            ${EXECDIR}/WC/Scenarios/ManagementConsole/Models/TS_RefreshCycle.robot
Resource            ${EXECDIR}/WC/Scenarios/ManagementConsole/AutomationTasks/Tasks/TS_Tasks.robot
Resource            ${EXECDIR}/WC/Scenarios/ManagementConsole/AutomationTasks/DataStores/TS_Datastores.robot
Resource            ${EXECDIR}/WC/Scenarios/ManagementConsole/Users/Userdefaults/TS_Userdefaults.robot
Resource            ${EXECDIR}/WC/Scenarios/ManagementConsole/Users/TS_Sessions.robot
Resource            ${EXECDIR}/WC/Scenarios/ManagementConsole/Models/Packages/TS_Packages.robot
Resource            ${EXECDIR}/WC/Scenarios/ManagementConsole/Models/TS_Communications.robot

Resource            ${EXECDIR}/WC/Scenarios/ManagementConsole/Models/TS_ModelsLanguages.robot

*** Variables ***
${URL_WC}    http://${URL}/${Branch}
${URL_WC_COMPARE}    http://${URL}/${CompareBranch}
${URL_MC}    http://${URL}/${Branch}/admin
${TIMEOUT_AJAX_COMPLETE}    1000
${TIMEOUT_DROPDOWN}    0.7s
${TIMEOUT_GENERAL}    0.5s
${TIMEOUT_LARGEST}    1s
${TIMEOUT_MC_OVERVIEW}    150s
${TIMEOUT_MC_LOAD}    60s
${TIMEOUT_MC_PROGRESS_BAR}    210s
${RunAllAngleName}    TC_RunAllAngles_
${RunAllAngleTemplateFile}    ${EXECDIR}/WC/TC_RunAllAnglesTemplate.robot
${SPACE4}    ${SPACE}${SPACE}${SPACE}${SPACE}
${WEBHELP_COMMON_FOLDER}    idsfigures_lowres
${WEBHELP_ITEM_PATH}    ${EXECDIR}/webhelp_items
${WC_HELP_IMAGE_PATH}    ${EXECDIR}/webhelp/${WEBHELP_COMMON_FOLDER}/Webclient
${MC_HELP_IMAGE_PATH}    ${EXECDIR}/webhelp/${WEBHELP_COMMON_FOLDER}/EA2_ManagementConsole
# Users
${AdminUsername}            \\eaadmin
${TestPrivilegesUser}       \\EATestUserRole
${ViewerUsername}           \\eaviewer

# Performance
${API_SLA}     0.5      # SLA time
${API_SEED}    50       # Number of item to test per case