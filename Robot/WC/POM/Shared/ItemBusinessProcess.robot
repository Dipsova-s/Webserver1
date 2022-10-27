*** Variables ***
${btnAddBusinessProcess}            css=.business-processes-selection .multiple-select-button
${divSelectedBusinessProcess}       css=.business-processes-selection .business-process-multi-select
${divAvailableBusinessProcess}      css=.multiple-select-list.business-processes .business-process-multi-select
${addBPBtnFromAddLabelsPopup}       css=.popupValidateBusinessProcess .section-labels .section-labels-body .business-processes-wrapper .business-processes-selection .multiple-select-items .multiple-select-button
${saveBtnFromAddLabelsPopup}        css=#btn-popupValidateBusinessProcess0
*** Keywords ***
Item Business Processes Should Be Read-only
    Page Should Not Contain Element   ${divSelectedBusinessProcess} .btn-remove	
	Page Should Not Contain Element   ${btnAddBusinessProcess}

Click Add Item Business Process
    Click Element  ${btnAddBusinessProcess}

Add Item Business Process
    [Arguments]  ${id}
    ${exists}  Is Element Exist  ${divAvailableBusinessProcess}.${id}
    Run Keyword If  ${exists} == ${True}  Click Element  ${divAvailableBusinessProcess}.${id}

Remove Item Business Process
    [Arguments]  ${id}
    ${exists}  Is Element Exist  ${divSelectedBusinessProcess}.${id}
    Run Keyword If  ${exists} == ${True}  Click Element  ${divSelectedBusinessProcess}.${id} .btn-remove

Add Business Processes
    [Arguments]   ${bps}   ${isAdhoc}=${False}
    Click Add Item Business Process
    :FOR  ${bp}  IN  @{bps}
    \  Add Item Business Process  ${bp}
    Press Keys  None  ESC
    Sleep  2s
    Run Keyword If  ${isAdhoc} == ${False}      Page Should Contain Toast Success

Add Business Process From Add Labels Popup And Save
    [Arguments]   ${bps}
    Sleep  2s
    Wait Until Element Is Visible   ${addBPBtnFromAddLabelsPopup}
    Page Should contain     Add a business process to save this Angle.
    Click Element     ${addBPBtnFromAddLabelsPopup}
    :FOR  ${bp}  IN  @{bps}
    \  Add Item Business Process  ${bp}
    Press Keys  None  ESC
    Sleep  2s
    Click Element    ${saveBtnFromAddLabelsPopup}

Delete Business Processes
    [Arguments]  ${bps}    ${isAdhoc}=${False}
    :FOR  ${bp}  IN  @{bps}
    \  Remove Item Business Process  ${bp}
    Sleep  2s
    Run Keyword If  ${isAdhoc} == ${False}      Page Should Contain Toast Success

Item Business Process Cannot Be Removed
    Page Should Contain Element  ${divSelectedBusinessProcess}.disabled.${id} .btn-remove

Item Business Process Should Be Selected
    [Arguments]  ${id}
    Page Should Contain Element  ${divSelectedBusinessProcess}.${id}

Item Business Process Should Not Be Selected
    [Arguments]  ${id}
    Page Should Not Contain Element  ${divSelectedBusinessProcess}.${id}