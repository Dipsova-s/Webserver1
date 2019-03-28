*** Variables ***
${btnSaveModels}                        css=.btnSave
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

#Tree Server Status
${btnTreeClsReport}                     jquery=li[data-id="Enum Report"]
${btnChildDeliNoteLine}                 jquery=li[data-id="Enum Report"] li:eq(0)
${txtReportGridFilter}                  ReportGridFilterBox
${txtReportGrid}                        jquery=.k-virtual-scrollable-wrap td

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
    Wait Until Page contains    Model server
    Wait Until Page Contains    EA2_800_Server1

Verify Status And Report EA2_800_Xtractor PopUp
    Click Element    ${btnEA2800XtractorInFo}
    Wait Until Ajax Complete
    Wait Until Page contains    Extractor

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

Click Confirmation
    Wait Until Page Contains Element    ${btnConfirmationModels} ${btnSubmitConfirm}
    Click Element    ${btnConfirmationModels} ${btnSubmitConfirm}
    Sleep    ${TIMEOUT_GENERAL}
    Wait MC Progress Bar Closed

Click Delete Models By ID
    [Arguments]    ${MODELS_ID}
    Click Edit Models By ID    ${MODELS_ID}
    Click Action In Grid By Name     ${MODELS_ID}    ${trRowAllModelGrid}    ${btnActionDeleteCustomIcons}
    Click Confirmation Delete

Click Confirmation Delete
    Wait Until Page Contains Element    ${btnConfirmationModels} ${btnSubmitConfirm}
    Click Element    ${btnConfirmationModels} ${btnSubmitConfirm}
    Wait MC Progress Bar Closed

Click Edit Models By ID
    [Arguments]    ${MODELS_ID}
    Click Show Action Dropdown In Grid By Name    ${MODELS_ID}    ${trRowAllModelGrid}

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