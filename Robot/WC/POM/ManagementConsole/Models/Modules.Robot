*** Variables ***
${btnSaveModels}                        css=.btnSave
${btnReloadModels}                      css=.btnReload
${btnExpandAllModules}                  css=.btnExpandAll

${txtFilterModules}                     css=#ModuleFilterBox
${txtFilterModulesPopup}                css=#ModuleExtensionFilterBox

${nameRowModulesSAPSCM}                 jquery=#name-LicenseLabelSAPSCM:visible
${btnEditModulesSAPSCM}                 jquery=#longtext-ModuleOperation .btnAdd
${btnUpdateModulesPopup}                jquery=#popupModuleEdit .btnUpdate
${btnCloseModulesPopup}                 jquery=#popupModuleEdit .btnClose
${btnIconModulesInfo}                   jquery=#description-ModuleOperation .btnInfo

${kwdModulesFilter}                     jquery=#name-ModuleGRC_Basics .highlight
${chkModulesSAPSCM}                     jquery=#name-ModuleOperation .chk

${btnConfirmSaveModules}                jquery=#popupConfirmSave .btn:contains(OK)

${trRowModulesPopUpGrid}                jquery=#ModuleExtensionInfoGrid tbody tr
${chkModulesFilterPopup}                input[type="checkbox"]
${UnSelectModulesFilterPopup}           input[type="checkbox"]:checked

${btnEditModulesPopUpSAPSCM}            jquery=#longtext-ModuleOperation .btnLongText

#Sort Modules Alphabetically
${txtOM}                                jquery=table[role="treegrid"] tbody tr
${txtPA}                                jquery=table[role="treegrid"] tbody tr

*** Keywords ***
Wait Until All Modules Page Loaded
    Sleep    ${TIMEOUT_GENERAL}
    Wait Progress Bar Closed
    Wait Until Ajax Complete
    Wait Until Page Contains Element    ${nameRowModulesSAPSCM}
    Wait Until Ajax Complete

Put Keyword ON Modules Filter
    [Arguments]    ${keyword}
    Clear Element Text    ${txtFilterModules}
    Wait Until Ajax Complete
    Input Text    ${txtFilterModules}    ${keyword}

Click Reload Modules
    Wait Until Page Contains Element    ${btnReloadModels}
    Wait Until Element Is Visible    ${btnReloadModels}
    Click Element    ${btnReloadModels}
    Wait Until All Modules Page Loaded

Click Expand SAPSCM
    Wait Until Page Contains Element    ${nameRowModulesSAPSCM}
    ${selector}    Get JQuery Selector    ${nameRowModulesSAPSCM}
    Execute Javascript     return $("${selector}").closest('tr').click()
    Sleep    2s

Select Operations & confirmations CheckBox
    Select Checkbox    ${chkModulesSAPSCM}
    Sleep    1s
    Wait Until Ajax Complete

Click Save Modules
    ${chkCheckBoxExist}    Is Element Visible    ${btnConfirmSaveModules}
    Run Keyword If    ${chkCheckBoxExist} == True    Click Element    ${btnConfirmSaveModules}
    Wait Until Page Contains Element    ${btnSaveModels}
    Wait Until Element Is Visible    ${btnSaveModels}
    Click Element    ${btnSaveModels}
    Sleep    1s
    Wait Until All Modules Page Loaded

Click Edit Long Text for Operations & confirmations
    ${countEnabled}    Get Element Count    ${btnEditModulesPopUpSAPSCM}
    Run Keyword If    ${countEnabled} == 1    UnSelect Edit Long Text for Operations & confirmations
    Click Edit Long Text PopUp

Click Edit Long Text PopUp
    Click Element    ${btnEditModulesSAPSCM}
    Wait until page contains    Operations & confirmations

Put Keyword ON Modules Filter PopUp
    [Arguments]    ${keyword}
    Input Text    ${txtFilterModulesPopup}    ${keyword}

Select Long Text CheckBox After Filter And Save
    Select Checkbox    ${trRowModulesPopUpGrid} ${chkModulesFilterPopup}
    Click Element    ${btnUpdateModulesPopup}
    Sleep    1s
    Wait Until Ajax Complete

UnSelect Operations & confirmations CheckBox
    Wait Until Page Contains Element    ${chkModulesSAPSCM}
    Unselect Checkbox    ${chkModulesSAPSCM}
    Wait MC Progress Bar Closed
    Wait Until Ajax Complete

UnSelect Edit Long Text for Operations & confirmations
    Click Element    ${btnEditModulesPopUpSAPSCM}
    Wait Until Ajax Complete
    Wait until page contains    Operations & confirmations
    UnSelect Long Text CheckBox CheckBox

UnSelect Long Text CheckBox CheckBox
    Sleep    2s
    Unselect Checkbox    ${trRowModulesPopUpGrid} ${UnSelectModulesFilterPopup}
    Click Element    ${btnUpdateModulesPopup}
    Wait Until Ajax Complete
