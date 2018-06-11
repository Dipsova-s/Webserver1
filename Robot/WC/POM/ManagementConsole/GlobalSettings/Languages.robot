*** Variables ***
${trRowInLanguageGrid}                jquery=#AvailableLanguagesGrid tbody tr
${btnSaveLanguages}                   css=.btnSave
${addNewLanguage}                     css=#LanguageSettingsForm .btnAdd
${trNewLanguageRow}                   .newRow
${ddlChooseLanguage}                  span.UnableLanguages
${btnDeleteLanguage}                  .btnDelete

#Model Language Setting
${trRowInModelLanguageGrid}           jquery=#ActiveLanguagesGrid tbody tr

#Delete Custom Icons Popup
${btnConfirmDeleteLanguage}           css=#popupConfirmAction .btnSubmit

*** Keywords ***
Wait Until Languages Page Loaded
    Wait Until Ajax Complete
    Wait Until Page Contains Element    ${addNewLanguage}
    Sleep    ${TIMEOUT_GENERAL}

Click Add New Language
    Click Element    ${addNewLanguage}
    Sleep    ${TIMEOUT_GENERAL}

Click Delete Language By Language Name
    [Arguments]    ${languageName}
    Click Action In Grid By Name     ${languageName}    ${trRowInLanguageGrid}    ${btnDeleteLanguage}

Click Delete New Language
    Wait Until Page Contains Element    ${trRowInLanguageGrid} ${trNewLanguageRow} ${btnDeleteLanguage}
    Click Element    ${trRowInLanguageGrid} ${trNewLanguageRow} ${btnDeleteLanguage}

Select Language Dropdown
    [Arguments]    ${languageName}
    Wait Until Page Contains Element    ${trRowInLanguageGrid} ${ddlChooseLanguage}
    Select Dropdown By InnerText    ${trRowInLanguageGrid} ${ddlChooseLanguage}    ${languageName}

Click Save Language Without Delete
    Wait Until Page Contains Element    ${btnSaveLanguages}
    Click Element    ${btnSaveLanguages}
    Wait MC Progress Bar Closed

Click Save And Delete Language
    Wait Until Page Contains Element    ${btnSaveLanguages}
    Click Element    ${btnSaveLanguages}
    Wait Until Page Contains    Deleted Languages
    Click Element    ${btnConfirmDeleteLanguage}
    Wait MC Progress Bar Closed
