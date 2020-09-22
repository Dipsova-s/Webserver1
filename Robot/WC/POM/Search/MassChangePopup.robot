*** Variables ***
#Mass change popup
${divMassChangePopup}               css=#popupMassChangePopup
${pgbMassChangePopup}               css=#popupMassChangePopup > div.k-loading-mask

${chkMassChangePrivateNote}         AnglePrivateNoteCheckbox
${txtMassChangePrivateNote}         AnglePrivateNote
${chkMassChangeIsStarred}           Starred
${chkMassChangeIsPublished}         Published
${chkMassChangeIsValidate}          Validated
${chkMassChangeIsTemplate}          Template

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
    Wait Mass Change Popup Document Loaded
    Select Radio Button    ${chkMassChangeIsStarred}    true

Click Set Not Starred Via Mass Change Popup
    Wait Mass Change Popup Document Loaded
    Select Radio Button    ${chkMassChangeIsStarred}    false

Click Set Published Via Mass Change Popup
    Wait Mass Change Popup Document Loaded
    Select Radio Button    ${chkMassChangeIsPublished}    true

Click Set Private Via Mass Change Popup
    Wait Mass Change Popup Document Loaded
    Select Radio Button    ${chkMassChangeIsPublished}    false

Click Set Validated Via Mass Change Popup
    Wait Mass Change Popup Document Loaded
    Select Radio Button    ${chkMassChangeIsValidate}    true

Click Set Not Validated Via Mass Change Popup
    Wait Mass Change Popup Document Loaded
    Select Radio Button    ${chkMassChangeIsValidate}    false

Click Set Template Via Mass Change Popup
    Wait Mass Change Popup Document Loaded
    Select Radio Button    ${chkMassChangeIsTemplate}    true

Click Set Angle Via Mass Change Popup
    Wait Mass Change Popup Document Loaded
    Select Radio Button    ${chkMassChangeIsTemplate}    false

Click Save Mass Change
    Click Element    ${btnSaveMassChange}
    Wait Mass Change Report Popup Document Loaded

Wait Mass Change Report Popup Document Loaded
    Wait Until Page Contains Element    ${divMassChangeReportPopup}
    Wait Until Element Is Visible    ${divMassChangeReportPopup}

Click Close Mass Change Report Popup
    Click Element    ${btnCloseMassChangeReportPopup}
    Wait Progress Bar Search Closed