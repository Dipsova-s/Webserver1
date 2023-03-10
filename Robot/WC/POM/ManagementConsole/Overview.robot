*** Variables ***
${divSideMenuGlobalSettings}                        sideMenu-GlobalSettings
${divSideMenuGlobalSettingsAuthentication}          sideMenu-GlobalSettings-Authentication
${divSideMenuGlobalSettingsBusinessProcesses}       sideMenu-GlobalSettings-BusinessProcesses
${divSideMenuGlobalSettingsCustomIcons}             sideMenu-GlobalSettings-CustomIcons
${divSideMenuGlobalSettingsAllLabelCategories}      sideMenu-GlobalSettings-AllLabelCategories
${divSideMenuGlobalSettingsLanguages}               sideMenu-GlobalSettings-Languages
${divSideMenuGlobalSettingsUploadEASets}            sideMenu-GlobalSettings-UploadEASets
${divSideMenuGlobalSettingsSystemlog}               sideMenu-GlobalSettings-Systemlog
${divSideMenuGlobalSettingsSystemRoles}             sideMenu-GlobalSettings-SystemRoles
${divSideMenuGlobalSettingsSystemSettings}          sideMenu-GlobalSettings-SystemSettings
${divSideMenuGlobalSettingsWebClientSettings}       sideMenu-GlobalSettings-WebClientSettings
${divSideMenuGlobalSettingsWelcomePage}             sideMenu-GlobalSettings-WelcomePage

${divSideMenuModels}                        sideMenu-Models
${divSideMenuModelsAllModels}               sideMenu-Models-AllModels
${divSideMenuModelsEA2_800}                 xpath=//li[@id='sideMenu-Models-EA2_800']//span[text()='EA2_800']
${divSideMenuModelsEA2_800Open}             css=.sideMenuLevel2 .sideMenuWithChild.active > a
${divSideMenuModelsEA2_800Roles}            jquery=#sideMenu-Models-EA2_800-Roles>a
${linkLabel}                                //span[text()='Labels']
${divSideMenuModelLanguages}                sideMenu-Models-EA2_800-Languages
${divSideMenuSuggestedFields}               sideMenu-Models-EA2_800-SuggestedFields
${divSideMenuRefreshCycle}                  sideMenu-Models-EA2_800-RefreshCycle

${divSideMenuUsers}                         sideMenu-Users
${divSideMenuUsersAllUsers}                 sideMenu-Users-AllUsers
${divSideMenuUsersSessions}                 sideMenu-Users-Sessions
${divSideMenuUsersUserDefaults}             sideMenu-Users-UserDefaults

${divSideMenuAutomationTasks}               sideMenu-AutomationTasks
${divSideMenuAutomationTasks}               sideMenu-AutomationTasks-childs
${divSideMenuAutomationTasksDataStores}     sideMenu-AutomationTasks-DataStores-childs
${divSideMenuAutomationTasksTasks}          sideMenu-AutomationTasks-Tasks

${btnOpenModelEA2_800}                      jquery=.modelOverviewItem .btnLarge:eq(0)
${btnUploadLicense}                         css=#AddLicenseFileForm

${hypeOverview}                             css=#breadcrumbList > li > a
${hypeOverview_forclick}                    $("#breadcrumbList > li:nth-child(1) > a").trigger("click");

*** Keywords ***
Wait Until Overview Page Loaded
    Wait Side Menu Ready
    Wait Until Ajax Complete
    Wait Until Element Is Visible    ${btnOpenModelEA2_800}

Wait Side Menu Ready
    Wait Until Page Contains    Management Console Overview    ${TIMEOUT_MC_OVERVIEW}
    Wait MC Progress Bar Closed

Click Side Menu Global Settings
    Wait Until Element Is Visible    ${divSideMenuGlobalSettings}
    Wait MC Progress Bar Closed
    Sleep    2s
    Click Element    ${divSideMenuGlobalSettings}
    Wait Until Page Contains   Authentication
    Wait Until Page Contains   Languages
    Wait Until Page Contains   System settings
    Wait Until Page Contains   Welcome page
    Sleep    2s

Click Side Menu Authentication
    Wait MC Progress Bar Closed
    Wait Until Element Is Visible    ${divSideMenuGlobalSettingsAuthentication}
    Click Element    ${divSideMenuGlobalSettingsAuthentication}
    Wait Until Page Contains   Assign trusted webservers

Click Side Menu Languages
    Wait MC Progress Bar Closed
    Wait Until Element Is Visible    ${divSideMenuGlobalSettingsLanguages}
    Click Element    ${divSideMenuGlobalSettingsLanguages}
    Wait Until Page Contains    Language Settings

Click Side Menu Welcome Page
    Wait MC Progress Bar Closed
    Wait Until Element Is Visible    ${divSideMenuGlobalSettingsWelcomePage}
    Click Element    ${divSideMenuGlobalSettingsWelcomePage}
    Wait MC Progress Bar Closed

Click Side Menu Models
    Wait MC Progress Bar Closed
    Sleep    ${TIMEOUT_GENERAL}
    Wait Until Element Is Visible    ${divSideMenuModels}
    Click Element    ${divSideMenuModels}
    Wait Until Page Contains    All models
    Wait Until Page Contains    EA2_800
    Sleep    ${TIMEOUT_GENERAL}

Click Side Menu All Models
    Sleep    ${TIMEOUT_GENERAL}
    Wait Until Element Is Visible    ${divSideMenuModelsAllModels}
    Click Element    ${divSideMenuModelsAllModels}
    Wait MC Progress Bar Closed
    Wait Until Page Contains   All models currently active
    Sleep    ${TIMEOUT_GENERAL}

Click Side Menu Models EA2_800
    Wait Until Element Is Visible    ${divSideMenuModelsEA2_800}
    Click Element    ${divSideMenuModelsEA2_800}
    Wait Until Page Contains    Content settings
    Wait Until Page Contains    Languages
    Wait Until Page Contains    Roles
    Sleep    ${TIMEOUT_GENERAL}

Click Side Menu Labels
    Wait MC Progress Bar Closed
    Wait Until Page Contains Element    ${linkLabel}
    Click Element    ${linkLabel}
    Wait MC Progress Bar Closed
    Wait Until Page Contains    EA2_800 Labels

Click Side Menu Model Languages
    Wait MC Progress Bar Closed
    Wait Until Page Contains Element    ${divSideMenuModelLanguages}
    Click Element    ${divSideMenuModelLanguages}
    Wait MC Progress Bar Closed
    Wait Until Page Contains    Language settings

Click Side Menu Suggested Fields
    Wait MC Progress Bar Closed
    Wait Until Element Is Visible    ${divSideMenuSuggestedFields}
    Click Element    ${divSideMenuSuggestedFields}
    Wait MC Progress Bar Closed
    Wait Until Page Contains    Manage suggested fields for objects

Click Side Menu Refresh Cycle
    Wait MC Progress Bar Closed
    Wait Until Element Is Visible    ${divSideMenuRefreshCycle}
    Click Element    ${divSideMenuRefreshCycle}
    Wait MC Progress Bar Closed
    Wait Until Page Contains    Refresh cycle

Click Side Menu Models EA2_800 Roles
    Wait Until Page Contains Element    ${divSideMenuModelsEA2_800Roles}
    Click Element    ${divSideMenuModelsEA2_800Roles}
    Wait MC Progress Bar Closed
    Wait Until Page Contains   All available roles

Click Side Menu Users
    Wait Until Page Contains Element    ${divSideMenuUsers}
    Click Element    ${divSideMenuUsers}
    Wait Until Page Contains   All users
    Wait Until Page Contains   Sessions
    Wait Until Page Contains   User defaults
    Sleep    ${TIMEOUT_GENERAL}

Click Side Menu User Defaults
    Wait MC Progress Bar Closed
    Wait Until Page Contains Element    ${divSideMenuUsersUserDefaults}
    Click Element    ${divSideMenuUsersUserDefaults}
    Wait Until Page Contains   Add users
    Wait Until Page Contains   Mass change
    Sleep    ${TIMEOUT_GENERAL}

Click Side Menu Automation Tasks
    Wait MC Progress Bar Closed
    Wait Until Page Contains Element    ${divSideMenuAutomationTasks}
    Click Element    ${divSideMenuAutomationTasks}
    Sleep    ${TIMEOUT_GENERAL}

Click Side Menu Automation Tasks and Tasks
    Click Element    ${divSideMenuAutomationTasksTasks}
    Sleep    ${TIMEOUT_GENERAL}

Click Hyperlink Overview
    Wait Until Element Is Visible    ${hypeOverview}
    Execute Javascript  ${hypeOverview_forclick}

Click Open Model EA2_800 From Overview Page
    Wait Until Page Contains Element    ${btnOpenModelEA2_800}
    Click Element    ${btnOpenModelEA2_800}
    Wait MC Progress Bar Closed
    Wait Until Ajax Complete
    Page Should Contain Element    ${btnEA2800InFo}
    Page Should Contain Element    ${btnEA2800XtractorInFo}
    