*** Settings ***
Resource            ${EXECDIR}/WC/POM/ManagementConsole/GlobalSettings/SystemLog.robot
Resource            ${EXECDIR}/WC/POM/ManagementConsole/GlobalSettings/SystemLog/ApplicationServerLog.robot
Resource            ${EXECDIR}/WC/POM/ManagementConsole/GlobalSettings/SystemLog/ManagementConsoleLog.robot
Resource            ${EXECDIR}/WC/POM/ManagementConsole/GlobalSettings/SystemLog/WebClientLog.robot
Resource            ${EXECDIR}/WC/POM/ManagementConsole/GlobalSettings/SystemLog/ModelServerLog.robot
Resource            ${EXECDIR}/WC/POM/ManagementConsole/SystemLogs/Repository.robot

*** Keywords ***
Download Forbidden File
    [Arguments]    ${url}
    Execute JavaScript    MC.util.download('/${Branch}/admin${url}');
    Sleep     1s
    Page Should Contain    Forbidden

Get Systemlog File By Arbitrary Path Traversal
    Download Forbidden File     ${uriVerifyArbitraryPathTraversal}

Get Systemlog File By Wrong File Extension
    Download Forbidden File     ${uriVerifyFileExtension}