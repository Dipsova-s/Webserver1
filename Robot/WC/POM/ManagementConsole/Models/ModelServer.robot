*** Variables ***
${trRowInModelServerGrid}             jquery=#AllModelServerGridContainer tbody tr

${btnDownloadModelServer}             .btnDownload
${btnInfoModelServer}                 .btnInfo

#Model Server Status Popup
${btnCloseModelServer}                 css=.k-window .k-i-close
${btnModelServerStatus}                jquery=#ServerStatusMenu_tv_active[data-id=Status"]
${btnModelServerGeneralReport}         jquery=#ServerStatusMenu_tv_active[data-id="General Report"]
${btnModelServerClassReport}           jquery=#ServerStatusMenu_tv_active[data-id="Class Report"]
${btnModelServerEnumReport}            jquery=#ServerStatusMenu_tv_active[data-id="Enum Report"]

*** Keywords ***

Click Download Model Server By Model Server Name
    [Arguments]    ${ModelServerName}
    Click Action In Grid By Name     ${ModelServerName}    ${trRowInModelServerGrid}    ${btnDownloadModelServer}

Click Download Model Server By Index
    [Arguments]    ${index}
    Click Action In Grid By Index     ${index}    ${trRowInModelServerGrid}    ${btnDownloadModelServer}

Click Info Model Server By Model Server Name
    [Arguments]    ${ModelServerName}
    Click Action In Grid By Name     ${ModelServerName}    ${trRowInModelServerGrid}    ${btnInfoModelServer}

Click Info Model Server By Index
    [Arguments]    ${index}
    Click Action In Grid By Index     ${index}    ${trRowInModelServerGrid}    ${btnInfoModelServer}



