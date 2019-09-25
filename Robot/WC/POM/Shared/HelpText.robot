*** Variables ***
${pgbHelpTextPopup}                      css=#HelpTextPopup .k-loading-mask
${divHelpTextPopup}                      css=#HelpTextPopup .helpTextContainer
${btnCloseHelpTextPopup}                 css=.helpTextPopup .k-window-actions .k-i-close
${pgbHelpTextPage}                       css=#MainContent.busy
${divHelpTextPage}                       css=#MainContent.helpTextContainer

*** Keywords ***
Wait Until Help Text Popup Loaded
    Sleep    ${TIMEOUT_GENERAL}
    Wait Until Ajax Complete
    Wait Until Page Does Not Contain Element    ${pgbHelpTextPopup}
    Page Should Contain Element  ${divHelpTextPopup}
    
Wait Until Help Text Page Loaded
    Sleep    ${TIMEOUT_GENERAL}
    Wait Until Page Does Not Contain Element    ${pgbHelpTextPage}
    Page Should Contain Element  ${divHelpTextPage}

Click Help Text Link
    [Arguments]  ${helpId}
    Click Link  jquery=.helpTextContainer a[href$="id=${helpId}"]
    Select Window  NEW
    Wait Until Help Text Page Loaded

Close Help Text Popup
    Click Element  ${btnCloseHelpTextPopup}