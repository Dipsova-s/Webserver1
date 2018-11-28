*** Settings ***
Resource            ${EXECDIR}/WC/API/API_Utility.robot

*** Keywords ***
Get Components
    ${body}    Send GET    /csm/componentservices
    [Return]    ${body}

Get Components By MC
    Create Context: MC
    ${systemComponents}    Send GET    ${PATH_MC}/component/getcomponents?modelId=
    ${systemComponentData}    Get From Dictionary    ${systemComponents}    Data

    Create Context: MC
    ${modelComponents}    Send GET    ${PATH_MC}/component/getcomponents?modelId=EA2_800
    ${modelComponentData}    Get From Dictionary    ${modelComponents}    Data

    ${components}    Combine Lists    ${systemComponentData}    ${modelComponentData}

    [Return]    ${components}