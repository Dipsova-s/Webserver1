*** Variables ***
${btnAddComment}        xpath=//div[@id='contentSectionComment']//a[text()='Add comment']
${txtComment}           CommentText
${fileAttached}         fileAttached
${fileTestComment}      ${EXECDIR}/resources/test.png
${btnSaveComment}       SaveCommentBtn
${trRowComment}         css=#GridComment .k-grid-content tr
${ActionEditBtn}        //div[@id='contentSectionComment']//table//tbody/tr[1]//div[@class='btnGroupInner']/a[1]
${ActionDeleteBtn}      //div[@id='contentSectionComment']//table//tbody/tr[1]//div[@class='btnGroupInner']/a[2]
${DeleteConfirmBtn}     //a[@class='btn btnPrimary btnSubmit']
${CloseCommentBox}      (//span[text()='Close'])[3]

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

Click Edit comment and verify
    [Arguments]    ${text}
    Wait for element and click          ${ActionEditBtn}
    Textarea Should Contain      ${txtComment}      ${text}     message=Entered comment is not matched
    Log   Comment verified successfully
    Wait for element and click       ${CloseCommentBox}

Delete comment
    Wait for element and click       ${ActionDeleteBtn}
    Wait for element and click       ${DeleteConfirmBtn}
    Log   Comment deleted successfully

Wait for element and click
    [Arguments]     ${locator}
    Wait Until Page Contains Element    ${locator}    timeout=5s
    Click Element   ${locator}