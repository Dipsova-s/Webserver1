*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With Admin User
Suite Teardown      Logout WC Then Close Browser
Force Tags          smk_wc_i    acc_wc_i    smk_content_i  acc_wc_aci_i

*** Test Cases ***
Import WC Package
    ${directory}    Set Variable    ${EXECDIR}/resources/setup/
    ${ids}    Set Variable    ROBOT_*
    Import Item From Directory    ${directory}    ${ids}
    