*** Settings ***
Resource            ${EXECDIR}/WC/API/API_Utility.robot

*** Keywords ***
Get Label Categories
    [Arguments]  ${q}=${EMPTY}  ${multilingual}=no
    ${body}    Send GET    /labelcategories?q=${q}&multilingual=${multilingual}
    [Return]    ${body}

Create Label Category
    [Arguments]   ${data}  ${multilingual}=no
    ${body}    Send POST    /labelcategories?redirect=no&multilingual=${multilingual}  ${data}
    [Return]    ${body}

Create Label
    [Arguments]  ${uri}  ${data}  ${multilingual}=no
    ${body}    Send POST    ${uri}?redirect=no&multilingual=${multilingual}  ${data}
    [Return]    ${body}

Create Label Category With Label
    [Arguments]   ${category}  ${label}  ${multilingual}=no
    ${categoryBody}  Create Label Category  ${category}  ${multilingual}
    ${labelsUri}   Get From Dictionary    ${categoryBody}    labels
    Restore Created Context
    Create Label  ${labelsUri}  ${label}  ${multilingual}
    [Return]    ${categoryBody}