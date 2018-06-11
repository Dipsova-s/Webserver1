*** Variables ***
${btnAddComment}        css=#contentSectionComment .btnAdd
${txtComment}           CommentText
${fileAttached}         fileAttached
${fileTestComment}      ${EXECDIR}/resources/test.png
${btnSaveComment}       SaveCommentBtn
${trRowComment}         css=#GridComment .k-grid-content tr

*** Keywords ***
Click Add New Comment
    Scroll Vertical    ${mainContent}    1000
    Click Element    ${btnAddComment}
    Wait Until Page Contains Element    ${txtComment}

Input Comment Text
    [Arguments]    ${text}
    Input Text    ${txtComment}    ${text}

Attach Commetn File
    Choose File    ${fileAttached}    ${fileTestComment}

Click Save Comment
    Click Element    ${btnSaveComment}
    Wait MC Progress Bar Closed
    Sleep    ${TIMEOUT_GENERAL}
    Wait Until Ajax Complete