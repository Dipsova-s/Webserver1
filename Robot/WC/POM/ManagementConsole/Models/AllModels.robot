*** Variables ***
${btnSaveModels}                        xpath=//a[contains(@class, 'Save')]
${btnReloadModels}                      css=.btnReload

${trRowAllModelGrid}                    jquery=#mainContent tbody tr
${btnEditModelIcons}                    .btnGroupContainer>.btn
${btnActionDeleteCustomIcons}           .btnGroupInner .btnDelete

${btnCreateModels}                      jquery=#mainContent .btnAdd:contains(Set up a new model)

${btnConfirmationModels}                jquery=#popupConfirmation
${btnSubmitConfirm}                     .btnSubmit

${btnEA2800InFo}                        jquery=.modelInfoInstance a[data-title="Model server"]
${btnEA2800XtractorInFo}                jquery=.modelInfoInstance a[data-title="EA ETL Sandbox"]
${btnCloseModelPopUp}                   jquery=.k-window-actions a:eq(5)
${btnStopServer}                        jquery=.modelInfoInstance .btn:eq(1)
${popupConfirmationStopServer}          css=#popupConfirmation
${btnCloseStopServerPopUp}              jquery=#popupConfirmation .btnConfirmCancel

${pgbPopupModelServerReport}            css=#popupModelServer > div.k-loading-mask
${serverStatusMenu}                     jquery=#ServerStatusMenu

#Tree Server Status
${btnTreeClsReport}                     jquery=li[data-id="Enum Report"]
${btnChildDeliNoteLine}                 jquery=li[data-id="Enum Report"] li:eq(0)
${txtReportGridFilter}                  ReportGridFilterBox
${txtReportGrid}                        jquery=.k-virtual-scrollable-wrap td

${lnkCommunicationsModelOption}         xpath=//h4[contains(text(),'Server settings')]/parent::div/a[@href='#/Models/EA2_800/Communications/']
${lnkEAETLSandboxModelOption}           css=#sideMenu-Models-EA2_800-EAXtractor  .sideMenuLabel
${lnkRefreshCycleModelOption}           css=#sideMenu-Models-EA2_800-RefreshCycle  .sideMenuLabel

${lnkAngleWarningsModelOption}          css=#sideMenu-Models-EA2_800-AngleWarnings  .sideMenuLabel
${lnkContentParametersModelOption}      css=#sideMenu-Models-EA2_800-ContentParameters  .sideMenuLabel
${lnkLabelsModelOption}                 css=#sideMenu-Models-EA2_800-LabelCategories  .sideMenuLabel
${lnkLanguagesModelOption}              css=#sideMenu-Models-EA2_800-Languages  .sideMenuLabel
${lnkPackagesModelOption}               css=#sideMenu-Models-EA2_800-TemplateAngles  .sideMenuLabel
${lnkSuggestedFieldsModelOption}        css=#sideMenu-Models-EA2_800-SuggestedFields  .sideMenuLabel

${lnkRolesModelOption}                  css=#sideMenu-Models-EA2_800-Roles  .sideMenuLabel
${btnSubmitConfirmChangePage}           css=#popupConfirmation .btnSubmit

*** Keywords ***
Wait Until All Models Page Loaded
    Wait MC Progress Bar Closed
    Wait Until Ajax Complete
    Wait Until Element Is Visible    ${trRowAllModelGrid}:contains(EA2_800)

Wait Until Models Info Loaded
    Sleep    ${TIMEOUT_GENERAL}
    Wait MC Progress Bar Closed
    Wait Until Page Contains    EA2_800
    Wait Until Page Contains    Model options

Verify Status And Report EA2_800 PopUp
    Click Element    ${btnEA2800InFo}
    Wait Until Ajax Complete
    Wait Until Page Contains Element     ${serverStatusMenu}
    Wait Until Page Does Not Contain Element    ${pgbPopupModelServerReport}

Verify Status And Report EA2_800_Xtractor PopUp
    Click Element    ${btnEA2800XtractorInFo}
    Wait Until Ajax Complete
    Wait Until Page Contains Element     ${serverStatusMenu}
    Wait Until Page Does Not Contain Element    ${pgbPopupModelServerReport}

Click Close Model Report PopUp
    Click Element    ${btnCloseModelPopUp}

Click Create Models
    Click Element    ${btnCreateModels}
    Sleep    ${TIMEOUT_GENERAL}
    Wait MC Progress Bar Closed

Click Save Models
    Wait Until Page Contains Element    ${btnSaveModels}
    Click Element    ${btnSaveModels}
    Click Confirmation

Click Edit Save Models
    Sleep    ${TIMEOUT_GENERAL}
    Wait Until Element Is Enabled    ${btnSaveModels}
    Click Element    ${btnSaveModels}
    ${passed}=  Run Keyword And Return Status   Element Should Be Visible   ${btnConfirmationModels}
    Run Keyword If      ${passed}==True   Click Element  ${btnSubmitConfirm}
    Wait Progress Bar Closed

Click Confirmation
    Wait Until Page Contains Element    ${btnConfirmationModels} ${btnSubmitConfirm}
    Click Element    ${btnConfirmationModels} ${btnSubmitConfirm}
    Sleep    ${TIMEOUT_GENERAL}
    Wait MC Progress Bar Closed

Click Delete Models By ID
    [Arguments]    ${MODELS_ID}
    sleep   3s
    Wait Until Page Contains Element    ${btnReloadModels}
    Click Element       ${btnReloadModels}
    Wait Until Page Contains Element        ${trRowAllModelGrid}
    Click Show Action Dropdown In Grid By Name    ${MODELS_ID}    ${trRowAllModelGrid}
    Click Action In Grid By Name     ${MODELS_ID}    ${trRowAllModelGrid}     ${btnActionDeleteCustomIcons}
    Click Confirmation Delete

Click Confirmation Delete
    Wait Until Page Contains Element    ${btnConfirmationModels} ${btnSubmitConfirm}
    Click Element    ${btnConfirmationModels} ${btnSubmitConfirm}
    Wait MC Progress Bar Closed

Click Edit Models By ID
    [Arguments]    ${MODELS_ID}
    Click Show Action Dropdown In Grid By Name    ${MODELS_ID}    ${trRowAllModelGrid}
    Click Action In Grid By Name     ${MODELS_ID}    ${trRowAllModelGrid}     ${btnEditModelIcons}

Click Tree Class Report
    Click Element    ${btnTreeClsReport}

Click Class DeliveryNoteLine Report
    Wait Until Page Contains Element    ${btnChildDeliNoteLine}
    Click Element    ${btnChildDeliNoteLine}
    Wait Until Ajax Complete
    Wait Until Page Contains Element    ${txtReportGridFilter}

Verify Report Filter
    [Arguments]    ${keyword}
    Input Text    ${txtReportGridFilter}    ${keyword}
    Wait Until Page Contains Element    ${txtReportGrid}:contains("${keyword}")

Click Stop Server
    Page Should Contain Element    ${btnStopServer}
    Click Element    ${btnStopServer}

Click Close Pop Up Stop Server
    Click Element    ${btnCloseStopServerPopUp}

Verify the model options displayed
    Wait until page contains    Server settings
    Page Should Contain Element     ${lnkCommunicationsModelOption}
    Page Should Contain Element     ${lnkEAETLSandboxModelOption}
    Page Should Contain Element     ${lnkRefreshCycleModelOption}

    Wait until page contains    Content settings
    Page Should Contain Element     ${lnkAngleWarningsModelOption}
    Page Should Contain Element     ${lnkContentParametersModelOption}
    Page Should Contain Element     ${lnkLabelsModelOption}
    Page Should Contain Element     ${lnkLanguagesModelOption}
    Page Should Contain Element     ${lnkPackagesModelOption}
    Page Should Contain Element     ${lnkSuggestedFieldsModelOption}

    Wait until page contains    Role settings
    Page Should Contain Element     ${lnkRolesModelOption}

Click on Communications model options
    Wait Until Element Is Visible    ${lnkCommunicationsModelOption}
    Wait MC Progress Bar Closed
    Click Element    ${lnkCommunicationsModelOption}
    Wait Until Page Contains    Company information

Click on EA ETL Sandbox model option
    Page Should Contain Element    ${lnkEAETLSandboxModelOption}
    Click Element        ${lnkEAETLSandboxModelOption}
    Wait until page contains    SAP connection settings

Click on Refresh Cycle model option
    Page Should Contain Element    ${lnkRefreshCycleModelOption}
    Click Element        ${lnkRefreshCycleModelOption}
    Wait until page contains    Refresh cycle history

Click on Angle Warnings model option
    Page Should Contain Element    ${lnkAngleWarningsModelOption}
    Click Element        ${lnkAngleWarningsModelOption}
    Check and confirm the confirmation popup
    Wait until page contains    Published items
    
Click on Content parameters model option
    Page Should Contain Element    ${lnkContentParametersModelOption}
    Click Element        ${lnkContentParametersModelOption}
    Wait until page contains    Database Manager
    
Click on Label model option
    Page Should Contain Element    ${lnkLabelsModelOption}
    Click Element        ${lnkLabelsModelOption}
    Wait until page contains    EA2_800 Labels
    
Click on Languages model option
    Page Should Contain Element    ${lnkLanguagesModelOption}
    Click Element        ${lnkLanguagesModelOption}
    Wait until page contains    Language settings
    
Click on Packages model option
    Page Should Contain Element    ${lnkPackagesModelOption}
    Click Element        ${lnkPackagesModelOption}
    Wait until page contains    Packages history
    
Click on Suggested fields model option
    Page Should Contain Element    ${lnkSuggestedFieldsModelOption}
    Click Element        ${lnkSuggestedFieldsModelOption}
    Wait until page contains    Manage suggested fields for objects
    
Click on Role model option
    Page Should Contain Element    ${lnkRolesModelOption}
    Click Element        ${lnkRolesModelOption}
    Wait until page contains    All available roles on EA2_800

Check and confirm the confirmation popup
    ${hasButton}  Is Element Exist  ${btnSubmitConfirmChangePage}
    Run Keyword If  ${hasButton}  Click Element       ${btnSubmitConfirmChangePage}