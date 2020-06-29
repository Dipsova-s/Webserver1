*** Variables ***
${divTagWrapper}                    jquery=.k-widget.tags-input
${txtFilterTag}                     ${divTagWrapper} .k-input
${divTagSpinner}                    ${divTagWrapper} .loader-spinner-inline
${divSelectedTag}                   ${divTagWrapper} .item-label
${btnDeleteTag}                     .k-select
${divTagListWrapper}                jquery=.k-tagtextbox-list-container
${divTagItem}                       ${divTagListWrapper} .k-list .k-item
${divTagItemNew}                    ${divTagListWrapper} .k-footer .k-item

*** Keywords ***
Wait Until Tags Saved
    [Arguments]  ${isAdhoc}=${False}
    Sleep  2s
    Run Keyword If  ${isAdhoc} == ${False}      Page Should Contain Toast Success

Filter Item Tag
    [Arguments]  ${filter}
    Input Text  ${txtFilterTag}  ${filter}
    Sleep  ${TIMEOUT_LARGEST}
    Wait Until Element Is Not Visible  ${divTagSpinner}

Submit Selected Tags
    [Arguments]  ${isAdhoc}=${False}
    Press Keys  None  ESC
    Wait Until Tags Saved  ${isAdhoc}

Select Tag
    [Arguments]  ${name}
    Click Element  ${divTagItem}:contains(${name})

Select Tags
    [Arguments]  ${names}   ${isAdhoc}=${False}
    :FOR  ${name}  IN  @{names}
    \  Select Tag  ${name}
    Submit Selected Tags  ${isAdhoc}

Select New Tag
    [Arguments]  ${isAdhoc}=${False}
    Click Element  ${divTagItemNew}
    Submit Selected Tags  ${isAdhoc}

Remove Tag
    [Arguments]  ${name}
    Click Element  ${divSelectedTag}:contains(${name}) ${btnDeleteTag}

Remove Tags
    [Arguments]  ${names}   ${isAdhoc}=${False}
    :FOR  ${name}  IN  @{names}
    \  Remove Tag  ${name}
    Submit Selected Tags  ${isAdhoc}

Tag Should Be Selected
    [Arguments]  ${name}
    Page Should Contain Element  ${divSelectedTag}:contains(${name})

Tag Should Not Be Selected
    [Arguments]  ${name}
    Page Should Not Contain Element  ${divSelectedTag}:contains(${name})

Tag Should Be Available
    [Arguments]  ${name}
    Page Should Contain Element  ${divTagItem}:contains(${name})

Tag Should Not Be Available
    [Arguments]  ${name}
    Page Should Not Contain Element  ${divTagItem}:contains(${name})