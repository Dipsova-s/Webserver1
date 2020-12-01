*** Settings ***
Resource            ${EXECDIR}/WC/Scenarios/Shared/TS_Login.robot
Suite Teardown      Logout WC Then Close Browser
Force Tags          smk_wc_s

*** Test Cases ***
Login to EA application via OKTA authorization
    Login via OKTA page