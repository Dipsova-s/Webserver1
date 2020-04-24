*** Variables ***
${divContentWrapper}               jquery=.content-wrapper
${divSidePanel}                    jquery=.content-wrapper .side-content
${btnToggleSidePanel}              jquery=.toggle-sidebar
${divResizeSidePanel}              jquery=.content-wrapper > .k-splitbar-horizontal
${divActiveTab}					   jquery=#TabDetails .tab-menu.active

*** Keywords ***
Click Toggle Side Panel
    Click Element   ${btnToggleSidePanel}
    Sleep    ${TIMEOUT_GENERAL}
    Wait Until Ajax Complete

Open Side Panel
    ${isPanelClosed}   Is Element Has CssClass    ${divContentWrapper}   full
    Run Keyword If   ${isPanelClosed} == True     Click Toggle Side Panel

Close Side Panel
    ${isPanelClosed}   Is Element Has CssClass    ${divContentWrapper}   full
    Run Keyword If   ${isPanelClosed} == False    Click Toggle Side Panel

Resize Side Panel
    [Arguments]   ${distance}
    Mouse Over   ${divContentWrapper}
    Drag And Drop By Offset   ${divResizeSidePanel}   ${distance}   0
    Sleep    ${TIMEOUT_GENERAL}
    Wait Until Ajax Complete

Get Side Panel Width
    ${width}  ${height}  Get Element Size  ${divSidePanel}
    [Return]  ${width}

Side Panel Should Be Opened
    Page Should Contain Element  ${divContentWrapper}:not(.full)

Side Panel Should Be Closed
    Page Should Contain Element  ${divContentWrapper}.full

Get Side Panel Active Tab
    ${text}     Get Text        ${divActiveTab}
    [Return]    ${text}

Expand Section Panel
    [Arguments]  ${element}
    ${close}  Is Element Has CssClass  ${element}  close
    Run Keyword If  ${close}==${True}  Click Element  ${element}

Collapse Section Panel
    [Arguments]  ${element}
    ${open}  Is Element Has CssClass  ${element}  open
    Run Keyword If  ${open}==${True}  Click Element  ${element}

Section Panel Should Expanded
    [Arguments]  ${element}
    Page Should Contain Element  ${element}.open

Section Panel Should Collapsed
    [Arguments]  ${element}
    Page Should Contain Element  ${element}.close