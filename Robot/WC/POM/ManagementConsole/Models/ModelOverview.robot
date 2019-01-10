*** Variables ***
${pgbModelStatus}                 jquery=#modelInfoStatus div.k-loading-mask

*** Keywords ***
Wait Until Model Overview Page Loaded
    Wait Until Ajax Complete
    Sleep    ${TIMEOUT_GENERAL}
    Wait Until Page Does Not Contain Element    ${pgbModelStatus}