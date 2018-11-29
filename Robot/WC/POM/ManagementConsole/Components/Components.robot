*** Variables ***
${trComponent}    jquery=#ComponentsGrid .k-grid-content tr

*** Keywords ***
Go To System Components Page
    Go To MC Page    /Global%20settings/Components/
    Wait Until Page Contains Element    ${trComponent} .btnDelete

Go To EA2_800 Model Components Page
    Go To MC Page    /Models/EA2_800/Components/
    Wait Until Page Contains Element    ${trComponent} .btnDelete

Check System Components
    Page Should Not Contain Element     ${trComponent}:contains(ApplicationServer) .btnDelete
    Page Should Not Contain Element     ${trComponent}:contains(WebServer) .btnDelete
    Page Should Contain Element         ${trComponent}:contains(ModelRepositoryService) .btnDelete

Check EA2_800 Model Components
    Page Should Contain Element         ${trComponent}:contains(ClassicModelQueryService) .btnInfo:not(.disabled)
    Page Should Contain Element         ${trComponent}:contains(ClassicModelQueryService) .btnDownload:not(.disabled)
    Page Should Contain Element         ${trComponent}:contains(ClassicModelQueryService) .btnDelete:not(.disabled)
    Page Should Contain Element         ${trComponent}:contains(ModelAgentService) .btnInfo.disabled
    Page Should Contain Element         ${trComponent}:contains(ModelAgentService) .btnDownload.disabled
    Page Should Contain Element         ${trComponent}:contains(ModelAgentService) .btnDelete:not(.disabled)
    Page Should Contain Element         ${trComponent}:contains(ExtractionService) .btnInfo:not(.disabled)
    Page Should Contain Element         ${trComponent}:contains(ExtractionService) .btnDownload.disabled
    Page Should Contain Element         ${trComponent}:contains(ExtractionService) .btnDelete:not(.disabled)
