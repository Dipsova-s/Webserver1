*** Settings ***
Resource    		${EXECDIR}/WC/POM/Search/SearchPage.robot

*** Keywords ***
Search Business Process
    [Arguments]    ${business_process_name}
    Run Keyword If    '${business_process_name}' == 'P2P'    Click Search Business Process P2P
    Run Keyword If    '${business_process_name}' == 'S2D'    Click Search Business Process S2D
    Run Keyword If    '${business_process_name}' == 'O2C'    Click Search Business Process O2C
    Run Keyword If    '${business_process_name}' == 'F2R'    Click Search Business Process F2R
    Run Keyword If    '${business_process_name}' == 'PM'    Click Search Business Process PM
    Run Keyword If    '${business_process_name}' == 'QM'    Click Search Business Process QM
    Run Keyword If    '${business_process_name}' == 'HCM'    Click Search Business Process HCM
    Run Keyword If    '${business_process_name}' == 'GRC'    Click Search Business Process GRC
    Run Keyword If    '${business_process_name}' == 'IT'    Click Search Business Process IT
    ${result_total_after_cick}    Get Text     SearchTotal
    ${result_total_after_cick_integer}    Convert To Integer    ${result_total_after_cick}
    Should Be True    ${result_total_after_cick_integer} >= 0
