*** Variables ***
${trComponent}    jquery=#ComponentsGrid .k-grid-content tr
${btnComponentInfo}     .btnInfo
${tblmodelServerInfoData}   ModelServerInfoData
${btnCloseInfoPopup}        //span[@title='Close']/..
${tblmodelServerPopup}  popupModelServer

*** Keywords ***
Go To System Components Page
    Go To MC Page    /Global%20settings/Components/
    Wait Until Page Contains Element    ${trComponent} .btnDelete

Check System Components
    Page Should Contain Element         ${trComponent}:contains(ApplicationServer) .btnDelete.disabled
    Page Should Contain Element         ${trComponent}:contains(WebServer) .btnDelete:not(.disabled)
    Page Should Contain Element         ${trComponent}:contains(ModelRepositoryService) .btnDelete:not(.disabled)
    Page Should Contain Element         ${trComponent}:contains(ModelRepositoryService) .btnDownload.disabled
    Page Should Contain Element         ${trComponent}:contains(ModelRepositoryService) .btnInfo.disabled
    Page Should Contain Element         ${trComponent}:contains(RealtimeModelQueryService):contains(EA2_800) .btnInfo:not(.disabled)
    Page Should Contain Element         ${trComponent}:contains(RealtimeModelQueryService):contains(EA2_800) .btnDownload:not(.disabled)
    Page Should Contain Element         ${trComponent}:contains(RealtimeModelQueryService):contains(EA2_800) .btnDelete:not(.disabled)
    Page Should Contain Element         ${trComponent}:contains(ModelAgentService) .btnInfo.disabled
    Page Should Contain Element         ${trComponent}:contains(ModelAgentService) .btnDownload.disabled
    Page Should Contain Element         ${trComponent}:contains(ModelAgentService) .btnDelete:not(.disabled)
    Page Should Contain Element         ${trComponent}:contains(ExtractionService) .btnInfo:not(.disabled)
    Page Should Contain Element         ${trComponent}:contains(ExtractionService) .btnDownload.disabled
    Page Should Contain Element         ${trComponent}:contains(ExtractionService) .btnDelete:not(.disabled)
    Page Should Contain Element         ${trComponent}:contains(ITManagementConsole) .btnDelete:not(.disabled)

Click on Action drop down and select Info option for Extraction service Component
    Wait Until Element Exist And Visible  ${trComponent}
    Click Element   ${trComponent}
    Click Show Action Dropdown In Grid By Name   ExtractionService     ${trComponent}
    Click Action In Grid By Name  ExtractionService  ${trComponent}  ${btnComponentInfo}
    Wait Progress Bar Closed
    Wait Until Ajax Complete
    Wait until page contains Element    ${tblmodelServerInfoData}

Check Info popup displayed for Extraction Service
    Page should contain     ExtractionService
    Page should contain     Version
    Page should contain     Status
    Page should contain     EA ETL Sandbox started
    Page should contain     Errors
    Page should contain     Warnings
    Page should contain     Status details
    Page should contain     Action list
    Page should contain     Current action
    Page should contain     Extracting tables
    Page should contain     Copying tables
    Page should contain     Indexing tables
    Page should contain     External applications

Click on Close button in Component Info popup
    Click Element  ${btnCloseInfoPopup}

Click on Action drop down and select Info option for Model query service Component
    Wait Until Element Exist And Visible  ${trComponent}
    Click Element   ${trComponent}
    Click Show Action Dropdown In Grid By Names   RealtimeModelQueryService     EA2_800   ${trComponent}
    Click Main Action In Grid By Names   RealtimeModelQueryService      EA2_800  ${trComponent}  ${btnComponentInfo}
    Wait Progress Bar Closed
    Wait Until Ajax Complete
    Wait until page contains Element    ${tblmodelServerPopup}

Click on Action drop down for the component in component page
    [Arguments]     ${componentName}    ${modelId}
    Click Show Action Dropdown In Grid By Names   ${componentName}      ${modelId}   ${trComponent}

Verify the component action drop down options state for the component
    [Arguments]     ${componentName}
    ${componentStatus}  Get Text    xpath=//div[@id='ComponentsGrid']//table//tr/td/label[text()='${componentName}']/ancestor::tr/td[8]/span
    run keyword if  '${componentStatus}' == 'Not available'     Wait until page contains Element    //div[@id='ComponentsGrid']//table//tr/td/label[text()='${componentName}']/ancestor::tr/td[11]//div[@class='btnGroupInner']/a[@class='btn btnDownload disabled']
    run keyword if  '${componentStatus}' == 'Available'     Wait until page contains Element    //div[@id='ComponentsGrid']//table//tr/td/label[text()='${componentName}']/ancestor::tr/td[11]//div[@class='btnGroupInner']/a[@class='btn btnDownload']