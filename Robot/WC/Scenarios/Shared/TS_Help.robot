*** Settings ***
Resource            ${EXECDIR}/WC/POM/Shared/Help.robot

*** Keywords ***
Roll back to WC page
    Select Window   title=Angles for SAP - Search page   timeout=15s
    Wait Until Ajax Complete

Roll back to ITMC page
    Select Window   title=IT Management Console   timeout=15s
    Wait Until Ajax Complete