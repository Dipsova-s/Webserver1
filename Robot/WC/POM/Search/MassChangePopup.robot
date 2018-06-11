*** Variables ***
#Mass change popup
${divMassChangePopup}               css=#popupMassChangePopup
${pgbMassChangePopup}               css=#popupMassChangePopup > div.k-loading-mask

${chkMassChangePrivateNote}         AnglePrivateNoteCheckbox
${txtMassChangePrivateNote}         AnglePrivateNote
${chkMassChangeIsStarred}           IsStarred-checkbox
${chkMassChangeIsPublished}         AngleIsPublished-checkbox
${chkMassChangeIsValidate}          AngleIsValidate-checkbox
${chkMassChangeIsTemplate}          AngleIsTemplate-checkbox

${btnSaveMassChange}                btn-popupMassChangePopup1
${btnCloseMassChangePopup}          btn-popupMassChangePopup0

#Mass change report popup
${divMassChangeReportPopup}         popupMassChangeReport
${btnCloseMassChangeReportPopup}    btn-popupMassChangeReport0

*** Keywords ***
Wait Mass Change Popup Document Loaded
    Wait Until Page Contains Element    ${divMassChangePopup}
    Wait Until Page Does Not Contain Element    ${pgbMassChangePopup}

Open Mass Change Popup
    Click Search Action Mass Change
    Wait Mass Change Popup Document Loaded

Click Close Mass Change Popup
    Click Element    ${btnCloseMassChangePopup}

Input Private Note Via Mass Change Popup
    [Arguments]    ${privateNote}
    Wait Mass Change Popup Document Loaded
    Select Checkbox    ${chkMassChangePrivateNote}
    Input Text    ${txtMassChangePrivateNote}    ${privateNote}

Click Set Starred Via Mass Change Popup
    Wait Until Element Exist And Visible    ${chkMassChangeIsStarred}
    Click Element    ${chkMassChangeIsStarred}

Click Set Not Starred Via Mass Change Popup
    Click Set Starred Via Mass Change Popup
    Click Set Starred Via Mass Change Popup

Click Set Published Via Mass Change Popup
    Wait Until Element Exist And Visible    ${chkMassChangeIsPublished}
    Click Element    ${chkMassChangeIsPublished}

Click Set Private Via Mass Change Popup
    Click Set Published Via Mass Change Popup
    Click Set Published Via Mass Change Popup

Click Set Validated Via Mass Change Popup
    Wait Until Element Exist And Visible    ${chkMassChangeIsValidate}
    Click Element    ${chkMassChangeIsValidate}

Click Set Not Validated Via Mass Change Popup
    Click Set Validated Via Mass Change Popup
    Click Set Validated Via Mass Change Popup

Click Set Template Via Mass Change Popup
    Wait Until Element Exist And Visible    ${chkMassChangeIsTemplate}
    Click Element    ${chkMassChangeIsTemplate}

Click Set Angle Via Mass Change Popup
    Click Set Template Via Mass Change Popup
    Click Set Template Via Mass Change Popup

Click Save Mass Change
    Click Element    ${btnSaveMassChange}
    Wait Mass Change Report Popup Document Loaded

Wait Mass Change Report Popup Document Loaded
    Wait Until Page Contains Element    ${divMassChangeReportPopup}
    Wait Until Element Is Visible    ${divMassChangeReportPopup}

Click Close Mass Change Report Popup
    Click Element    ${btnCloseMassChangeReportPopup}
    Wait Progress Bar Search Closed