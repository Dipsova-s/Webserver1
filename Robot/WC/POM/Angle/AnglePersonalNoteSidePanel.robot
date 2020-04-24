*** Variables ***
${txtPersonalNote}                      txtareaYourNote
${divPersonalNote}                      .section-personal-note-body

*** Keywords ***
Input Personal Note
    [Arguments]   ${Text}    ${isAdhoc}={False}
    Click Element    ${divTabContentAngle} ${divPersonalNote}  
    Input Text    ${txtPersonalNote}    ${Text}
    Press Keys    ${txtPersonalNote}    RETURN   
    Run Keyword If  ${isAdhoc} == ${False}  Wait Until Ajax Complete
    ...     Page Should Contain Toast Success