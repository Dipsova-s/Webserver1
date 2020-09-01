*** Variables ***
${iconHelpWc}              id=HelpIcon
${optionHelpPage}        //a[@class='actionDropdownItem btnHelp']/span[contains(text(),'Help page')]
${titleHelpPages}        //div[@class='titlepage']/div/div[2]/h3[contains(text(),'Help pages')]
${leftPanelHelpPage}      //aside[@class='site-sidebar']
${expectedHeaderElement}          //div[@class='title']/h1
${expectedHeader2Element}          //div[@class='title']/h2
${searchBar}                //input[@id='search']
${searchResultsContainer}   //div[@class='search-container']/ul
${nextPageNavigation}       //div[@id='top-pager']/descendant::a[contains(@id,'next')]
${prevPageNavigation}       //div[@id='top-pager']/descendant::a[contains(@id,'prev')]

*** Keywords ***
Click On Help Page Option
    Wait Until Element Is Visible      ${optionHelpPage}
    Click Element     ${optionHelpPage}

Search for Item using Search bar
    [Arguments]     ${searchText}
    Custom click element    ${searchBar}
    Input Text      ${searchBar}    ${searchText}
    Wait Until Ajax Complete
    Element Should Contain      ${searchResultsContainer}   ${searchText}
    Click Element   //div[@class='search-container']/ul/li/a/h3[contains(text(), '${searchText}')]

Click on Next page Navigation Arrow
    Click Element   ${nextPageNavigation}

Click on Previous page Navigation Arrow
    Click Element   ${prevPageNavigation}

Click on Breadcrumb link
    [Arguments]     ${expectedLinkText}
    Click Element   //ul[@class='breadcrumb']/li/a[contains(text(),'${expectedLinkText}')]

Click on Item in Left Panel
    [Arguments]     ${expectedLinkText}
    Click Element   //ul[contains(@class,'site-sidebar')]/descendant::li/descendant::li/a[contains(text(),'${expectedLinkText}')]


