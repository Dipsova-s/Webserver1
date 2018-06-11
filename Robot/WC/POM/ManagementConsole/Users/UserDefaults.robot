*** Variables ***
${btnSaveUserDefaults}                                   css=.btnSave
${divDefaultSettingForBusinessProcessBar}                jquery=.businessProcesses


*** Keywords ***
Click Set Default Setting For Business Process Bar
    [Arguments]    ${businessProcessName}
    Wait Until Page Contains Element    ${divDefaultSettingForBusinessProcessBar}
    Wait Until Element Contains    ${divDefaultSettingForBusinessProcessBar}    ${businessProcessName}
    Click Element    ${divDefaultSettingForBusinessProcessBar} div:contains("${businessProcessName}")

Save User Defaults
    Wait Until Page Contains Element    ${btnSaveUserDefaults}
    Wait MC Progress Bar Closed
    Click Element    ${btnSaveUserDefaults}
    Wait MC Progress Bar Closed