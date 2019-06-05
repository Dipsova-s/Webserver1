*** Settings ***
Resource            ${EXECDIR}/WC/POM/ManagementConsole/GlobalSettings/SystemLog.robot

*** Keywords ***
Download Forbidden File
    [Arguments]    ${uri}
    Execute JavaScript    window.location='/${Branch}/admin${uri}';
    Sleep     1s
    Page Should Contain    Forbidden

Get Systemlog File By Arbitrary Path Traversal
    Download Forbidden File     ${uriVerifyArbitraryPathTraversal}

Get Systemlog File By Wrong File Extension
    Download Forbidden File     ${uriVerifyFileExtension}