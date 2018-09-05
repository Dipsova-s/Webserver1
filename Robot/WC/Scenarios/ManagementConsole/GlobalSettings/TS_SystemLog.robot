*** Settings ***
Resource            ${EXECDIR}/WC/POM/ManagementConsole/GlobalSettings/SystemLog.robot

*** Keywords ***
Download Forbidden File
    [Arguments]    ${uri}
    Go To     ${uri}
    Page Should Contain    Forbidden

Get Systemlog File By Arbitrary Path Traversal
    Download Forbidden File     ${URL_MC}${uriVerifyArbitraryPathTraversal}

Get Systemlog File By Wrong File Extension
    Download Forbidden File     ${URL_MC}${uriVerifyFileExtension}