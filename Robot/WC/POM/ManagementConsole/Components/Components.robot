*** Variables ***
${trComponent}    jquery=#ComponentsGrid .k-grid-content tr
${btnComponentInfo}     .btnInfo
${tblmodelServerInfoData}   ModelServerInfoData
${btnCloseInfoPopup}        //span[@title='Close']
${tblmodelServerPopup}  popupModelServer

*** Keywords ***
Go To System Components Page
    Go To MC Page    /Global%20settings/Components/
    Wait Until Page Contains Element    ${trComponent} .btnDelete

Check System Components
    Page Should Contain Element         ${trComponent}:contains(ApplicationServer) .btnDelete.disabled
    Page Should Contain Element         ${trComponent}:contains(WebServer) .btnDelete.disabled
    Page Should Contain Element         ${trComponent}:contains(ModelRepositoryService) .btnDelete:not(.disabled)
    Page Should Contain Element         ${trComponent}:contains(ModelRepositoryService) .btnDownload.disabled
    Page Should Contain Element         ${trComponent}:contains(ModelRepositoryService) .btnInfo.disabled
    Page Should Contain Element         ${trComponent}:contains(ClassicModelQueryService) .btnInfo:not(.disabled)
    Page Should Contain Element         ${trComponent}:contains(ClassicModelQueryService) .btnDownload:not(.disabled)
    Page Should Contain Element         ${trComponent}:contains(ClassicModelQueryService) .btnDelete:not(.disabled)
    Page Should Contain Element         ${trComponent}:contains(ModelAgentService) .btnInfo.disabled
    Page Should Contain Element         ${trComponent}:contains(ModelAgentService) .btnDownload.disabled
    Page Should Contain Element         ${trComponent}:contains(ModelAgentService) .btnDelete:not(.disabled)
    Page Should Contain Element         ${trComponent}:contains(ExtractionService) .btnInfo:not(.disabled)
    Page Should Contain Element         ${trComponent}:contains(ExtractionService) .btnDownload.disabled
    Page Should Contain Element         ${trComponent}:contains(ExtractionService) .btnDelete:not(.disabled)

Click on Action drop down and select Info option for Extraction service Component
    Wait Until Element Exist And Visible  ${trComponent}
    Click Element   ${trComponent}
    Click Show Action Dropdown In Grid By Name   ExtractionService     ${trComponent}
    Click Action In Grid By Name  ExtractionService  ${trComponent}  ${btnComponentInfo}
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
    Click Show Action Dropdown In Grid By Name   ClassicModelQueryService   ${trComponent}
    Click Main Action In Grid By Name   ClassicModelQueryService  ${trComponent}  ${btnComponentInfo}
    Wait Until Ajax Complete
    Wait until page contains Element    ${tblmodelServerPopup}