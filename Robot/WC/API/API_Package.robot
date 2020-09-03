*** Settings ***
Resource            ${EXECDIR}/WC/API/API_Utility.robot
Resource            ${EXECDIR}/WC/API/API_Task.robot

*** Keywords ***
Activate Model Package
    [Arguments]  ${uri}  ${name}
    ${package}  Get Package By Name  ${uri}  ${name}
    ${packageUri}  Get Uri From Response  ${package}
    ${isActive}  Get From Dictionary  ${package}  active
    ${data}  Set variable  {"actions":[{"action_type":"activate_package","arguments":[{"name":"model","value":"EA2_800"},{"name":"package","value":"${packageUri}"}],"approval_state":"approved"}],"name":"${name}","start_immediately":true,"delete_after_completion":false,"enabled":true,"max_run_time":0}
    Run Keyword If  ${isActive}==${FALSE}  Execute Task  ${data}

Get Package By Name
    [Arguments]  ${uri}  ${name}
    ${body}  Send GET  ${uri}?q=${name}
    ${packages}  Get From Dictionary  ${body}  packages
    Should Not Be Empty  ${packages}
    ${package}  Get From List  ${packages}  0
    [Return]   ${package}